import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShoppingCart, Trash2, Minus, Plus, Warehouse as WarehouseIcon,
  AlertCircle, CheckCircle2, AlertTriangle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ContentContainer } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/common/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { useStore } from '@/contexts/StoreContext';
import { useApp } from '@/contexts/AppContext';
import { useWarehouse } from '@/contexts/WarehouseContext';
import { useToast } from '@/components/ui/Toast';
import {
  generateOrderId,
  makeTimelineEvent,
  makeStoreOrderSubmittedNotif,
  makeWarehouseNewOrderNotif,
} from '@/lib/business';
import { MOCK_WAREHOUSES } from '@/data/mockData';
import type { CartItem, Order, OrderItem } from '@/types/store';

// ============================================================
// Store — Cart  /store/cart
// ============================================================

// Group cart items by warehouse
function groupByWarehouse(cart: CartItem[]): Map<string, CartItem[]> {
  const map = new Map<string, CartItem[]>();
  for (const item of cart) {
    const existing = map.get(item.warehouseId) ?? [];
    map.set(item.warehouseId, [...existing, item]);
  }
  return map;
}

// ── Quantity control ─────────────────────────────────────────
function QuantityControl({
  item,
  onUpdate,
  onRemove,
}: {
  item: CartItem;
  onUpdate: (qty: number) => void;
  onRemove: () => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center border border-[var(--border-default)] rounded-[var(--radius-md)] overflow-hidden">
        <button
          onClick={() => { if (item.quantity <= 1) onRemove(); else onUpdate(item.quantity - 1); }}
          aria-label="تقليل الكمية"
          className="flex items-center justify-center w-8 h-8 text-[var(--text-muted)] hover:bg-[var(--interactive-secondary)] hover:text-[var(--text-primary)] transition-colors focus-visible:outline-none"
        >
          <Minus size={13} aria-hidden="true" />
        </button>
        <motion.span
          key={item.quantity}
          initial={{ scale: 0.8, opacity: 0.5 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.12 }}
          className="w-9 text-center text-sm font-semibold text-[var(--text-primary)]"
          aria-live="polite"
          aria-label={`الكمية: ${item.quantity}`}
        >
          {item.quantity}
        </motion.span>
        <button
          onClick={() => onUpdate(item.quantity + 1)}
          disabled={item.quantity >= item.maxStock}
          aria-label="زيادة الكمية"
          className="flex items-center justify-center w-8 h-8 text-[var(--text-muted)] hover:bg-[var(--interactive-secondary)] hover:text-[var(--text-primary)] transition-colors focus-visible:outline-none disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Plus size={13} aria-hidden="true" />
        </button>
      </div>
      <button
        onClick={onRemove}
        aria-label={`حذف ${item.productName} من السلة`}
        className="flex items-center justify-center w-8 h-8 rounded-[var(--radius-md)] text-[var(--text-muted)] hover:text-red-500 hover:bg-red-500/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400/40"
      >
        <Trash2 size={14} aria-hidden="true" />
      </button>
    </div>
  );
}

// ── Validation result ─────────────────────────────────────────
interface ValidationIssue {
  productName: string;
  reason: string;
}

// ── Confirm modal ─────────────────────────────────────────────
interface ConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  warehouseName: string;
  items: CartItem[];
  total: number;
}

