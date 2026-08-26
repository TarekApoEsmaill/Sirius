import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useReducer,
  useMemo,
} from 'react';
import type { Order, WarehouseProduct, TimelineEvent } from '@/types/store';
import { MOCK_PRODUCTS, MOCK_INITIAL_ORDERS } from '@/data/mockData';
import { deriveStockStatus } from '@/lib/business';

// ============================================================
// SIRIUS — Shared AppContext  (Phase 5)
//
// Single source of truth for the two shared resource types:
//   • orders   — written by Store, updated by Warehouse
//   • products — managed by Warehouse, read by Store
//
// Both StoreContext and WarehouseContext delegate to this
// context so the data is never duplicated.
//
// Cross-tab sync: listens to the `storage` event so changes
// made in another tab are reflected immediately.
// ============================================================

const DEMO_WH_ID = 'wh-1';

// ── Storage keys (same as used previously, so existing demo
//    data in localStorage is preserved) ─────────────────────
const ORDERS_KEY   = 'sirius-store-orders';
const PRODUCTS_KEY = 'sirius-warehouse-products';

// ── Helpers ──────────────────────────────────────────────
function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw) as T;
  } catch { /* ignore */ }
  return fallback;
}
function save(key: string, value: unknown) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* ignore */ }
}

/** Seed initial warehouse products from mock data if not yet persisted. */
function buildInitialProducts(): WarehouseProduct[] {
  return MOCK_PRODUCTS
    .filter((p) => p.warehouseId === DEMO_WH_ID)
    .map((p) => ({
      ...p,
      minStock: 20,
      isActive: true,
      updatedAt: '2026-08-20T10:00:00',
    }));
}

/**
 * Migrate legacy orders: add missing fields introduced in Phase 5
 * so existing localStorage data stays valid.
 */
function migrateOrders(orders: Order[]): Order[] {
  return orders.map((o) => ({
    ...o,
    storeName:          (o as Order & { storeName?: string }).storeName ?? 'متجر النور',
    timeline:           (o as Order & { timeline?: TimelineEvent[] }).timeline ?? [],
    inventoryDeducted:  (o as Order & { inventoryDeducted?: boolean }).inventoryDeducted ?? false,
  }));
}

// ── State ─────────────────────────────────────────────────
interface AppState {
  orders:   Order[];
  products: WarehouseProduct[];
}

type AppAction =
  | { type: 'ORDER_ADD';              order: Order }
  | { type: 'ORDER_UPDATE';           order: Order }
  | { type: 'PRODUCT_ADD';            product: WarehouseProduct }
  | { type: 'PRODUCT_UPDATE';         product: WarehouseProduct }
  | { type: 'PRODUCTS_BATCH_UPDATE';  products: WarehouseProduct[] }
  | { type: 'PRODUCT_DELETE';         productId: string }
  | { type: 'PRODUCT_UPDATE_STOCK';   productId: string; stock: number }
  | { type: 'SYNC_ORDERS';            orders: Order[] }
  | { type: 'SYNC_PRODUCTS';          products: WarehouseProduct[] };

function reducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {

    case 'ORDER_ADD': {
      const orders = [action.order, ...state.orders];
      save(ORDERS_KEY, orders);
      return { ...state, orders };
    }

    case 'ORDER_UPDATE': {
      const orders = state.orders.map((o) =>
        o.id === action.order.id ? action.order : o
      );
      save(ORDERS_KEY, orders);
      return { ...state, orders };
    }

    case 'PRODUCT_ADD': {
      const products = [...state.products, action.product];
      save(PRODUCTS_KEY, products);
      return { ...state, products };
    }

    case 'PRODUCT_UPDATE': {
      const products = state.products.map((p) =>
        p.id === action.product.id ? action.product : p
      );
      save(PRODUCTS_KEY, products);
      return { ...state, products };
    }

    case 'PRODUCTS_BATCH_UPDATE': {
      // Replace all matching products in one pass — single render + single localStorage write
      const updateMap = new Map(action.products.map((p) => [p.id, p]));
      const products = state.products.map((p) => updateMap.get(p.id) ?? p);
      save(PRODUCTS_KEY, products);
      return { ...state, products };
    }

    case 'PRODUCT_DELETE': {
      const products = state.products.filter((p) => p.id !== action.productId);
      save(PRODUCTS_KEY, products);
      return { ...state, products };
    }

    case 'PRODUCT_UPDATE_STOCK': {
      const products = state.products.map((p) => {
        if (p.id !== action.productId) return p;
        const stock = Math.max(0, action.stock);
        return {
          ...p,
          stock,
          stockStatus: deriveStockStatus(stock, p.minStock),
          updatedAt: new Date().toISOString(),
        };
      });
      save(PRODUCTS_KEY, products);
      return { ...state, products };
    }

    // Cross-tab sync — replace in-memory state with what another tab wrote
    case 'SYNC_ORDERS':
      return { ...state, orders: action.orders };

    case 'SYNC_PRODUCTS':
      return { ...state, products: action.products };

    default:
      return state;
  }
}

