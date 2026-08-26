import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ClipboardList, ArrowLeft, CheckCircle2, XCircle, ChevronRight } from 'lucide-react';
import { ContentContainer } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/common/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Tabs } from '@/components/ui/Tabs';
import { EmptyState } from '@/components/ui/EmptyState';
import { Modal } from '@/components/ui/Modal';
import { OrderStatusBadge } from '@/components/store/OrderStatus';
import { useWarehouse } from '@/contexts/WarehouseContext';
import { useStore } from '@/contexts/StoreContext';
import { useToast } from '@/components/ui/Toast';
import { ORDER_STATUS_LABELS, ORDER_NEXT_STATUS, ORDER_CAN_REJECT } from '@/types/store';
import { makeStoreStatusChangeNotif, formatArabicDateShort } from '@/lib/business';
import type { Order } from '@/types/store';

// ============================================================
// Warehouse — Orders  /warehouse/orders
// ============================================================

const FILTER_TABS = [
  { key: 'all',        label: 'الكل' },
  { key: 'pending',    label: ORDER_STATUS_LABELS.pending },
  { key: 'accepted',   label: ORDER_STATUS_LABELS.accepted },
  { key: 'processing', label: ORDER_STATUS_LABELS.processing },
  { key: 'ready',      label: ORDER_STATUS_LABELS.ready },
  { key: 'shipped',    label: ORDER_STATUS_LABELS.shipped },
  { key: 'completed',  label: ORDER_STATUS_LABELS.completed },
  { key: 'rejected',   label: ORDER_STATUS_LABELS.rejected },
];

// ── Reject modal with reason ────────────────────────────────
interface RejectModalProps {
  open: boolean;
  order: Order | null;
  onClose: () => void;
  onConfirm: (reason: string) => void;
}

