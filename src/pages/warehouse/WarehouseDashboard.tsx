import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Package, ClipboardList, AlertTriangle, CheckCircle2,
  TrendingUp, ArrowLeft, Plus, BarChart3, Store,
} from 'lucide-react';
import { ContentContainer } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/common/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useWarehouse } from '@/contexts/WarehouseContext';
import { OrderStatusBadge } from '@/components/store/OrderStatus';
import { StockUpdateModal } from '@/components/warehouse/StockUpdateModal';
import { ProductFormDrawer } from '@/components/warehouse/ProductFormDrawer';
import type { WarehouseProduct } from '@/types/store';
import { STOCK_LABELS } from '@/types/store';

// ============================================================
// Warehouse — Dashboard  /warehouse
// ============================================================

const stockBadgeVariant = { available: 'success', low: 'warning', out: 'error' } as const;

export function WarehouseDashboard() {
  const { products, orders, lowStockProducts, pendingOrderCount, settings, updateStock, addProduct } = useWarehouse();
  const [stockProduct, setStockProduct] = useState<WarehouseProduct | null>(null);
  const [addOpen, setAddOpen] = useState(false);

  const totalProducts   = products.length;
  const lowCount        = lowStockProducts.length;
  const processingCount = orders.filter((o) => ['accepted','processing'].includes(o.status)).length;
  const completedCount  = orders.filter((o) => o.status === 'completed').length;
  const recentOrders    = [...orders]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const KPI = [
    {
      label: 'إجمالي المنتجات',
      value: totalProducts,
      icon: <Package size={20} aria-hidden="true" />,
      color: 'text-[#4C8CE4]',
      bg: 'bg-[#4C8CE4]/10',
      path: '/warehouse/products',
      sub: 'في الكتالوج',
    },
    {
      label: 'منخفضة المخزون',
      value: lowCount,
      icon: <AlertTriangle size={20} aria-hidden="true" />,
      color: lowCount > 0 ? 'text-[#7A6E00]' : 'text-[#3D7A1F]',
      bg: lowCount > 0 ? 'bg-[#FFF799]/50' : 'bg-[#91D06C]/15',
      path: '/warehouse/inventory',
      sub: lowCount > 0 ? 'تحتاج مراجعة' : 'المخزون سليم',
    },
    {
      label: 'طلبات جديدة',
      value: pendingOrderCount,
      icon: <ClipboardList size={20} aria-hidden="true" />,
      color: 'text-[#406093]',
      bg: 'bg-[#406093]/10',
      path: '/warehouse/orders',
      sub: 'بانتظار التأكيد',
    },
    {
      label: 'قيد التجهيز',
      value: processingCount,
      icon: <TrendingUp size={20} aria-hidden="true" />,
      color: 'text-[#4C8CE4]',
      bg: 'bg-[#4C8CE4]/10',
      path: '/warehouse/orders',
      sub: 'طلبات نشطة',
    },
    {
      label: 'طلبات مكتملة',
      value: completedCount,
      icon: <CheckCircle2 size={20} aria-hidden="true" />,
      color: 'text-[#3D7A1F]',
      bg: 'bg-[#91D06C]/15',
      path: '/warehouse/orders',
      sub: 'تم التسليم',
    },
  ];

  return (
    <>
      <ContentContainer>
        <PageHeader
          title={settings.warehouseName}
          description="أدر منتجاتك ومخزونك وطلبات المحلات من مكان واحد."
          breadcrumbs={[{ label: 'لوحة التحكم' }]}
          primaryAction={
            <Button
              variant="primary"
              size="sm"
              iconStart={<Plus size={15} />}
              onClick={() => setAddOpen(true)}
            >
              إضافة منتج
            </Button>
          }
        />

        {/* KPI grid — 2 cols xs, 3 cols sm, 5 cols lg; last card centered if odd on sm */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
          {KPI.map((kpi, idx) => (
            <Link
              key={kpi.label}
              to={kpi.path}
              className={idx === 4 ? 'block col-span-2 sm:col-span-1' : 'block'}
            >
              <Card variant="interactive" padding="none" className="h-full">
                <div className="flex flex-col gap-2 p-3 sm:p-4">
                  <div className={`flex items-center justify-center w-9 h-9 rounded-[var(--radius-md)] ${kpi.bg}`}>
                    <span className={kpi.color}>{kpi.icon}</span>
                  </div>
                  <p className="text-xl sm:text-2xl font-black text-[var(--text-primary)] leading-none">
                    {kpi.value.toLocaleString('ar-SA')}
                  </p>
                  <div>
                    <p className="text-[0.6875rem] sm:text-xs font-semibold text-[var(--text-primary)]">{kpi.label}</p>
                    <p className="text-[0.625rem] sm:text-[0.6875rem] text-[var(--text-muted)]">{kpi.sub}</p>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mb-6">
          {/* Recent orders */}
          <div className="lg:col-span-2">
            <Card padding="none">
              <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-[var(--border-subtle)]">
                <h2 className="text-[0.9375rem] font-semibold text-[var(--text-primary)]">آخر الطلبات الواردة</h2>
                <Link to="/warehouse/orders" className="flex items-center gap-1 text-sm text-[#4C8CE4] hover:text-[#3B7BD4] font-medium transition-colors">
                  عرض الكل <ArrowLeft size={13} aria-hidden="true" />
                </Link>
              </div>

              {recentOrders.length === 0 ? (
                <div className="px-5 py-10 text-center text-sm text-[var(--text-muted)]">
                  لا توجد طلبات بعد.
                </div>
              ) : (
                <div className="divide-y divide-[var(--border-subtle)]">
                  {recentOrders.map((order) => (
                    <Link
                      key={order.id}
                      to={`/warehouse/orders/${order.id}`}
                      className="flex items-center justify-between gap-3 px-5 py-3 hover:bg-[var(--bg-surface-2)] transition-colors"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-[var(--text-primary)]">#{order.id}</p>
                        <p className="text-xs text-[var(--text-muted)] mt-0.5 truncate">
                          {order.storeName} · {order.items.length} منتج
                        </p>
                      </div>
                      <OrderStatusBadge status={order.status} size="sm" />
                    </Link>
                  ))}
                </div>
              )}
            </Card>
          </div>

          {/* Quick actions */}
          <div>
            <Card padding="md">
              <h2 className="text-[0.9375rem] font-semibold text-[var(--text-primary)] mb-4">إجراءات سريعة</h2>
              <div className="flex flex-col gap-2">
                {[
                  { label: 'إضافة منتج',     icon: <Plus size={16} />,        onClick: () => setAddOpen(true) },
                  { label: 'تحديث المخزون',  icon: <BarChart3 size={16} />,   path: '/warehouse/inventory' },
                  { label: 'عرض الطلبات',    icon: <ClipboardList size={16} />, path: '/warehouse/orders' },
                  { label: 'المنتجات',        icon: <Package size={16} />,      path: '/warehouse/products' },
                  { label: 'المحلات',         icon: <Store size={16} />,        path: '/warehouse/stores' },
                ].map((action, i) =>
                  action.path ? (
                    <Link key={i} to={action.path} className="block">
                      <Button variant="secondary" size="sm" fullWidth iconStart={action.icon} className="justify-start">
                        {action.label}
                      </Button>
                    </Link>
                  ) : (
                    <Button key={i} variant="secondary" size="sm" fullWidth iconStart={action.icon} className="justify-start" onClick={action.onClick}>
                      {action.label}
                    </Button>
                  )
                )}
              </div>
            </Card>
          </div>
        </div>

        {/* Low stock alert */}
        {lowStockProducts.length > 0 && (
          <Card padding="none">
            <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-[var(--border-subtle)]">
              <div className="flex items-center gap-2">
                <AlertTriangle size={15} className="text-[var(--status-warning-text)]" aria-hidden="true" />
                <h2 className="text-[0.9375rem] font-semibold text-[var(--text-primary)]">تنبيهات المخزون</h2>
                <Badge variant="warning" size="sm">{lowStockProducts.length}</Badge>
              </div>
              <Link to="/warehouse/inventory" className="text-xs text-[#4C8CE4] hover:text-[#3B7BD4] font-medium transition-colors">
                إدارة المخزون
              </Link>
            </div>
            <div className="divide-y divide-[var(--border-subtle)]">
              {lowStockProducts.slice(0, 4).map((p) => (
                <div key={p.id} className="flex items-center justify-between gap-4 px-5 py-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="w-8 h-8 rounded-[var(--radius-md)] shrink-0"
                      style={{ backgroundColor: p.imageColor + '44' }}
                      aria-hidden="true"
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-[var(--text-primary)] truncate">{p.name}</p>
                      <p className="text-xs text-[var(--text-muted)]">
                        المخزون: {p.stock} {p.unit}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <Badge variant={stockBadgeVariant[p.stockStatus]} size="sm">
                      {STOCK_LABELS[p.stockStatus]}
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setStockProduct(p)}
                    >
                      تحديث
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </ContentContainer>

      <StockUpdateModal
        open={stockProduct !== null}
        onClose={() => setStockProduct(null)}
        product={stockProduct}
        onSave={(id, stock) => updateStock(id, stock)}
      />

      <ProductFormDrawer
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onSave={addProduct}
      />
    </>
  );
}
