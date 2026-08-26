import { useState, useMemo } from 'react';
import { BarChart3, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';
import { ContentContainer } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/common/PageHeader';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Tabs } from '@/components/ui/Tabs';
import { StockUpdateModal } from '@/components/warehouse/StockUpdateModal';
import { useWarehouse } from '@/contexts/WarehouseContext';
import { useToast } from '@/components/ui/Toast';
import { STOCK_LABELS, CATEGORY_LABELS } from '@/types/store';
import type { WarehouseProduct, StockStatus } from '@/types/store';
import { formatArabicDateShort } from '@/lib/business';

// ============================================================
// Warehouse — Inventory  /warehouse/inventory
// ============================================================

const stockVariant  = { available: 'success', low: 'warning', out: 'error' } as const;
const stockIcons: Record<StockStatus, React.ReactNode> = {
  available: <CheckCircle2 size={13} aria-hidden="true" />,
  low:       <AlertTriangle size={13} aria-hidden="true" />,
  out:       <XCircle size={13} aria-hidden="true" />,
};

function formatDate(iso: string) {
  return formatArabicDateShort(iso);
}

const STATUS_TABS = [
  { key: 'all',       label: 'الكل' },
  { key: 'low',       label: 'منخفض' },
  { key: 'out',       label: 'نفذ' },
  { key: 'available', label: 'متوفر' },
];

export function WarehouseInventory() {
  const { products, updateStock } = useWarehouse();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('all');
  const [stockProduct, setStockProduct] = useState<WarehouseProduct | null>(null);

  const filtered = useMemo(() => {
    if (activeTab === 'all') return products;
    return products.filter((p) => p.stockStatus === activeTab);
  }, [products, activeTab]);

  const counts = useMemo(() => ({
    all:       products.length,
    available: products.filter((p) => p.stockStatus === 'available').length,
    low:       products.filter((p) => p.stockStatus === 'low').length,
    out:       products.filter((p) => p.stockStatus === 'out').length,
  }), [products]);

  const tabsWithCounts = STATUS_TABS.map((t) => ({
    ...t,
    count: counts[t.key as keyof typeof counts],
  }));

  const handleSave = (id: string, stock: number) => {
    updateStock(id, stock);
    toast({ type: 'success', title: 'تم تحديث المخزون بنجاح.' });
  };

  return (
    <>
      <ContentContainer>
        <PageHeader
          title="إدارة المخزون"
          description="راقب مستويات مخزون منتجاتك وحدّثها بسهولة."
          breadcrumbs={[{ label: 'لوحة التحكم', path: '/warehouse' }, { label: 'المخزون' }]}
        />

        {/* Summary cards */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: 'متوفر',   count: counts.available, variant: 'success', icon: <CheckCircle2 size={16} /> },
            { label: 'منخفض',   count: counts.low,       variant: 'warning', icon: <AlertTriangle size={16} /> },
            { label: 'نفذ',     count: counts.out,       variant: 'error',   icon: <XCircle size={16} /> },
          ].map((s) => (
            <Card key={s.label} padding="md">
              <div className="flex items-center gap-3">
                <Badge variant={s.variant as 'success' | 'warning' | 'error'} size="sm">
                  {s.icon}
                </Badge>
                <div>
                  <p className="text-xl font-black text-[var(--text-primary)]">{s.count}</p>
                  <p className="text-xs text-[var(--text-muted)]">{s.label}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Filter tabs */}
        <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0 mb-5">
          <Tabs
            tabs={tabsWithCounts}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            variant="line"
            className="min-w-max"
          />
        </div>

        {/* Desktop table */}
        <div className="hidden sm:block">
          <Card padding="none" className="overflow-hidden">
            <table className="w-full text-sm" aria-label="جدول المخزون">
              <thead>
                <tr className="bg-[var(--bg-surface-2)] border-b border-[var(--border-subtle)]">
                  {['المنتج', 'الفئة', 'المخزون الحالي', 'حد التنبيه', 'الحالة', 'آخر تحديث', ''].map((h) => (
                    <th key={h} scope="col" className="px-4 py-3 text-start text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border-subtle)]">
                {filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-[var(--bg-surface-2)] transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-[var(--radius-md)] shrink-0" style={{ backgroundColor: p.imageColor + '44' }} aria-hidden="true" />
                        <span className="font-medium text-[var(--text-primary)] truncate max-w-[180px]">{p.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[var(--text-muted)] text-xs">{CATEGORY_LABELS[p.category]}</td>
                    <td className="px-4 py-3">
                      <span className={`font-semibold ${p.stockStatus === 'out' ? 'text-[var(--status-error-text)]' : p.stockStatus === 'low' ? 'text-[var(--status-warning-text)]' : 'text-[var(--text-primary)]'}`}>
                        {p.stock}
                      </span>
                      <span className="text-[var(--text-muted)] text-xs"> {p.unit}</span>
                    </td>
                    <td className="px-4 py-3 text-[var(--text-muted)] text-xs">{p.minStock} {p.unit}</td>
                    <td className="px-4 py-3">
                      <Badge variant={stockVariant[p.stockStatus]} size="sm">
                        <span className="shrink-0">{stockIcons[p.stockStatus]}</span>
                        {STOCK_LABELS[p.stockStatus]}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-xs text-[var(--text-muted)]">{formatDate(p.updatedAt)}</td>
                    <td className="px-4 py-3">
                      <Button variant="outline" size="sm" iconStart={<BarChart3 size={13} />} onClick={() => setStockProduct(p)}>
                        تحديث
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>

        {/* Mobile cards */}
        <div className="sm:hidden flex flex-col gap-3">
          {filtered.map((p) => (
            <Card key={p.id} padding="md">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-[var(--radius-md)] shrink-0" style={{ backgroundColor: p.imageColor + '44' }} aria-hidden="true" />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-[var(--text-primary)] truncate">{p.name}</p>
                    <p className="text-xs text-[var(--text-muted)]">{CATEGORY_LABELS[p.category]}</p>
                  </div>
                </div>
                <Badge variant={stockVariant[p.stockStatus]} size="sm">
                  {stockIcons[p.stockStatus]}
                  {STOCK_LABELS[p.stockStatus]}
                </Badge>
              </div>
              <div className="flex items-center justify-between text-xs text-[var(--text-muted)] mb-3">
                <span>الكمية: <strong className="text-[var(--text-primary)]">{p.stock}</strong> {p.unit}</span>
                <span>حد التنبيه: {p.minStock}</span>
              </div>
              <Button variant="outline" size="sm" fullWidth iconStart={<BarChart3 size={13} />} onClick={() => setStockProduct(p)}>
                تحديث المخزون
              </Button>
            </Card>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="py-12 text-center text-sm text-[var(--text-muted)]">
            لا توجد منتجات بهذه الحالة.
          </div>
        )}
      </ContentContainer>

      <StockUpdateModal
        open={stockProduct !== null}
        onClose={() => setStockProduct(null)}
        product={stockProduct}
        onSave={handleSave}
      />
    </>
  );
}