function RejectModal({ open, order, onClose, onConfirm }: RejectModalProps) {
  const [reason, setReason] = useState('');

  const handleConfirm = () => {
    onConfirm(reason.trim() || 'لم يُذكر سبب');
    setReason('');
    onClose();
  };

  if (!order) return null;

  return (
    <Modal
      open={open}
      onClose={() => { setReason(''); onClose(); }}
      title="رفض الطلب"
      size="sm"
      footer={
        <>
          <Button variant="ghost" size="sm" onClick={() => { setReason(''); onClose(); }}>إلغاء</Button>
          <Button variant="destructive" size="sm" onClick={handleConfirm} iconStart={<XCircle size={15} />}>
            رفض الطلب
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <p className="text-sm text-[var(--text-secondary)]">
          هل تريد رفض الطلب{' '}
          <span className="font-semibold text-[var(--text-primary)]">#{order.id}</span>؟
          سيتم إشعار المتجر بالرفض.
        </p>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-[var(--text-primary)]">سبب الرفض (اختياري)</label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="مثال: عدم توفر بعض المنتجات حالياً."
            rows={3}
            className="w-full bg-[var(--bg-surface)] text-[var(--text-primary)] border border-[var(--border-default)] rounded-[var(--radius-sm)] px-3 py-2 text-sm resize-none placeholder:text-[var(--text-disabled)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4C8CE4]/40 focus:border-[#4C8CE4] transition-colors"
          />
        </div>
      </div>
    </Modal>
  );
}

export function WarehouseOrders() {
  const { orders, updateOrderStatus } = useWarehouse();
  const { addNotification: addStoreNotif } = useStore();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('all');
  const [rejectOrder, setRejectOrder] = useState<Order | null>(null);

  const sorted = useMemo(() =>
    [...orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [orders]
  );

  const filtered = useMemo(() =>
    activeTab === 'all' ? sorted : sorted.filter((o) => o.status === activeTab),
    [sorted, activeTab]
  );

  const tabsWithCounts = FILTER_TABS.map((t) => ({
    ...t,
    count: t.key === 'all' ? orders.length : orders.filter((o) => o.status === t.key).length,
  }));

  const handleAdvance = (order: Order) => {
    const next = ORDER_NEXT_STATUS[order.status];
    if (!next) return;
    updateOrderStatus(order.id, next);
    // Notify store about status change
    addStoreNotif(makeStoreStatusChangeNotif(order.id, next));
    toast({ type: 'success', title: `تم التحديث: ${ORDER_STATUS_LABELS[next]}`, description: `#${order.id}` });
  };

  const handleReject = (order: Order, reason: string) => {
    updateOrderStatus(order.id, 'rejected', reason);
    addStoreNotif(makeStoreStatusChangeNotif(order.id, 'rejected', reason));
    toast({ type: 'info', title: 'تم رفض الطلب', description: `#${order.id}` });
  };

  return (
    <>
      <ContentContainer>
        <PageHeader
          title="الطلبات الواردة"
          description="استقبل طلبات المحلات وأدر حالتها من هنا."
          breadcrumbs={[{ label: 'لوحة التحكم', path: '/warehouse' }, { label: 'الطلبات' }]}
        />

        <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0 mb-6">
          <Tabs tabs={tabsWithCounts} activeTab={activeTab} onTabChange={setActiveTab} variant="line" className="min-w-max" />
        </div>

        {filtered.length === 0 ? (
          <EmptyState icon={<ClipboardList size={28} />} title="لا توجد طلبات" description={activeTab === 'all' ? 'لم يصلك أي طلب بعد.' : 'لا توجد طلبات بهذه الحالة.'} />
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden sm:block">
              <Card padding="none" className="overflow-hidden">
                <table className="w-full text-sm" aria-label="الطلبات الواردة">
                  <thead>
                    <tr className="bg-[var(--bg-surface-2)] border-b border-[var(--border-subtle)]">
                      {['رقم الطلب', 'التاريخ', 'المنتجات', 'الإجمالي', 'الحالة', 'الإجراءات'].map((h) => (
                        <th key={h} scope="col" className="px-4 py-3 text-start text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-subtle)]">
                    {filtered.map((order) => {
                      const nextStatus = ORDER_NEXT_STATUS[order.status];
                      const canReject  = ORDER_CAN_REJECT.includes(order.status);
                      return (
                        <tr key={order.id} className="hover:bg-[var(--bg-surface-2)] transition-colors">
                          <td className="px-4 py-3 font-semibold text-[var(--text-primary)]">#{order.id}</td>
                          <td className="px-4 py-3 text-[var(--text-muted)] text-xs whitespace-nowrap">{formatArabicDateShort(order.createdAt)}</td>
                          <td className="px-4 py-3 text-[var(--text-secondary)]">{order.items.length}</td>
                          <td className="px-4 py-3 font-semibold text-[var(--text-primary)] whitespace-nowrap">
                            {order.total.toLocaleString('ar-SA')} ل.س
                          </td>
                          <td className="px-4 py-3"><OrderStatusBadge status={order.status} size="sm" /></td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              {nextStatus && (
                                <Button variant="primary" size="sm" onClick={() => handleAdvance(order)} iconStart={<CheckCircle2 size={13} />}>
                                  {ORDER_STATUS_LABELS[nextStatus]}
                                </Button>
                              )}
                              {canReject && (
                                <Button variant="ghost" size="sm" onClick={() => setRejectOrder(order)} iconStart={<XCircle size={13} />} className="text-red-500 hover:bg-red-500/10">
                                  رفض
                                </Button>
                              )}
                              <Link to={`/warehouse/orders/${order.id}`} aria-label={`تفاصيل الطلب ${order.id}`}>
                                <Button variant="ghost" size="sm" iconStart={<ArrowLeft size={13} />}>تفاصيل</Button>
                              </Link>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </Card>
            </div>

            {/* Mobile cards */}
            <div className="sm:hidden flex flex-col gap-3">
              {filtered.map((order) => {
                const nextStatus = ORDER_NEXT_STATUS[order.status];
                const canReject  = ORDER_CAN_REJECT.includes(order.status);
                return (
                  <Card key={order.id} padding="md">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <p className="text-sm font-semibold text-[var(--text-primary)]">#{order.id}</p>
                        <p className="text-xs text-[var(--text-muted)]">{formatArabicDateShort(order.createdAt)} · {order.items.length} منتج</p>
                      </div>
                      <OrderStatusBadge status={order.status} size="sm" />
                    </div>
                    <p className="text-sm font-semibold text-[var(--text-primary)] mb-3">
                      {order.total.toLocaleString('ar-SA')} ل.س
                    </p>
                    <div className="flex items-center gap-2 flex-wrap border-t border-[var(--border-subtle)] pt-3">
                      {nextStatus && (
                        <Button variant="primary" size="sm" onClick={() => handleAdvance(order)} iconStart={<CheckCircle2 size={13} />}>
                          {ORDER_STATUS_LABELS[nextStatus]}
                        </Button>
                      )}
                      {canReject && (
                        <Button variant="ghost" size="sm" onClick={() => setRejectOrder(order)} className="text-red-500">رفض</Button>
                      )}
                      <Link to={`/warehouse/orders/${order.id}`} className="ms-auto">
                        <Button variant="ghost" size="sm" iconEnd={<ChevronRight size={13} />}>تفاصيل</Button>
                      </Link>
                    </div>
                  </Card>
                );
              })}
            </div>
          </>
        )}
      </ContentContainer>

      <RejectModal
        open={rejectOrder !== null}
        order={rejectOrder}
        onClose={() => setRejectOrder(null)}
        onConfirm={(reason) => rejectOrder && handleReject(rejectOrder, reason)}
      />
    </>
  );
}
