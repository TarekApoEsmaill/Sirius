import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useReducer,
} from 'react';
import type {
  Order,
  OrderStatus,
  WarehouseNotification,
  WarehouseSettings,
  WarehouseProduct,
} from '@/types/store';
import { useApp } from '@/contexts/AppContext';
import {
  isValidTransition,
  makeTimelineEvent,
  makeWarehouseStatusAdvancedNotif,
  makeWarehouseLowStockNotif,
  deriveStockStatus,
} from '@/lib/business';

// ============================================================
// SIRIUS — Warehouse Context (Phase 5 refactor)
//
// Products and orders delegate to AppContext.
// WarehouseContext owns only:
//   • warehouse-side notifications
//   • warehouse settings
//
// Inventory deduction happens idempotently on order accept:
//   Order.inventoryDeducted prevents double-deduction.
// ============================================================

const DEMO_WH_ID = 'wh-1';

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

const KEYS = {
  notifications: 'sirius-warehouse-notifications',
  settings:      'sirius-warehouse-settings',
};

const INITIAL_NOTIFICATIONS: WarehouseNotification[] = [
  {
    id: 'wn-001',
    title: 'طلب جديد وارد',
    body: 'تلقيت طلباً جديداً #SR-1025 من متجر النور.',
    type: 'new_order',
    orderId: 'SR-1025',
    isRead: false,
    createdAt: '2026-08-26T07:31:00',
  },
  {
    id: 'wn-002',
    title: 'مخزون منخفض',
    body: 'منتج "عدس أحمر مقشور" وصل إلى مستوى المخزون المنخفض (18 كيس).',
    type: 'low_stock',
    productId: 'p-004',
    isRead: false,
    createdAt: '2026-08-25T09:00:00',
  },
  {
    id: 'wn-003',
    title: 'تم تأكيد الطلب',
    body: 'الطلب #SR-1024 قيد المعالجة الآن.',
    type: 'general',
    orderId: 'SR-1024',
    isRead: true,
    createdAt: '2026-08-25T12:05:00',
  },
];

const DEFAULT_SETTINGS: WarehouseSettings = {
  warehouseName:    'مستودع السويداء المركزي',
  phone:            '011-221-3344',
  address:          'المنطقة الصناعية، طريق دمشق',
  city:             'السويداء',
  isOpen:           true,
  notifyOnNewOrder: true,
  notifyOnLowStock: true,
};

// ── Local state (notifications + settings only) ────────────
interface WarehouseState {
  notifications: WarehouseNotification[];
  settings:      WarehouseSettings;
}

type WarehouseAction =
  | { type: 'NOTIF_MARK_READ';    id: string }
  | { type: 'NOTIF_MARK_ALL_READ' }
  | { type: 'NOTIF_ADD';          notification: WarehouseNotification }
  | { type: 'SETTINGS_UPDATE';    settings: Partial<WarehouseSettings> };

function reducer(state: WarehouseState, action: WarehouseAction): WarehouseState {
  switch (action.type) {
    case 'NOTIF_MARK_READ': {
      const notifications = state.notifications.map((n) =>
        n.id === action.id ? { ...n, isRead: true } : n
      );
      save(KEYS.notifications, notifications);
      return { ...state, notifications };
    }
    case 'NOTIF_MARK_ALL_READ': {
      const notifications = state.notifications.map((n) => ({ ...n, isRead: true }));
      save(KEYS.notifications, notifications);
      return { ...state, notifications };
    }
    case 'NOTIF_ADD': {
      const notifications = [action.notification, ...state.notifications];
      save(KEYS.notifications, notifications);
      return { ...state, notifications };
    }
    case 'SETTINGS_UPDATE': {
      const settings = { ...state.settings, ...action.settings };
      save(KEYS.settings, settings);
      return { ...state, settings };
    }
    default:
      return state;
  }
}

// ── Context value ────────────────────────────────────────
interface WarehouseContextValue {
  // From AppContext
  products: WarehouseProduct[];
  orders:   Order[];
  // Local
  notifications: WarehouseNotification[];
  settings:      WarehouseSettings;
  // Derived
  unreadCount:        number;
  lowStockProducts:   WarehouseProduct[];
  pendingOrderCount:  number;
  // Product actions (delegate to AppContext)
  addProduct:         (product: WarehouseProduct) => void;
  updateProduct:      (product: WarehouseProduct) => void;
  deleteProduct:      (productId: string) => void;
  updateStock:        (productId: string, stock: number) => void;
  // Order actions
  updateOrderStatus:  (orderId: string, status: OrderStatus, note?: string) => void;
  // Notification actions
  markNotificationRead:      (id: string) => void;
  markAllNotificationsRead:  () => void;
  addNotification:           (notification: WarehouseNotification) => void;
  // Settings
  updateSettings: (settings: Partial<WarehouseSettings>) => void;
}

const WarehouseContext = createContext<WarehouseContextValue | null>(null);