function ConfirmOrderModal({ open, onClose, onConfirm, warehouseName, items, total }: ConfirmModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="مراجعة الطلب"
      description={`سيتم إرسال الطلب إلى ${warehouseName}`}
      size="md"
      footer={
        <>
          <Button variant="ghost" size="sm" onClick={onClose}>إلغاء</Button>
          <Button variant="primary" size="sm" onClick={onConfirm} iconStart={<CheckCircle2 size={15} />}>
            تأكيد وإرسال الطلب
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-start gap-2 p-3 rounded-[var(--radius-md)] bg-[var(--status-info-bg)] border border-[var(--status-info-border)]">
          <AlertCircle size={15} className="text-[var(--status-info-text)] shrink-0 mt-0.5" aria-hidden="true" />
          <p className="text-xs text-[var(--status-info-text)]">
            الدفع عند استلام البضاعة. سيتم إشعارك بحالة طلبك عبر الإشعارات.
          </p>
        </div>
        <div className="divide-y divide-[var(--border-subtle)] border border-[var(--border-subtle)] rounded-[var(--radius-md)] overflow-hidden">
          {items.map((item) => (
            <div key={item.productId} className="flex items-center justify-between gap-3 px-4 py-2.5">
              <div className="min-w-0">
                <p className="text-sm font-medium text-[var(--text-primary)] truncate">{item.productName}</p>
                <p className="text-xs text-[var(--text-muted)]">{item.quantity} {item.unit}</p>
              </div>
              <span className="text-sm font-semibold text-[var(--text-primary)] shrink-0">
                {(item.quantity * item.unitPrice).toLocaleString('ar-SA')} ل.س
              </span>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between px-1">
          <span className="text-sm font-medium text-[var(--text-muted)]">الإجمالي</span>
          <span className="text-base font-black text-[var(--text-primary)]">
            {total.toLocaleString('ar-SA')} ل.س
          </span>
        </div>
      </div>
    </Modal>
  );
}

// ── Validation error modal ─────────────────────────────────────
interface ValidationModalProps {
  open: boolean;
  onClose: () => void;
  issues: ValidationIssue[];
}

function ValidationModal({ open, onClose, issues }: ValidationModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="تعذّر إرسال الطلب"
      size="sm"
      footer={<Button variant="primary" size="sm" onClick={onClose}>حسناً، سأراجع السلة</Button>}
    >
      <div className="flex flex-col gap-3">
        <p className="text-sm text-[var(--text-secondary)]">يرجى مراجعة المشكلات التالية قبل إرسال الطلب:</p>
        <div className="flex flex-col gap-2">
          {issues.map((issue, i) => (
            <div key={i} className="flex items-start gap-2 p-3 rounded-[var(--radius-md)] bg-[var(--status-error-bg)] border border-[var(--status-error-border)]">
              <AlertTriangle size={13} className="text-[var(--status-error-text)] shrink-0 mt-0.5" aria-hidden="true" />
              <div className="min-w-0">
                <p className="text-xs font-semibold text-[var(--status-error-text)]">{issue.productName}</p>
                <p className="text-xs text-[var(--status-error-text)] opacity-80">{issue.reason}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Modal>
  );
}

// ── Main component ────────────────────────────────────────────
export function StoreCart() {
  const { cart, updateCartQty, removeFromCart, clearWarehouseCart, addNotification, settings } = useStore();
  const app = useApp();
  const { addNotification: addWarehouseNotif } = useWarehouse();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [confirmState, setConfirmState] = useState<{
    warehouseId: string;
    warehouseName: string;
    items: CartItem[];
    total: number;
  } | null>(null);
  const [validationIssues, setValidationIssues] = useState<ValidationIssue[]>([]);

  const grouped = useMemo(() => groupByWarehouse(cart), [cart]);
  const cartTotal = useMemo(() => cart.reduce((s, i) => s + i.quantity * i.unitPrice, 0), [cart]);
  const cartItemCount = useMemo(() => cart.reduce((s, i) => s + i.quantity, 0), [cart]);

  // ── Validate a warehouse group before showing confirm modal ──
  const validateGroup = (warehouseId: string, items: CartItem[]): ValidationIssue[] => {
    const issues: ValidationIssue[] = [];

    // Check warehouse is open
    const wh = MOCK_WAREHOUSES.find((w) => w.id === warehouseId);
    if (wh && !wh.isOpen) {
      issues.push({ productName: wh.name, reason: 'المستودع مغلق حالياً ولا يستقبل طلبات جديدة.' });
      return issues; // no point checking products if warehouse closed
    }

    // Check each product
    for (const item of items) {
      const liveProduct = app.products.find((p) => p.id === item.productId);

      if (!liveProduct) {
        issues.push({ productName: item.productName, reason: 'هذا المنتج لم يعد متاحاً.' });
        continue;
      }

      if (liveProduct.stockStatus === 'out' || liveProduct.stock === 0) {
        issues.push({ productName: item.productName, reason: 'نفذ مخزون هذا المنتج.' });
        continue;
      }

      if (item.quantity > liveProduct.stock) {
        issues.push({
          productName: item.productName,
          reason: `الكمية المطلوبة (${item.quantity} ${item.unit}) أكبر من المتوفر (${liveProduct.stock} ${item.unit}).`,
        });
        continue;
      }

      // Price staleness check — warn if price changed > 10%
      if (Math.abs(liveProduct.price - item.unitPrice) / item.unitPrice > 0.1) {
        issues.push({
          productName: item.productName,
          reason: `تغيّر سعر هذا المنتج. السعر الحالي: ${liveProduct.price.toLocaleString('ar-SA')} ل.س. يرجى مراجعة السلة.`,
        });
      }
    }

    return issues;
  };

  const handleOpenConfirm = (warehouseId: string, warehouseName: string, items: CartItem[]) => {
    const issues = validateGroup(warehouseId, items);
    if (issues.length > 0) {
      setValidationIssues(issues);
      return;
    }
    const total = items.reduce((s, i) => s + i.quantity * i.unitPrice, 0);
    setConfirmState({ warehouseId, warehouseName, items, total });
  };

  const handleConfirmOrder = () => {
    if (!confirmState) return;
    const { warehouseId, warehouseName, items, total } = confirmState;
    const now = new Date().toISOString();
    const orderId = generateOrderId();

    const orderItems: OrderItem[] = items.map((i) => ({
      productId:   i.productId,
      productName: i.productName,
      unit:        i.unit,
      quantity:    i.quantity,
      unitPrice:   i.unitPrice, // price snapshot
    }));

    const newOrder: Order = {
      id:                orderId,
      warehouseId,
      warehouseName,
      storeId:           'store-demo',
      storeName:         settings.storeName,
      items:             orderItems,
      total,
      status:            'pending',
      createdAt:         now,
      updatedAt:         now,
      timeline:          [makeTimelineEvent('pending', 'store')],
      inventoryDeducted: false,
    };

    // Persist via shared AppContext
    app.addOrder(newOrder);
    clearWarehouseCart(warehouseId);

    // Store notification
    addNotification(makeStoreOrderSubmittedNotif(orderId, warehouseName));

    // Warehouse notification (cross-role)
    addWarehouseNotif(makeWarehouseNewOrderNotif(orderId, settings.storeName));

    toast({ type: 'success', title: 'تم إرسال الطلب بنجاح', description: `طلب #${orderId} إلى ${warehouseName}`, duration: 4000 });
    setConfirmState(null);
    navigate(`/store/orders/${orderId}`);
  };

  if (cart.length === 0) {
    return (
      <ContentContainer>
        <PageHeader title="السلة" breadcrumbs={[{ label: 'لوحة التحكم', path: '/store' }, { label: 'السلة' }]} />
        <EmptyState
          icon={<ShoppingCart size={32} />}
          title="سلة المشتريات فارغة"
          description="لم تضف أي منتجات إلى سلتك بعد."
          action={{ label: 'تصفح المنتجات', onClick: () => navigate('/store/products') }}
        />
      </ContentContainer>
    );
  }

  return (
    <>
      <ContentContainer>
        <PageHeader
          title="السلة"
          description={`${cartItemCount} منتج — إجمالي ${cartTotal.toLocaleString('ar-SA')} ل.س`}
          breadcrumbs={[{ label: 'لوحة التحكم', path: '/store' }, { label: 'السلة' }]}
        />

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 flex flex-col gap-5">
            <AnimatePresence initial={false}>
              {Array.from(grouped.entries()).map(([warehouseId, items]) => {
                const warehouseName = items[0].warehouseName;
                const groupTotal    = items.reduce((s, i) => s + i.quantity * i.unitPrice, 0);
                const wh            = MOCK_WAREHOUSES.find((w) => w.id === warehouseId);
                const isClosed      = wh && !wh.isOpen;

                return (
                  <motion.div key={warehouseId} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8, height: 0 }} transition={{ duration: 0.2 }}>
                    <Card padding="none">
                      {/* Warehouse header */}
                      <div className="flex items-center justify-between gap-3 px-5 pt-4 pb-3 border-b border-[var(--border-subtle)]">
                        <div className="flex items-center gap-2 min-w-0">
                          <WarehouseIcon size={16} className="text-[#4C8CE4] shrink-0" aria-hidden="true" />
                          <h2 className="text-sm font-semibold text-[var(--text-primary)] truncate">{warehouseName}</h2>
                          <Badge variant="neutral" size="sm">{items.length} منتج</Badge>
                          {isClosed && <Badge variant="error" size="sm">مغلق</Badge>}
                        </div>
                        <span className="text-sm font-bold text-[var(--text-primary)] shrink-0">
                          {groupTotal.toLocaleString('ar-SA')} ل.س
                        </span>
                      </div>

                      {/* Closed warning */}
                      {isClosed && (
                        <div className="flex items-center gap-2 mx-5 my-3 p-3 rounded-[var(--radius-md)] bg-[var(--status-warning-bg)] border border-[var(--status-warning-border)]">
                          <AlertTriangle size={13} className="text-[var(--status-warning-text)] shrink-0" aria-hidden="true" />
                          <p className="text-xs text-[var(--status-warning-text)]">هذا المستودع مغلق حالياً ولا يمكن إرسال طلب إليه.</p>
                        </div>
                      )}

                      {/* Items */}
                      <div className="divide-y divide-[var(--border-subtle)]">
                        <AnimatePresence initial={false}>
                          {items.map((item) => {
                            const liveProduct  = app.products.find((p) => p.id === item.productId);
                            const stockWarning = liveProduct && item.quantity > liveProduct.stock;

                            return (
                              <motion.div key={item.productId} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.18 }} className="flex items-center gap-4 px-5 py-3">
                                <div className="w-10 h-10 rounded-[var(--radius-md)] shrink-0 bg-[var(--bg-surface-3)]" aria-hidden="true" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-[var(--text-primary)] truncate">{item.productName}</p>
                                  <p className="text-xs text-[var(--text-muted)]">
                                    {item.unitPrice.toLocaleString('ar-SA')} ل.س / {item.unit}
                                  </p>
                                  {stockWarning && (
                                    <p className="text-xs text-[var(--status-error-text)] mt-0.5">
                                      الكمية المتوفرة: {liveProduct!.stock} {item.unit}
                                    </p>
                                  )}
                                </div>
                                <span className="text-sm font-semibold text-[var(--text-primary)] shrink-0 hidden sm:block w-24 text-end">
                                  {(item.quantity * item.unitPrice).toLocaleString('ar-SA')} ل.س
                                </span>
                                <QuantityControl
                                  item={item}
                                  onUpdate={(q) => updateCartQty(item.productId, q)}
                                  onRemove={() => removeFromCart(item.productId)}
                                />
                              </motion.div>
                            );
                          })}
                        </AnimatePresence>
                      </div>

                      {/* Send CTA */}
                      <div className="px-5 py-4 border-t border-[var(--border-subtle)] flex items-center justify-between gap-3">
                        <p className="text-xs text-[var(--text-muted)]">طلب منفصل سيُرسل إلى هذا المستودع</p>
                        <Button
                          variant="primary"
                          size="sm"
                          disabled={Boolean(isClosed)}
                          onClick={() => handleOpenConfirm(warehouseId, warehouseName, items)}
                          iconStart={<CheckCircle2 size={15} />}
                        >
                          إرسال الطلب
                        </Button>
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-[4.5rem]">
              <Card padding="md">
                <h2 className="text-[0.9375rem] font-semibold text-[var(--text-primary)] mb-4">ملخص السلة</h2>
                <div className="flex flex-col gap-3 mb-5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[var(--text-muted)]">عدد المنتجات</span>
                    <span className="font-medium text-[var(--text-primary)]">{cartItemCount}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-[var(--text-muted)]">عدد المستودعات</span>
                    <span className="font-medium text-[var(--text-primary)]">{grouped.size}</span>
                  </div>
                  <div className="h-px bg-[var(--border-subtle)]" />
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-[var(--text-primary)]">الإجمالي الكلي</span>
                    <span className="text-base font-black text-[var(--text-primary)]">{cartTotal.toLocaleString('ar-SA')} ل.س</span>
                  </div>
                </div>
                <p className="text-xs text-[var(--text-muted)] mb-4 leading-relaxed">
                  يتم تجميع المنتجات حسب المستودع. كل مجموعة تُرسل كطلب منفصل.
                </p>
                <div className="flex items-center gap-2 p-3 rounded-[var(--radius-md)] bg-[var(--bg-surface-2)]">
                  <CheckCircle2 size={14} className="text-[#91D06C] shrink-0" aria-hidden="true" />
                  <span className="text-xs text-[var(--text-muted)]">الدفع عند استلام البضاعة</span>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </ContentContainer>

      {confirmState && (
        <ConfirmOrderModal
          open
          onClose={() => setConfirmState(null)}
          onConfirm={handleConfirmOrder}
          warehouseName={confirmState.warehouseName}
          items={confirmState.items}
          total={confirmState.total}
        />
      )}

      <ValidationModal
        open={validationIssues.length > 0}
        onClose={() => setValidationIssues([])}
        issues={validationIssues}
      />
    </>
  );
}