// ── Context value ────────────────────────────────────────
interface AppContextValue {
  orders:   Order[];
  products: WarehouseProduct[];
  // Order operations
  addOrder:    (order: Order) => void;
  updateOrder: (order: Order) => void;
  // Product operations
  addProduct:          (product: WarehouseProduct) => void;
  updateProduct:       (product: WarehouseProduct) => void;
  batchUpdateProducts: (products: WarehouseProduct[]) => void;
  deleteProduct:       (productId: string) => void;
  updateProductStock:  (productId: string, stock: number) => void;
  // Helpers
  getOrderById:   (id: string) => Order | undefined;
  getProductById: (id: string) => WarehouseProduct | undefined;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, (): AppState => ({
    orders:   migrateOrders(load<Order[]>(ORDERS_KEY, MOCK_INITIAL_ORDERS)),
    products: load<WarehouseProduct[]>(PRODUCTS_KEY, buildInitialProducts()),
  }));

  // ── Cross-tab sync ─────────────────────────────────────
  useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (e.key === ORDERS_KEY && e.newValue) {
        try {
          const orders: Order[] = JSON.parse(e.newValue);
          dispatch({ type: 'SYNC_ORDERS', orders: migrateOrders(orders) });
        } catch { /* ignore */ }
      }
      if (e.key === PRODUCTS_KEY && e.newValue) {
        try {
          const products: WarehouseProduct[] = JSON.parse(e.newValue);
          dispatch({ type: 'SYNC_PRODUCTS', products });
        } catch { /* ignore */ }
      }
    }
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const addOrder    = useCallback((order: Order) =>   dispatch({ type: 'ORDER_ADD',    order }),   []);
  const updateOrder = useCallback((order: Order) =>   dispatch({ type: 'ORDER_UPDATE', order }),   []);

  const addProduct    = useCallback((p: WarehouseProduct) => dispatch({ type: 'PRODUCT_ADD',    product: p }), []);
  const updateProduct = useCallback((p: WarehouseProduct) => dispatch({ type: 'PRODUCT_UPDATE', product: p }), []);
  const batchUpdateProducts = useCallback((ps: WarehouseProduct[]) => dispatch({ type: 'PRODUCTS_BATCH_UPDATE', products: ps }), []);
  const deleteProduct = useCallback((id: string) =>          dispatch({ type: 'PRODUCT_DELETE', productId: id }), []);
  const updateProductStock = useCallback((id: string, stock: number) =>
    dispatch({ type: 'PRODUCT_UPDATE_STOCK', productId: id, stock }), []);

  const getOrderById   = useCallback((id: string) => state.orders.find((o) => o.id === id),   [state.orders]);
  const getProductById = useCallback((id: string) => state.products.find((p) => p.id === id), [state.products]);

  const value = useMemo<AppContextValue>(() => ({
    orders:   state.orders,
    products: state.products,
    addOrder, updateOrder,
    addProduct, updateProduct, batchUpdateProducts, deleteProduct, updateProductStock,
    getOrderById, getProductById,
  }), [
    state.orders, state.products,
    addOrder, updateOrder,
    addProduct, updateProduct, batchUpdateProducts, deleteProduct, updateProductStock,
    getOrderById, getProductById,
  ]);

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
