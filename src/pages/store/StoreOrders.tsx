import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ClipboardList, ArrowLeft } from 'lucide-react';
import { ContentContainer } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/common/PageHeader';
import { Tabs } from '@/components/ui/Tabs';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { OrderStatusBadge } from '@/components/store/OrderStatus';
import { useStore } from '@/contexts/StoreContext';
import { ORDER_STATUS_LABELS } from '@/types/store';
import { formatArabicDateShort } from '@/lib/business';

// ============================================================
// Store — Orders  /store/orders
// ============================================================

const FILTER_TABS = [
  { key: 'all', label: 'الكل' },
  { key: 'pending', label: ORDER_STATUS_LABELS.pending },
  { key: 'accepted', label: ORDER_STATUS_LABELS.accepted },
  { key: 'processing', label: ORDER_STATUS_LABELS.processing },
  { key: 'ready', label: ORDER_STATUS_LABELS.ready },
  { key: 'shipped', label: ORDER_STATUS_LABELS.shipped },
  { key: 'completed', label: ORDER_STATUS_LABELS.completed },
  { key: 'rejected', label: ORDER_STATUS_LABELS.rejected },
];

export function StoreOrders() {
  const { orders } = useStore();
  const [activeTab, setActiveTab] = useState('all');

  const filtered = useMemo(() => {
    const sorted = [...orders].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    if (activeTab === 'all') return sorted;
    return sorted.filter((o) => o.status === activeTab);
  }, [orders, activeTab]);

  // Tab counts
  const tabsWithCounts = FILTER_TABS.map((t) => ({
    ...t,
    count: t.key === 'all' ? orders.length : orders.filter((o) => o.status === t.key).length,
  }));

  return (
    <ContentContainer>
      <PageHeader
        title="طلباتي"
        description="تتبع جميع طلباتك وراجع حالة كل طلب."
        breadcrumbs={[
          { label: 'لوحة التحكم', path: '/store' },
          { label: 'طلباتي' },
        ]}
      />

      {/* Filter tabs — scrollable on mobile */}
      <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0 mb-6">
        <Tabs
          tabs={tabsWithCounts}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          variant="line"
          className="min-w-max"
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<ClipboardList size={28} />}
          title="لا توجد طلبات"
          description={activeTab === 'all' ? 'لم تقم بأي طلبات بعد.' : 'لا توجد طلبات بهذه الحالة.'}
        />
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden sm:block">
            <Card padding="none" className="overflow-hidden">
              <table className="w-full text-sm" role="table" aria-label="قائمة الطلبات">
                <thead>
                  <tr className="border-b border-[var(--border-subtle)] bg-[var(--bg-surface-2)]">
                    {['رقم الطلب', 'المستودع', 'التاريخ', 'عدد المنتجات', 'الإجمالي', 'الحالة', ''].map((h) => (
                      <th
                        key={h}
                        scope="col"
                        className="px-4 py-3 text-start text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-subtle)]">
                  {filtered.map((order) => (
                    <tr
                      key={order.id}
                      className="hover:bg-[var(--bg-surface-2)] transition-colors"
                    >
                      <td className="px-4 py-3 font-semibold text-[var(--text-primary)]">
                        #{order.id}
                      </td>
                      <td className="px-4 py-3 text-[var(--text-secondary)] truncate max-w-[160px]">
                        {order.warehouseName}
                      </td>
                      <td className="px-4 py-3 text-[var(--text-muted)] whitespace-nowrap">
                        {formatArabicDateShort(order.createdAt)}
                      </td>
                      <td className="px-4 py-3 text-[var(--text-secondary)]">
                        {order.items.length}
                      </td>
                      <td className="px-4 py-3 font-semibold text-[var(--text-primary)] whitespace-nowrap">
                        {order.total.toLocaleString('ar-SA')} ل.س
                      </td>
                      <td className="px-4 py-3">
                        <OrderStatusBadge status={order.status} size="sm" />
                      </td>
                      <td className="px-4 py-3">
                        <Link
                          to={`/store/orders/${order.id}`}
                          className="flex items-center gap-1 text-[#4C8CE4] hover:text-[#3B7BD4] font-medium text-xs transition-colors"
                          aria-label={`عرض تفاصيل الطلب ${order.id}`}
                        >
                          التفاصيل
                          <ArrowLeft size={12} aria-hidden="true" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          </div>

          {/* Mobile cards */}
          <div className="sm:hidden flex flex-col gap-3">
            {filtered.map((order) => (
              <Link key={order.id} to={`/store/orders/${order.id}`} className="block">
                <Card variant="interactive" padding="md">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <p className="text-sm font-semibold text-[var(--text-primary)]">#{order.id}</p>
                      <p className="text-xs text-[var(--text-muted)] mt-0.5">{order.warehouseName}</p>
                    </div>
                    <OrderStatusBadge status={order.status} size="sm" />
                  </div>
                  <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
                    <span>{formatArabicDateShort(order.createdAt)}</span>
                    <span>{order.items.length} منتج</span>
                    <span className="font-semibold text-[var(--text-primary)]">
                      {order.total.toLocaleString('ar-SA')} ل.س
                    </span>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </>
      )}
    </ContentContainer>
  );
}
