import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Package, Warehouse, Calendar, XCircle } from 'lucide-react';
import { ContentContainer } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/common/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { OrderStatusBadge, OrderTimeline } from '@/components/store/OrderStatus';
import { useStore } from '@/contexts/StoreContext';
import { formatArabicDateTime } from '@/lib/business';

// ============================================================
// Store — Order Detail  /store/orders/:id
// ============================================================

export function StoreOrderDetail() {
  const { id }     = useParams<{ id: string }>();
  const { orders } = useStore();
  const navigate   = useNavigate();

  const order = orders.find((o) => o.id === id);

  if (!order) {
    return (
      <ContentContainer>
        <PageHeader
          title="الطلب غير موجود"
          breadcrumbs={[
            { label: 'لوحة التحكم', path: '/store' },
            { label: 'طلباتي', path: '/store/orders' },
            { label: id ?? '—' },
          ]}
        />
        <p className="text-sm text-[var(--text-muted)]">لم يُعثر على هذا الطلب.</p>
        <Button variant="secondary" size="sm" className="mt-4" onClick={() => navigate('/store/orders')} iconStart={<ArrowRight size={15} />}>
          العودة إلى الطلبات
        </Button>
      </ContentContainer>
    );
  }

  return (
    <ContentContainer>
      <PageHeader
        title={`تفاصيل الطلب #${order.id}`}
        breadcrumbs={[
          { label: 'لوحة التحكم', path: '/store' },
          { label: 'طلباتي', path: '/store/orders' },
          { label: `#${order.id}` },
        ]}
        primaryAction={
          <Link to="/store/orders">
            <Button variant="ghost" size="sm" iconStart={<ArrowRight size={15} />}>
              العودة للطلبات
            </Button>
          </Link>
        }
      />

      {/* Rejection banner */}
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
        {/* Main */}
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
                <Warehouse size={15} className="text-[var(--text-muted)] shrink-0 mt-0.5" aria-hidden="true" />
                <div>
                  <p className="text-xs text-[var(--text-muted)]">المستودع</p>
                  <p className="text-sm font-semibold text-[var(--text-primary)]">{order.warehouseName}</p>
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
                <div className="shrink-0 mt-0.5">
                  <OrderStatusBadge status={order.status} size="sm" />
                </div>
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
              <h2 className="text-[0.9375rem] font-semibold text-[var(--text-primary)]">المنتجات</h2>
            </div>

            {/* Desktop */}
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
                      <td className="px-5 py-3 text-[var(--text-secondary)]">
                        {item.unitPrice.toLocaleString('ar-SA')} ل.س
                        <span className="text-[0.625rem] text-[var(--text-disabled)] mr-1">(سعر وقت الطلب)</span>
                      </td>
                      <td className="px-5 py-3 font-semibold text-[var(--text-primary)]">
                        {(item.quantity * item.unitPrice).toLocaleString('ar-SA')} ل.س
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile */}
            <div className="sm:hidden divide-y divide-[var(--border-subtle)]">
              {order.items.map((item) => (
                <div key={item.productId} className="px-5 py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-[var(--text-primary)] truncate">{item.productName}</p>
                    <p className="text-xs text-[var(--text-muted)]">
                      {item.quantity} {item.unit} × {item.unitPrice.toLocaleString('ar-SA')} ل.س
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-[var(--text-primary)] shrink-0">
                    {(item.quantity * item.unitPrice).toLocaleString('ar-SA')} ل.س
                  </span>
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="flex items-center justify-between px-5 py-4 bg-[var(--bg-surface-2)] border-t border-[var(--border-subtle)]">
              <span className="text-sm font-semibold text-[var(--text-primary)]">الإجمالي</span>
              <span className="text-lg font-black text-[var(--text-primary)]">
                {order.total.toLocaleString('ar-SA')} ل.س
              </span>
            </div>
          </Card>
        </div>

        {/* Timeline sidebar */}
        <div>
          <div className="sticky top-[4.5rem]">
            <Card padding="md">
              <h2 className="text-[0.9375rem] font-semibold text-[var(--text-primary)] mb-5">سجل الطلب</h2>
              <OrderTimeline status={order.status} timeline={order.timeline} />
            </Card>
          </div>
        </div>
      </div>
    </ContentContainer>
  );
}
