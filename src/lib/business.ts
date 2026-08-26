// ============================================================
// SIRIUS — Business Logic Utilities (Phase 5)
// Centralised rules: IDs, dates, currency, stock, transitions,
// notification factories.  No UI imports allowed here.
// ============================================================

import type {
  OrderStatus,
  StockStatus,
  StoreNotification,
  WarehouseNotification,
  TimelineEvent,
} from '@/types/store';

// ── ID Generation ─────────────────────────────────────────
let _orderCounter = 0;

/**
 * Generates a readable, collision-resistant order ID.
 * Format:  SR-YYYYMMDD-XXXX  (date prefix + 4-char random hex)
 */
export function generateOrderId(): string {
  const now = new Date();
  const date = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0'),
  ].join('');
  const rand = Math.floor(Math.random() * 0xffff)
    .toString(16)
    .toUpperCase()
    .padStart(4, '0');
  _orderCounter++;
  return `SR-${date}-${rand}`;
}

/** Generic deterministic ID from a scope + value. */
export function makeId(scope: string): string {
  return `${scope}-${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 7)}`;
}

// ── Date / Time ───────────────────────────────────────────

/**
 * Formats an ISO date string as a human-readable Arabic date+time.
 * Uses "اليوم" / "أمس" shortcuts when appropriate.
 */