export function WarehouseProvider({ children }: { children: React.ReactNode }) {
  const app = useApp();

  const [state, dispatch] = useReducer(reducer, undefined, () => ({
    notifications: load<WarehouseNotification[]>(KEYS.notifications, INITIAL_NOTIFICATIONS),
    settings:      load<WarehouseSettings>(KEYS.settings, DEFAULT_SETTINGS),
  }));

  // ── Derived ──────────────────────────────────────────────
  const warehouseProducts = useMemo(
    () => app.products.filter((p) => p.warehouseId === DEMO_WH_ID),
    [app.products]
  );
  const warehouseOrders = useMemo(
    () => app.orders.filter((o) => o.warehouseId === DEMO_WH_ID),
    [app.orders]
  );
  const unreadCount = useMemo(
    () => state.notifications.filter((n) => !n.isRead).length,
    [state.notifications]
  );
  const lowStockProducts = useMemo(
    () => warehouseProducts.filter((p) => p.stockStatus === 'low' || p.stockStatus === 'out'),
    [warehouseProducts]
  );
  const pendingOrderCount = useMemo(
    () => warehouseOrders.filter((o) => o.status === 'pending').length,
    [warehouseOrders]
  );

  // ── Product actions ──────────────────────────────────────
  const addProduct    = useCallback((p: WarehouseProduct) => app.addProduct(p),    [app]);
  const updateProduct = useCallback((p: WarehouseProduct) => app.updateProduct(p), [app]);
  const deleteProduct = useCallback((id: string) => app.deleteProduct(id),          [app]);

  const updateStock = useCallback((productId: string, stock: number) => {
    app.updateProductStock(productId, stock);
    // Auto-generate low-stock notification if threshold crossed
    const product = app.products.find((p) => p.id === productId);
    if (product && state.settings.notifyOnLowStock) {
      const newStatus = deriveStockStatus(Math.max(0, stock), product.minStock);
      if (newStatus === 'low' || newStatus === 'out') {
        dispatch({
          type: 'NOTIF_ADD',
          notification: makeWarehouseLowStockNotif(
            product.id, product.name, Math.max(0, stock), product.unit
          ),
        });
      }
    }
  }, [app, state.settings.notifyOnLowStock]);

  // ── Order status update (core business logic) ────────────
  const updateOrderStatus = useCallback((
    orderId: string,
    newStatus: OrderStatus,
    note?: string,
  ) => {
    const order = app.orders.find((o) => o.id === orderId);
    if (!order) return;
    if (!isValidTransition(order.status, newStatus)) return; // guard invalid moves

    const now = new Date().toISOString();
    let inventoryDeducted = order.inventoryDeducted;

    // ── Idempotent inventory deduction on first acceptance ──
    // Computed in one pass, written with a single batch update.
    if (newStatus === 'accepted' && !order.inventoryDeducted) {
      inventoryDeducted = true;

      // Build map of productId → quantity ordered
      const deductionMap = new Map<string, number>();
      for (const item of order.items) {
        deductionMap.set(item.productId, (deductionMap.get(item.productId) ?? 0) + item.quantity);
      }

      // Compute updated products in one pass
      const productsToUpdate: WarehouseProduct[] = [];
      for (const [productId, qty] of deductionMap) {
        const product = app.products.find((p) => p.id === productId);
        if (!product) continue;
        const newStock      = Math.max(0, product.stock - qty);
        const newStockStatus = deriveStockStatus(newStock, product.minStock);
        productsToUpdate.push({ ...product, stock: newStock, stockStatus: newStockStatus, updatedAt: now });
        if (state.settings.notifyOnLowStock && (newStockStatus === 'low' || newStockStatus === 'out')) {
          dispatch({
            type: 'NOTIF_ADD',
            notification: makeWarehouseLowStockNotif(product.id, product.name, newStock, product.unit),
          });
        }
      }

      // Single batch write — one dispatch, one localStorage write
      if (productsToUpdate.length > 0) {
        app.batchUpdateProducts(productsToUpdate);
      }
    }

    // ── Build timeline event ────────────────────────────────
    const timelineEvent = makeTimelineEvent(
      newStatus,
      newStatus === 'pending' ? 'store' : 'warehouse',
      note
    );

    const updatedOrder: Order = {
      ...order,
      status:            newStatus,
      updatedAt:         now,
      rejectionReason:   newStatus === 'rejected' ? (note ?? 'لم يُذكر سبب') : order.rejectionReason,
      inventoryDeducted,
      timeline:          [...order.timeline, timelineEvent],
    };

    app.updateOrder(updatedOrder);

    // ── Warehouse notification ──────────────────────────────
    dispatch({
      type: 'NOTIF_ADD',
      notification: makeWarehouseStatusAdvancedNotif(orderId, newStatus),
    });
  }, [app, state.settings.notifyOnLowStock]);

  const markNotificationRead     = useCallback((id: string) => dispatch({ type: 'NOTIF_MARK_READ', id }),         []);
  const markAllNotificationsRead = useCallback(() =>            dispatch({ type: 'NOTIF_MARK_ALL_READ' }),         []);
  const addNotification          = useCallback((n: WarehouseNotification) => dispatch({ type: 'NOTIF_ADD', notification: n }), []);
  const updateSettings           = useCallback((s: Partial<WarehouseSettings>) => dispatch({ type: 'SETTINGS_UPDATE', settings: s }), []);

  const value = useMemo<WarehouseContextValue>(() => ({
    products: warehouseProducts,
    orders:   warehouseOrders,
    notifications: state.notifications,
    settings:      state.settings,
    unreadCount, lowStockProducts, pendingOrderCount,
    addProduct, updateProduct, deleteProduct, updateStock,
    updateOrderStatus,
    markNotificationRead, markAllNotificationsRead, addNotification,
    updateSettings,
  }), [
    warehouseProducts, warehouseOrders,
    state.notifications, state.settings,
    unreadCount, lowStockProducts, pendingOrderCount,
    addProduct, updateProduct, deleteProduct, updateStock,
    updateOrderStatus,
    markNotificationRead, markAllNotificationsRead, addNotification,
    updateSettings,
  ]);

  return <WarehouseContext.Provider value={value}>{children}</WarehouseContext.Provider>;
}

export function useWarehouse() {
  const ctx = useContext(WarehouseContext);
  if (!ctx) throw new Error('useWarehouse must be used inside WarehouseProvider');
  return ctx;
}
