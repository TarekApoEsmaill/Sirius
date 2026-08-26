import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Package, Calendar, CheckCircle2, XCircle } from 'lucide-react';
import { ContentContainer } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/common/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { OrderStatusBadge, OrderTimeline } from '@/components/store/OrderStatus';
import { useWarehouse } from '@/contexts/WarehouseContext';
import { useStore } from '@/contexts/StoreContext';
import { useToast } from '@/components/ui/Toast';
import { ORDER_STATUS_LABELS, ORDER_NEXT_STATUS, ORDER_CAN_REJECT } from '@/types/store';
import { makeStoreStatusChangeNotif, formatArabicDateTime } from '@/lib/business';

// ============================================================
// Warehouse — Order Detail  /warehouse/orders/:id
// ============================================================

export function WarehouseOrderDetail() {
  const { id }   = useParams<{ id: string }>();
  const { orders, updateOrderStatus } = useWarehouse();
  const { addNotification: addStoreNotif } = useStore();
  const { toast }    = useToast();
  const navigate     = useNavigate();
  const [rejectOpen, setRejectOpen] = useState(false);
  const [reason, setReason]         = useState('');

  const order = orders.find((o) => o.id === id);

  if (!order) {
    return (
      <ContentContainer>
        <PageHeader
          title="الطلب غير موجود"
          breadcrumbs={[{ label: 'لوحة التحكم', path: '/warehouse' }, { label: 'الطلبات', path: '/warehouse/orders' }, { label: id ?? '—' }]}
        />
        <p className="text-sm text-[var(--text-muted)]">لم يُعثر على هذا الطلب.</p>
        <Button variant="secondary" size="sm" className="mt-4" onClick={() => navigate('/warehouse/orders')} iconStart={<ArrowRight size={15} />}>
          العودة إلى الطلبات
        </Button>
      </ContentContainer>
    );
  }

  const nextStatus = ORDER_NEXT_STATUS[order.status];
  const canReject  = ORDER_CAN_REJECT.includes(order.status);

  const handleAdvance = () => {
    if (!nextStatus) return;
    updateOrderStatus(order.id, nextStatus);
    addStoreNotif(makeStoreStatusChangeNotif(order.id, nextStatus));
    toast({ type: 'success', title: `تم التحديث: ${ORDER_STATUS_LABELS[nextStatus]}`, description: `#${order.id}` });
  };

  const handleReject = () => {
    const finalReason = reason.trim() || 'لم يُذكر سبب';
    updateOrderStatus(order.id, 'rejected', finalReason);
    addStoreNotif(makeStoreStatusChangeNotif(order.id, 'rejected', finalReason));
    toast({ type: 'info', title: 'تم رفض الطلب', description: `#${order.id}` });
    setRejectOpen(false);
    setReason('');
    navigate('/warehouse/orders');
  };

  return (
    <>
      <ContentContainer>
        <PageHeader
          title={`الطلب #${order.id}`}
          breadcrumbs={[
            { label: 'لوحة التحكم', path: '/warehouse' },
            { label: 'الطلبات', path: '/warehouse/orders' },
            { label: `#${order.id}` },
          ]}
          primaryAction={
            <div className="flex items-center gap-2">
              {nextStatus && (
                <Button variant="primary" size="sm" iconStart={<CheckCircle2 size={15} />} onClick={handleAdvance}>
                  {ORDER_STATUS_LABELS[nextStatus]}
                </Button>
              )}
              {canReject && (
                <Button variant="ghost" size="sm" iconStart={<XCircle size={15} />} onClick={() => setRejectOpen(true)} className="text-red-500 hover:bg-red-500/10">
                  رفض
                </Button>
              )}
              <Link to="/warehouse/orders">
                <Button variant="ghost" size="sm" iconStart={<ArrowRight size={15} />}>العودة</Button>
              </Link>
            </div>
          }
        />

        {/* Rejection reason banner */}
        {order.status === 'rejected' && order.rejectionReason && (
          <div className="mb-5 flex items-start gap-2 p-4 rounded-[var(--radius-md)] bg-[var(--status-error-bg)] border border-[var(--status-error-border)]">
            <XCircle size={15} className="text-[var(--status-error-text)] shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <p className="text-sm font-semibold text-[var(--status-error-text)]">سبب الرفض</p>
              <p className="text-xs text-[var(--status-error-text)] mt-0.5 opacity-80">{order.rejectionReason}</p>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 flex flex-col gap-5">
            {/* Order info */}
            <Card padding="md">
              <h2 className="text-[0.9375rem] font-semibold text-[var(--text-primary)] mb-4">معلومات الطلب</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="flex items-start gap-2.5">
                  <Package size={15} className="text-[var(--text-muted)] shrink-0 mt-0.5" aria-hidden="true" />
                  <div>
                    <p className="text-xs text-[var(--text-muted)]">رقم الطلب</p>
                    <p className="text-sm font-semibold text-[var(--text-primary)]">#{order.id}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <Package size={15} className="text-[var(--text-muted)] shrink-0 mt-0.5" aria-hidden="true" />
                  <div>
                    <p className="text-xs text-[var(--text-muted)]">المتجر</p>
                    <p className="text-sm font-semibold text-[var(--text-primary)]">{order.storeName}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <Calendar size={15} className="text-[var(--text-muted)] shrink-0 mt-0.5" aria-hidden="true" />
                  <div>
                    <p className="text-xs text-[var(--text-muted)]">تاريخ الطلب</p>
                    <p className="text-sm font-semibold text-[var(--text-primary)]">{formatArabicDateTime(order.createdAt)}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="shrink-0 mt-0.5"><OrderStatusBadge status={order.status} size="sm" /></div>
                  <div>
                    <p className="text-xs text-[var(--text-muted)]">آخر تحديث</p>
                    <p className="text-sm font-semibold text-[var(--text-primary)]">{formatArabicDateTime(order.updatedAt)}</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Products */}
            <Card padding="none" className="overflow-hidden">
              <div className="px-5 pt-4 pb-3 border-b border-[var(--border-subtle)]">
                <h2 className="text-[0.9375rem] font-semibold text-[var(--text-primary)]">المنتجات المطلوبة</h2>
              </div>
              <div className="hidden sm:block">
                <table className="w-full text-sm" aria-label="منتجات الطلب">
                  <thead>
                    <tr className="bg-[var(--bg-surface-2)] border-b border-[var(--border-subtle)]">
                      {['المنتج', 'الكمية', 'سعر الوحدة', 'الإجمالي'].map((h) => (
                        <th key={h} scope="col" className="px-5 py-2.5 text-start text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-subtle)]">
                    {order.items.map((item) => (
                      <tr key={item.productId} className="hover:bg-[var(--bg-surface-2)] transition-colors">
                        <td className="px-5 py-3 font-medium text-[var(--text-primary)]">{item.productName}</td>
                        <td className="px-5 py-3 text-[var(--text-secondary)]">{item.quantity} {item.unit}</td>
                        <td className="px-5 py-3 text-[var(--text-secondary)]">{item.unitPrice.toLocaleString('ar-SA')} ل.س</td>
                        <td className="px-5 py-3 font-semibold text-[var(--text-primary)]">
                          {(item.quantity * item.unitPrice).toLocaleString('ar-SA')} ل.س
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="sm:hidden divide-y divide-[var(--border-subtle)]">
                {order.items.map((item) => (
                  <div key={item.productId} className="flex items-center justify-between gap-3 px-5 py-3">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-[var(--text-primary)] truncate">{item.productName}</p>
                      <p className="text-xs text-[var(--text-muted)]">{item.quantity} {item.unit} × {item.unitPrice.toLocaleString('ar-SA')} ل.س</p>
                    </div>
                    <span className="text-sm font-semibold text-[var(--text-primary)] shrink-0">
                      {(item.quantity * item.unitPrice).toLocaleString('ar-SA')} ل.س
                    </span>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between px-5 py-4 bg-[var(--bg-surface-2)] border-t border-[var(--border-subtle)]">
                <span className="text-sm font-semibold text-[var(--text-primary)]">الإجمالي</span>
                <span className="text-lg font-black text-[var(--text-primary)]">{order.total.toLocaleString('ar-SA')} ل.س</span>
              </div>
            </Card>
          </div>

          {/* Timeline */}
          <div>
            <div className="sticky top-[4.5rem]">
              <Card padding="md">
                <h2 className="text-[0.9375rem] font-semibold text-[var(--text-primary)] mb-5">مراحل الطلب</h2>
                <OrderTimeline status={order.status} timeline={order.timeline} />
              </Card>
            </div>
          </div>
        </div>
      </ContentContainer>

      {/* Reject modal */}
      <Modal
        open={rejectOpen}
        onClose={() => { setRejectOpen(false); setReason(''); }}
        title="رفض الطلب"
        size="sm"
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => { setRejectOpen(false); setReason(''); }}>إلغاء</Button>
            <Button variant="destructive" size="sm" onClick={handleReject} iconStart={<XCircle size={15} />}>رفض الطلب</Button>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <p className="text-sm text-[var(--text-secondary)]">
            هل تريد رفض الطلب <span className="font-semibold text-[var(--text-primary)]">#{order.id}</span>؟
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
    </>
  );
}
