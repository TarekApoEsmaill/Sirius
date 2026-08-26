import { useState, useMemo } from 'react';
import {
  ClipboardList, ShoppingCart, Warehouse, CheckCircle2,
  ArrowLeft, Package, Search, TrendingUp,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { ContentContainer } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/common/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useStore } from '@/contexts/StoreContext';
import { useApp } from '@/contexts/AppContext';
import { MOCK_WAREHOUSES } from '@/data/mockData';
import { OrderStatusBadge } from '@/components/store/OrderStatus';
import { ProductMiniCard } from '@/components/store/ProductCard';
import { ProductDetailDrawer } from '@/components/store/ProductDetailDrawer';
import type { Product } from '@/types/store';

// ============================================================
// Store — Dashboard  /store
// ============================================================

export function StoreDashboard() {
  const { orders, cartCount, settings } = useStore();
  const { products } = useApp();
  const [detailProduct, setDetailProduct] = useState<Product | null>(null);

  // KPI derivations
  const total          = orders.length;
  const processing     = orders.filter((o) => ['pending','accepted','processing'].includes(o.status)).length;
  const completed      = orders.filter((o) => o.status === 'completed').length;
  const warehouseCount = MOCK_WAREHOUSES.filter((w) => w.isOpen).length;

  // Sort orders by most recent first
  const recentOrders = useMemo(
    () => [...orders]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5),
    [orders]
  );

  // Featured products from live AppContext (reflects warehouse CRUD)
  const featured = useMemo(
    () => products.filter((p) => p.isFeatured).slice(0, 4),
    [products]
  );

  const KPI = [
    {
      label: 'إجمالي الطلبات',
      value: total,
      icon: <ClipboardList size={20} aria-hidden="true" />,
      color: 'text-[#4C8CE4]',
      bg: 'bg-[#4C8CE4]/10',
      path: '/store/orders',
      sub: 'منذ بداية الاستخدام',
    },
    {
      label: 'قيد المعالجة',
      value: processing,
      icon: <TrendingUp size={20} aria-hidden="true" />,
      color: 'text-[#E8A020]',
      bg: 'bg-[#FFF799]/50',
      path: '/store/orders',
      sub: 'تحتاج متابعة',
    },
    {
      label: 'الطلبات المكتملة',
      value: completed,
      icon: <CheckCircle2 size={20} aria-hidden="true" />,
      color: 'text-[#3D7A1F]',
      bg: 'bg-[#91D06C]/15',
      path: '/store/orders',
      sub: 'تم استلامها',
    },
    {
      label: 'مستودعات متاحة',
      value: warehouseCount,
      icon: <Warehouse size={20} aria-hidden="true" />,
      color: 'text-[#406093]',
      bg: 'bg-[#406093]/10',
      path: '/store/warehouses',
      sub: 'جاهزة للتوريد',
    },
  ];

  return (
    <>
      <ContentContainer>
        {/* Header */}
        <PageHeader
          title={`مرحباً، ${settings.storeName}`}
          description="اكتشف المستودعات المتاحة وتصفح المنتجات وأدر مشترياتك بسهولة."
          breadcrumbs={[{ label: 'لوحة التحكم' }]}
          primaryAction={
            <Link to="/store/products">
              <Button variant="primary" size="sm" iconStart={<Package size={15} />}>
                تصفح المنتجات
              </Button>
            </Link>
          }
        />

        {/* KPI grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
          {KPI.map((kpi) => (
            <Link key={kpi.label} to={kpi.path} className="block group">
              <Card variant="interactive" padding="none" className="h-full">
                <div className="flex items-start gap-2 sm:gap-3 p-3 sm:p-4">
                  <div className={`flex items-center justify-center w-9 h-9 rounded-[var(--radius-md)] shrink-0 ${kpi.bg}`}>
                    <span className={kpi.color}>{kpi.icon}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[0.6875rem] sm:text-xs text-[var(--text-muted)] truncate leading-tight">{kpi.label}</p>
                    <p className="text-xl sm:text-2xl font-black text-[var(--text-primary)] leading-none my-1">
                      {kpi.value.toLocaleString('ar-SA')}
                    </p>
                    <p className="text-[0.6875rem] sm:text-xs text-[var(--text-muted)]">{kpi.sub}</p>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          {/* Recent orders */}
          <div className="lg:col-span-2">
            <Card padding="none">
              <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-[var(--border-subtle)]">
                <h2 className="text-[0.9375rem] font-semibold text-[var(--text-primary)]">آخر الطلبات</h2>
                <Link
                  to="/store/orders"
                  className="flex items-center gap-1 text-sm text-[#4C8CE4] hover:text-[#3B7BD4] font-medium transition-colors"
                >
                  عرض الكل <ArrowLeft size={13} aria-hidden="true" />
                </Link>
              </div>

              {recentOrders.length === 0 ? (
                <div className="px-5 py-10 text-center text-sm text-[var(--text-muted)]">
                  لا توجد طلبات حتى الآن.
                </div>
              ) : (
                <div className="divide-y divide-[var(--border-subtle)]">
                  {recentOrders.map((order) => (
                    <Link
                      key={order.id}
                      to={`/store/orders/${order.id}`}
                      className="flex items-center justify-between gap-3 px-5 py-3.5 hover:bg-[var(--bg-surface-2)] transition-colors"
                    >
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-[var(--text-primary)]">
                          #{order.id}
                        </p>
                        <p className="text-xs text-[var(--text-muted)] mt-0.5 truncate">
                          {order.warehouseName} · {order.items.length} منتج
                        </p>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-sm font-semibold text-[var(--text-primary)] hidden sm:block">
                          {order.total.toLocaleString('ar-SA')} ل.س
                        </span>
                        <OrderStatusBadge status={order.status} size="sm" />
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </Card>
          </div>

          {/* Quick actions */}
          <div className="flex flex-col gap-4">
            <Card padding="md">
              <h2 className="text-[0.9375rem] font-semibold text-[var(--text-primary)] mb-4">إجراءات سريعة</h2>
              <div className="flex flex-col gap-2">
                {[
                  { label: 'تصفح المستودعات', path: '/store/warehouses', icon: <Warehouse size={16} /> },
                  { label: 'البحث عن منتج', path: '/store/products', icon: <Search size={16} /> },
                  { label: 'عرض الطلبات', path: '/store/orders', icon: <ClipboardList size={16} /> },
                  {
                    label: `السلة${cartCount > 0 ? ` (${cartCount})` : ''}`,
                    path: '/store/cart',
                    icon: <ShoppingCart size={16} />,
                  },
                ].map((action) => (
                  <Link key={action.path} to={action.path} className="block">
                    <Button
                      variant="secondary"
                      size="sm"
                      fullWidth
                      iconStart={action.icon}
                      className="justify-start"
                    >
                      {action.label}
                    </Button>
                  </Link>
                ))}
              </div>
            </Card>
          </div>
        </div>

        {/* Featured products */}
        {featured.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[0.9375rem] font-semibold text-[var(--text-primary)]">منتجات مقترحة</h2>
              <Link
                to="/store/products"
                className="flex items-center gap-1 text-sm text-[#4C8CE4] hover:text-[#3B7BD4] font-medium transition-colors"
              >
                عرض الكل <ArrowLeft size={13} aria-hidden="true" />
              </Link>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              {featured.map((p) => (
                <ProductMiniCard
                  key={p.id}
                  product={p}
                  onViewDetails={setDetailProduct}
                />
              ))}
            </div>
          </div>
        )}
      </ContentContainer>

      <ProductDetailDrawer
        product={detailProduct}
        open={detailProduct !== null}
        onClose={() => setDetailProduct(null)}
      />
    </>
  );
}
