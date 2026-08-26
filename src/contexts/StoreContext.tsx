import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useReducer,
} from 'react';
import type { CartItem, StoreNotification, StoreSettings, Order } from '@/types/store';
import { MOCK_INITIAL_NOTIFICATIONS } from '@/data/mockData';
import { useApp } from '@/contexts/AppContext';

// ============================================================
// SIRIUS — Store Context (Phase 5 refactor)
//
// Orders are now delegated to AppContext (single source of
// truth).  StoreContext owns only:
//   • cart
//   • favorites
//   • store-side notifications
//   • store settings
// ============================================================

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
  cart:          'sirius-store-cart',
  favorites:     'sirius-store-favorites',
  notifications: 'sirius-store-notifications',
  settings:      'sirius-store-settings',
};

const DEFAULT_SETTINGS: StoreSettings = {
  storeName:               'متجر النور',
  phone:                   '0991-234-567',
  address:                 'شارع الرئيسي، رقم 12',
  city:                    'السويداء',
  notifyOnOrderAccepted:   true,
  notifyOnOrderReady:      true,
  notifyOnOrderShipped:    true,
};

// ── State ──────────────────────────────────────────────────
interface StoreState {
  cart:          CartItem[];
  favorites:     string[];
  notifications: StoreNotification[];
  settings:      StoreSettings;
}

type StoreAction =
  | { type: 'CART_ADD';                item: CartItem }
  | { type: 'CART_UPDATE_QTY';         productId: string; quantity: number }
  | { type: 'CART_REMOVE';             productId: string }
  | { type: 'CART_CLEAR_WAREHOUSE';    warehouseId: string }
  | { type: 'FAVORITES_TOGGLE';        productId: string }
  | { type: 'NOTIFICATIONS_MARK_READ'; id: string }
  | { type: 'NOTIFICATIONS_MARK_ALL_READ' }
  | { type: 'NOTIFICATIONS_ADD';       notification: StoreNotification }
  | { type: 'SETTINGS_UPDATE';         settings: Partial<StoreSettings> };

