// ============================================================
// SIRIUS — Store / Phase 3 Types
// ============================================================

export type ProductCategory =
  | 'حبوب_وأرز'
  | 'زيوت_وسمن'
  | 'سكر_وملح'
  | 'مياه_ومشروبات'
  | 'معلبات'
  | 'منظفات'
  | 'ورقيات'
  | 'بقوليات'
  | 'توابل'
  | 'متنوع';

export const CATEGORY_LABELS: Record<ProductCategory, string> = {
  حبوب_وأرز: 'حبوب وأرز',
  زيوت_وسمن: 'زيوت وسمن',
  سكر_وملح: 'سكر وملح',
  مياه_ومشروبات: 'مياه ومشروبات',
  معلبات: 'معلبات',
  منظفات: 'منظفات',
  ورقيات: 'ورقيات',
  بقوليات: 'بقوليات',
  توابل: 'توابل',
  متنوع: 'متنوع',
};

export type StockStatus = 'available' | 'low' | 'out';

export const STOCK_LABELS: Record<StockStatus, string> = {
  available: 'متوفر',
  low: 'كمية محدودة',
  out: 'نفذ المخزون',
};

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  warehouseId: string;
  price: number; // per unit (SAR)
  unit: string; // e.g. "كرتون", "كيس", "علبة"
  packageSize: string; // e.g. "12 × 1L"
  stock: number; // available units
  stockStatus: StockStatus;
  description: string;
  imageColor: string; // CSS color for placeholder
  isFeatured?: boolean;
}

export interface Warehouse {
  id: string;
  name: string;
  city: string;
  address: string;
  phone: string;
  productCount: number;
  isOpen: boolean;
  rating: number; // 1-5
  deliveryDays: number; // estimated delivery
  categories: ProductCategory[];
}

export type OrderStatus =
  | 'pending'
  | 'accepted'
  | 'rejected'
  | 'processing'
  | 'ready'
  | 'shipped'
  | 'completed';

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'قيد الانتظار',
  accepted: 'مقبول',
  rejected: 'مرفوض',
  processing: 'قيد التجهيز',
  ready: 'جاهز للإرسال',
  shipped: 'تم الإرسال',
  completed: 'مكتمل',
};

export type OrderStatusBadgeVariant = 'warning' | 'success' | 'error' | 'info' | 'neutral';

export const ORDER_STATUS_BADGE: Record<OrderStatus, OrderStatusBadgeVariant> = {
  pending: 'warning',
  accepted: 'info',
  rejected: 'error',
  processing: 'info',
  ready: 'success',
  shipped: 'success',
  completed: 'success',
};

export interface OrderItem {
  productId: string;
  productName: string;
  unit: string;
  quantity: number;
  unitPrice: number; // Price snapshot at order creation time
}

// ── Timeline event — stored on the Order itself ────────────
export interface TimelineEvent {
  id: string;
  status: OrderStatus;
  label: string;          // Human-readable Arabic label
  actorLabel: string;     // "بواسطة المتجر" | "بواسطة المستودع"
  timestamp: string;      // ISO
  note?: string;          // Optional: rejection reason, etc.
}

export interface Order {
  id: string;
  warehouseId: string;
  warehouseName: string;
  storeId: string;
  storeName: string;        // Snapshot at creation time
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  createdAt: string;        // ISO date string
  updatedAt: string;
  timeline: TimelineEvent[]; // Full audit trail
  rejectionReason?: string;
  inventoryDeducted: boolean; // Idempotency guard
  notes?: string;
}

export interface CartItem {
  productId: string;
  productName: string;
  warehouseId: string;
  warehouseName: string;
  quantity: number;
  unitPrice: number;
  unit: string;
  maxStock: number;
}

export interface StoreNotification {
  id: string;
  title: string;
  body: string;
  type: 'order_accepted' | 'order_rejected' | 'order_ready' | 'order_shipped' | 'order_completed' | 'general';
  orderId?: string;
  isRead: boolean;
  createdAt: string;
}

export interface StoreSettings {
  storeName: string;
  phone: string;
  address: string;
  city: string;
  notifyOnOrderAccepted: boolean;
  notifyOnOrderReady: boolean;
  notifyOnOrderShipped: boolean;
}

// Shared app state shape used by both Store and Warehouse phases
export interface SharedAppState {
  orders: Order[];
}

// ============================================================
// SIRIUS — Warehouse / Phase 4 Types
// ============================================================

export interface WarehouseProduct extends Product {
  minStock: number;        // low-stock threshold
  isActive: boolean;       // warehouse can deactivate products
  updatedAt: string;       // ISO date string
}

export interface WarehouseNotification {
  id: string;
  title: string;
  body: string;
  type: 'new_order' | 'order_cancelled' | 'low_stock' | 'general';
  orderId?: string;
  productId?: string;
  isRead: boolean;
  createdAt: string;
}

export interface WarehouseSettings {
  warehouseName: string;
  phone: string;
  address: string;
  city: string;
  isOpen: boolean;
  notifyOnNewOrder: boolean;
  notifyOnLowStock: boolean;
}

// Status transition map: what the warehouse can move an order to
export const ORDER_NEXT_STATUS: Partial<Record<OrderStatus, OrderStatus>> = {
  pending:    'accepted',
  accepted:   'processing',
  processing: 'ready',
  ready:      'shipped',
  shipped:    'completed',
};

export const ORDER_CAN_REJECT: OrderStatus[] = ['pending', 'accepted'];
