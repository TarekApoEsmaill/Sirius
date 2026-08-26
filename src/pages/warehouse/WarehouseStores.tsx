import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Store, ClipboardList, ArrowLeft } from 'lucide-react';
import { ContentContainer } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/common/PageHeader';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { OrderStatusBadge } from '@/components/store/OrderStatus';
import { useWarehouse } from '@/contexts/WarehouseContext';

// ============================================================
// Warehouse — Stores  /warehouse/stores
// ============================================================

// Demo store names keyed by storeId
const STORE_NAMES: Record<string, string> = {
  'store-demo': 'متجر النور',
};

function getStoreName(storeId: string): string {
  return STORE_NAMES[storeId] ?? `متجر ${storeId}`;
}

export function WarehouseStores() {
  const { orders } = useWarehouse();

  // Aggregate orders by store
  const storeStats = useMemo(() => {
    const map = new Map<string, { name: string; orderCount: number; totalValue: number; lastOrderDate: string; recentOrders: typeof orders }>();
    for (const order of orders) {
      const existing = map.get(order.storeId);
      if (!existing) {
        map.set(order.storeId, {
          name: getStoreName(order.storeId),
          orderCount: 1,
          totalValue: order.total,
          lastOrderDate: order.createdAt,
          recentOrders: [order],
        });
      } else {
        existing.orderCount++;
        existing.totalValue += order.total;
        if (order.createdAt > existing.lastOrderDate) existing.lastOrderDate = order.createdAt;
        existing.recentOrders.push(order);
      }
    }
    return Array.from(map.values()).sort((a, b) => b.orderCount - a.orderCount);
  }, [orders]);

  return (
    <ContentContainer>
      <PageHeader
        title="المحلات المشتركة"
        description="المتاجر التي أرسلت طلبات إلى مستودعك."
        breadcrumbs={[{ label: 'لوحة التحكم', path: '/warehouse' }, { label: 'المحلات' }]}
      />

      {storeStats.length === 0 ? (
        <EmptyState
          icon={<Store size={28} />}
          title="لا توجد محلات مشتركة"
          description="ستظهر هنا المحلات التي تتعامل معك عند وصول أول طلب."
        />
      ) : (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {storeStats.map((store) => {
            const recent = store.recentOrders
              .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
              .slice(0, 3);

            const pendingCount    = store.recentOrders.filter((o) => o.status === 'pending').length;
            const completedCount  = store.recentOrders.filter((o) => o.status === 'completed').length;

            return (
              <Card key={store.name} padding="none" className="overflow-hidden">
                {/* Header */}
                <div className="flex items-start gap-3 px-5 pt-5 pb-4 border-b border-[var(--border-subtle)]">
                  <div className="flex items-center justify-center w-10 h-10 rounded-[var(--radius-md)] bg-[#4C8CE4]/10 text-[#4C8CE4] shrink-0">
                    <Store size={18} aria-hidden="true" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-[0.9375rem] font-semibold text-[var(--text-primary)]">{store.name}</h3>
                    <p className="text-xs text-[var(--text-muted)] mt-0.5">
                      آخر طلب: {new Date(store.lastOrderDate).toLocaleDateString('ar-SA', { month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-0 divide-x divide-x-reverse divide-[var(--border-subtle)] px-5 py-3 border-b border-[var(--border-subtle)]">
                  <div className="text-center pe-3">
                    <p className="text-base font-black text-[var(--text-primary)]">{store.orderCount}</p>
                    <p className="text-[0.6875rem] text-[var(--text-muted)]">إجمالي</p>
                  </div>
                  <div className="text-center px-3">
                    <p className="text-base font-black text-[#E8A020]">{pendingCount}</p>
                    <p className="text-[0.6875rem] text-[var(--text-muted)]">معلق</p>
                  </div>
                  <div className="text-center ps-3">
                    <p className="text-base font-black text-[#3D7A1F]">{completedCount}</p>
                    <p className="text-[0.6875rem] text-[var(--text-muted)]">مكتمل</p>
                  </div>
                </div>

                {/* Total value */}
                <div className="px-5 py-3 border-b border-[var(--border-subtle)]">
                  <p className="text-xs text-[var(--text-muted)]">إجمالي قيمة الطلبات</p>
                  <p className="text-sm font-bold text-[var(--text-primary)]">{store.totalValue.toLocaleString('ar-SA')} ل.س</p>
                </div>

                {/* Recent orders */}
                <div className="px-5 py-3">
                  <p className="text-xs font-semibold text-[var(--text-muted)] mb-2 uppercase tracking-wide">آخر الطلبات</p>
                  <div className="flex flex-col gap-1.5">
                    {recent.map((o) => (
                      <Link key={o.id} to={`/warehouse/orders/${o.id}`} className="flex items-center justify-between hover:bg-[var(--bg-surface-2)] -mx-2 px-2 py-1 rounded-[var(--radius-sm)] transition-colors">
                        <span className="text-xs font-medium text-[var(--text-primary)]">#{o.id}</span>
                        <OrderStatusBadge status={o.status} size="sm" />
                      </Link>
                    ))}
                  </div>
                </div>

                <div className="px-5 pb-5 pt-2">
                  <Link to="/warehouse/orders">
                    <Badge variant="neutral" className="w-full justify-center py-1.5 cursor-pointer hover:bg-[var(--interactive-secondary-hover)] transition-colors text-xs">
                      <ClipboardList size={12} aria-hidden="true" />
                      عرض الطلبات
                      <ArrowLeft size={11} aria-hidden="true" />
                    </Badge>
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </ContentContainer>
  );
}