function reducer(state: StoreState, action: StoreAction): StoreState {
  switch (action.type) {
    case 'CART_ADD': {
      const existing = state.cart.find((i) => i.productId === action.item.productId);
      const cart = existing
        ? state.cart.map((i) =>
            i.productId === action.item.productId
              ? { ...i, quantity: Math.min(i.quantity + action.item.quantity, i.maxStock) }
              : i
          )
        : [...state.cart, action.item];
      save(KEYS.cart, cart);
      return { ...state, cart };
    }
    case 'CART_UPDATE_QTY': {
      const cart = state.cart.map((i) =>
        i.productId === action.productId
          ? { ...i, quantity: Math.max(1, Math.min(action.quantity, i.maxStock)) }
          : i
      );
      save(KEYS.cart, cart);
      return { ...state, cart };
    }
    case 'CART_REMOVE': {
      const cart = state.cart.filter((i) => i.productId !== action.productId);
      save(KEYS.cart, cart);
      return { ...state, cart };
    }
    case 'CART_CLEAR_WAREHOUSE': {
      const cart = state.cart.filter((i) => i.warehouseId !== action.warehouseId);
      save(KEYS.cart, cart);
      return { ...state, cart };
    }
    case 'FAVORITES_TOGGLE': {
      const favorites = state.favorites.includes(action.productId)
        ? state.favorites.filter((id) => id !== action.productId)
        : [...state.favorites, action.productId];
      save(KEYS.favorites, favorites);
      return { ...state, favorites };
    }
    case 'NOTIFICATIONS_MARK_READ': {
      const notifications = state.notifications.map((n) =>
        n.id === action.id ? { ...n, isRead: true } : n
      );
      save(KEYS.notifications, notifications);
      return { ...state, notifications };
    }
    case 'NOTIFICATIONS_MARK_ALL_READ': {
      const notifications = state.notifications.map((n) => ({ ...n, isRead: true }));
      save(KEYS.notifications, notifications);
      return { ...state, notifications };
    }
    case 'NOTIFICATIONS_ADD': {
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

// ── Context ─────────────────────────────────────────────────
interface StoreContextValue {
  // From AppContext (pass-through for convenience)
  orders: Order[];
  // Local state
  cart:          CartItem[];
  favorites:     string[];
  notifications: StoreNotification[];
  settings:      StoreSettings;
  // Derived
  cartCount:   number;
  cartTotal:   number;
  unreadCount: number;
  isFavorite:  (productId: string) => boolean;
  getCartItem: (productId: string) => CartItem | undefined;
  // Actions
  addToCart:              (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void;
  updateCartQty:          (productId: string, quantity: number) => void;
  removeFromCart:         (productId: string) => void;
  clearWarehouseCart:     (warehouseId: string) => void;
  toggleFavorite:         (productId: string) => void;
  markNotificationRead:   (id: string) => void;
  markAllNotificationsRead: () => void;
  addNotification:        (notification: StoreNotification) => void;
  updateSettings:         (settings: Partial<StoreSettings>) => void;
}

const StoreContext = createContext<StoreContextValue | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const app = useApp();

  const [state, dispatch] = useReducer(reducer, undefined, () => ({
    cart:          load<CartItem[]>(KEYS.cart, []),
    favorites:     load<string[]>(KEYS.favorites, []),
    notifications: load<StoreNotification[]>(KEYS.notifications, MOCK_INITIAL_NOTIFICATIONS),
    settings:      load<StoreSettings>(KEYS.settings, DEFAULT_SETTINGS),
  }));

  const cartCount = useMemo(() => state.cart.reduce((s, i) => s + i.quantity, 0), [state.cart]);
  const cartTotal = useMemo(() => state.cart.reduce((s, i) => s + i.quantity * i.unitPrice, 0), [state.cart]);
  const unreadCount = useMemo(() => state.notifications.filter((n) => !n.isRead).length, [state.notifications]);

  const isFavorite  = useCallback((id: string) => state.favorites.includes(id), [state.favorites]);
  const getCartItem = useCallback((id: string) => state.cart.find((i) => i.productId === id), [state.cart]);

  const addToCart = useCallback((item: Omit<CartItem, 'quantity'> & { quantity?: number }) => {
    dispatch({ type: 'CART_ADD', item: { ...item, quantity: item.quantity ?? 1 } });
  }, []);
  const updateCartQty      = useCallback((pid: string, qty: number) => dispatch({ type: 'CART_UPDATE_QTY',      productId: pid, quantity: qty }), []);
  const removeFromCart     = useCallback((pid: string)              => dispatch({ type: 'CART_REMOVE',           productId: pid }),               []);
  const clearWarehouseCart = useCallback((wid: string)              => dispatch({ type: 'CART_CLEAR_WAREHOUSE',  warehouseId: wid }),              []);
  const toggleFavorite     = useCallback((pid: string)              => dispatch({ type: 'FAVORITES_TOGGLE',      productId: pid }),                []);
  const markNotificationRead      = useCallback((id: string) => dispatch({ type: 'NOTIFICATIONS_MARK_READ',     id }),                            []);
  const markAllNotificationsRead  = useCallback(()            => dispatch({ type: 'NOTIFICATIONS_MARK_ALL_READ' }),                               []);
  const addNotification    = useCallback((n: StoreNotification)     => dispatch({ type: 'NOTIFICATIONS_ADD',     notification: n }),              []);
  const updateSettings     = useCallback((s: Partial<StoreSettings>)=> dispatch({ type: 'SETTINGS_UPDATE',       settings: s }),                  []);

  const value = useMemo<StoreContextValue>(() => ({
    orders:     app.orders,
    cart:       state.cart,
    favorites:  state.favorites,
    notifications: state.notifications,
    settings:   state.settings,
    cartCount, cartTotal, unreadCount,
    isFavorite, getCartItem,
    addToCart, updateCartQty, removeFromCart, clearWarehouseCart,
    toggleFavorite,
    markNotificationRead, markAllNotificationsRead, addNotification,
    updateSettings,
  }), [
    app.orders,
    state.cart, state.favorites, state.notifications, state.settings,
    cartCount, cartTotal, unreadCount,
    isFavorite, getCartItem,
    addToCart, updateCartQty, removeFromCart, clearWarehouseCart,
    toggleFavorite,
    markNotificationRead, markAllNotificationsRead, addNotification,
    updateSettings,
  ]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used inside StoreProvider');
  return ctx;
}