export function formatArabicDateTime(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const todayStr  = now.toDateString();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);

  const timeStr = d.toLocaleTimeString('ar-SA', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  if (d.toDateString() === todayStr) return `اليوم، ${timeStr}`;
  if (d.toDateString() === yesterday.toDateString()) return `أمس، ${timeStr}`;

  return d.toLocaleDateString('ar-SA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

/** Date only (no time). */
export function formatArabicDate(iso: string): string {
  return new Date(iso).toLocaleDateString('ar-SA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/** Short date — "12 يناير". */
export function formatArabicDateShort(iso: string): string {
  return new Date(iso).toLocaleDateString('ar-SA', {
    month: 'short',
    day: 'numeric',
  });
}

// ── Currency ─────────────────────────────────────────────

/** Formats a number as "١٢٬٠٠٠ ل.س" using Arabic-Indic numerals. */
export function formatSYP(amount: number): string {
  return `${new Intl.NumberFormat('ar-SA').format(amount)} ل.س`;
}

// ── Inventory / Stock ─────────────────────────────────────

/**
 * Derives the StockStatus from quantity and low-stock threshold.
 * This is the single canonical rule used across the whole app.
 */
export function deriveStockStatus(stock: number, minStock: number): StockStatus {
  if (stock <= 0)        return 'out';
  if (stock <= minStock) return 'low';
  return 'available';
}

// ── Order Transitions ─────────────────────────────────────

/**
 * Valid forward transitions only (no skips, no backward moves).
 */
export const VALID_TRANSITIONS: Partial<Record<OrderStatus, OrderStatus>> = {
  pending:    'accepted',
  accepted:   'processing',
  processing: 'ready',
  ready:      'shipped',
  shipped:    'completed',
};

/** Statuses from which the warehouse can still reject. */
export const REJECTABLE_STATUSES: ReadonlySet<OrderStatus> = new Set<OrderStatus>([
  'pending',
  'accepted',
]);

/**
 * Returns the next valid status, or null if already terminal.
 */
export function getNextStatus(current: OrderStatus): OrderStatus | null {
  return VALID_TRANSITIONS[current] ?? null;
}

/**
 * Returns true if the transition from → to is valid.
 */
export function isValidTransition(from: OrderStatus, to: OrderStatus): boolean {
  if (to === 'rejected') return REJECTABLE_STATUSES.has(from);
  return VALID_TRANSITIONS[from] === to;
}

// ── Timeline Events ───────────────────────────────────────

type Actor = 'store' | 'warehouse' | 'system';

const ACTOR_LABELS: Record<Actor, string> = {
  store:     'بواسطة المتجر',
  warehouse: 'بواسطة المستودع',
  system:    'النظام',
};

const STATUS_TIMELINE_LABELS: Record<OrderStatus, string> = {
  pending:    'تم إرسال الطلب',
  accepted:   'تمت الموافقة على الطلب',
  rejected:   'تم رفض الطلب',
  processing: 'الطلب قيد التجهيز',
  ready:      'الطلب جاهز للإرسال',
  shipped:    'تم إرسال الطلب',
  completed:  'اكتمل الطلب',
};

export function makeTimelineEvent(
  status: OrderStatus,
  actor: Actor,
  note?: string
): TimelineEvent {
  return {
    id:        makeId('te'),
    status,
    label:     STATUS_TIMELINE_LABELS[status],
    actorLabel: ACTOR_LABELS[actor],
    timestamp: new Date().toISOString(),
    note,
  };
}

// ── Notification Factories ────────────────────────────────

/** Creates the store notification when an order is submitted. */
export function makeStoreOrderSubmittedNotif(
  orderId: string,
  warehouseName: string
): StoreNotification {
  return {
    id:        makeId('sn'),
    title:     'تم إرسال الطلب بنجاح',
    body:      `تم إرسال طلبك #${orderId} إلى ${warehouseName}. بانتظار موافقة المستودع.`,
    type:      'general',
    orderId,
    isRead:    false,
    createdAt: new Date().toISOString(),
  };
}

/** Creates the warehouse notification when a new order arrives. */
export function makeWarehouseNewOrderNotif(
  orderId: string,
  storeName: string
): WarehouseNotification {
  return {
    id:        makeId('wn'),
    title:     'طلب جديد وارد',
    body:      `تلقيت طلباً جديداً #${orderId} من ${storeName}.`,
    type:      'new_order',
    orderId,
    isRead:    false,
    createdAt: new Date().toISOString(),
  };
}

/** Creates the store notification when an order status changes. */
export function makeStoreStatusChangeNotif(
  orderId: string,
  newStatus: OrderStatus,
  rejectionReason?: string
): StoreNotification {
  const statusMessages: Partial<Record<OrderStatus, { title: string; body: string; type: StoreNotification['type'] }>> = {
    accepted:   {
      title: 'تم قبول طلبك',
      body:  `تم قبول الطلب #${orderId} وهو قيد المعالجة.`,
      type:  'order_accepted',
    },
    rejected:   {
      title: 'تم رفض طلبك',
      body:  rejectionReason
        ? `تم رفض الطلب #${orderId}. السبب: ${rejectionReason}`
        : `تم رفض الطلب #${orderId} من قبل المستودع.`,
      type:  'order_rejected',
    },
    ready:      {
      title: 'طلبك جاهز',
      body:  `الطلب #${orderId} جاهز للإرسال.`,
      type:  'order_ready',
    },
    shipped:    {
      title: 'تم شحن طلبك',
      body:  `الطلب #${orderId} في الطريق إليك.`,
      type:  'order_shipped',
    },
    completed:  {
      title: 'اكتمل طلبك',
      body:  `تم استلام وتأكيد الطلب #${orderId} بنجاح.`,
      type:  'order_completed',
    },
  };

  const msg = statusMessages[newStatus] ?? {
    title: `تحديث على الطلب #${orderId}`,
    body:  `حالة الطلب تغيرت إلى: ${newStatus}`,
    type:  'general' as const,
  };

  return {
    id:        makeId('sn'),
    title:     msg.title,
    body:      msg.body,
    type:      msg.type,
    orderId,
    isRead:    false,
    createdAt: new Date().toISOString(),
  };
}

/** Creates warehouse low-stock notification. */
export function makeWarehouseLowStockNotif(
  productId: string,
  productName: string,
  stock: number,
  unit: string
): WarehouseNotification {
  return {
    id:        makeId('wn'),
    title:     'مخزون منخفض',
    body:      `منتج "${productName}" وصل إلى مستوى منخفض (${stock} ${unit} متبقية).`,
    type:      'low_stock',
    productId,
    isRead:    false,
    createdAt: new Date().toISOString(),
  };
}

/** Creates warehouse notification when order status is advanced. */
export function makeWarehouseStatusAdvancedNotif(
  orderId: string,
  newStatus: OrderStatus
): WarehouseNotification {
  const label: Partial<Record<OrderStatus, string>> = {
    accepted:   'تمت الموافقة',
    processing: 'قيد التجهيز',
    ready:      'جاهز للإرسال',
    shipped:    'تم الشحن',
    completed:  'مكتمل',
  };
  return {
    id:        makeId('wn'),
    title:     `الطلب #${orderId}: ${label[newStatus] ?? newStatus}`,
    body:      `تم تحديث الطلب #${orderId} إلى حالة: ${label[newStatus] ?? newStatus}.`,
    type:      'general',
    orderId,
    isRead:    false,
    createdAt: new Date().toISOString(),
  };
}
