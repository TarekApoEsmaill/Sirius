import { useState, useMemo } from 'react';
import { Plus, Pencil, Trash2, BarChart3, X, Search } from 'lucide-react';
import { ContentContainer } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/common/PageHeader';
import { Card } from '@/components/ui/Card';
import { SearchInput } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { ProductFormDrawer } from '@/components/warehouse/ProductFormDrawer';
import { StockUpdateModal } from '@/components/warehouse/StockUpdateModal';
import { DeleteConfirmModal } from '@/components/warehouse/DeleteConfirmModal';
import { useWarehouse } from '@/contexts/WarehouseContext';
import { useToast } from '@/components/ui/Toast';
import { CATEGORY_LABELS, STOCK_LABELS } from '@/types/store';
import type { WarehouseProduct, ProductCategory, StockStatus } from '@/types/store';
import { formatArabicDateShort } from '@/lib/business';

// ============================================================
// Warehouse — Products  /warehouse/products
// ============================================================

type SortKey = 'name' | 'price_asc' | 'price_desc' | 'stock';

const stockVariant = { available: 'success', low: 'warning', out: 'error' } as const;

function formatDate(iso: string) {
  return formatArabicDateShort(iso);
}

export function WarehouseProducts() {
  const { products, addProduct, updateProduct, deleteProduct, updateStock } = useWarehouse();
  const { toast } = useToast();

  const [search, setSearch]               = useState('');
  const [categoryFilter, setCategoryFilter] = useState<ProductCategory | ''>('');
  const [stockFilter, setStockFilter]     = useState<StockStatus | ''>('');
  const [sortKey, setSortKey]             = useState<SortKey>('name');

  const [addOpen, setAddOpen]             = useState(false);
  const [editProduct, setEditProduct]     = useState<WarehouseProduct | null>(null);
  const [stockProduct, setStockProduct]   = useState<WarehouseProduct | null>(null);
  const [deleteTarget, setDeleteTarget]   = useState<WarehouseProduct | null>(null);

  const filtered = useMemo(() => {
    let list = [...products];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((p) => p.name.toLowerCase().includes(q));
    }
    if (categoryFilter) list = list.filter((p) => p.category === categoryFilter);
    if (stockFilter)    list = list.filter((p) => p.stockStatus === stockFilter);
    list.sort((a, b) => {
      if (sortKey === 'price_asc')  return a.price - b.price;
      if (sortKey === 'price_desc') return b.price - a.price;
      if (sortKey === 'stock')      return b.stock - a.stock;
      return a.name.localeCompare(b.name, 'ar');
    });
    return list;
  }, [products, search, categoryFilter, stockFilter, sortKey]);

  const hasFilters = search || categoryFilter || stockFilter;
  const clearFilters = () => { setSearch(''); setCategoryFilter(''); setStockFilter(''); };

  const handleDelete = (p: WarehouseProduct) => {
    deleteProduct(p.id);
    toast({ type: 'success', title: 'تم الحذف', description: `تم حذف ${p.name} بنجاح.` });
  };

  const CATEGORIES = Object.entries(CATEGORY_LABELS) as [ProductCategory, string][];

  return (
    <>
      <ContentContainer>
        <PageHeader
          title="المنتجات"
          description="إدارة كتالوج المنتجات والأسعار والمخزون."
          breadcrumbs={[{ label: 'لوحة التحكم', path: '/warehouse' }, { label: 'المنتجات' }]}
          primaryAction={
            <Button variant="primary" size="sm" iconStart={<Plus size={15} />} onClick={() => setAddOpen(true)}>
              إضافة منتج
            </Button>
          }
        />

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="flex-1">
            <SearchInput
              placeholder="ابحث عن منتج..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onClear={() => setSearch('')}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value as ProductCategory | '')} className="min-w-[140px]">
              <option value="">كل الفئات</option>
              {CATEGORIES.map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </Select>
            <Select value={stockFilter} onChange={(e) => setStockFilter(e.target.value as StockStatus | '')} className="min-w-[130px]">
              <option value="">كل الحالات</option>
              {(Object.entries(STOCK_LABELS) as [StockStatus, string][]).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </Select>
            <Select value={sortKey} onChange={(e) => setSortKey(e.target.value as SortKey)} className="min-w-[150px]">
              <option value="name">الاسم</option>
              <option value="price_asc">السعر: الأقل</option>
              <option value="price_desc">السعر: الأعلى</option>
              <option value="stock">المخزون</option>
            </Select>
          </div>
        </div>

        {/* Results bar */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-[var(--text-muted)]">
            {filtered.length} منتج{hasFilters && ' (مصفّاة)'}
          </p>
          {hasFilters && (
            <button onClick={clearFilters} className="flex items-center gap-1 text-xs text-[#4C8CE4] hover:text-[#3B7BD4] font-medium transition-colors">
              <X size={12} aria-hidden="true" /> مسح الفلاتر
            </button>
          )}
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            icon={<Search size={28} />}
            title="لا توجد منتجات مطابقة"
            description={hasFilters ? 'جرّب تعديل الفلاتر.' : 'أضف منتجاً جديداً للبدء.'}
            action={hasFilters
              ? { label: 'مسح الفلاتر', onClick: clearFilters }
              : { label: 'إضافة منتج', onClick: () => setAddOpen(true) }
            }
          />
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block">
              <Card padding="none" className="overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm min-w-[700px]" aria-label="قائمة المنتجات">
                    <thead>
                      <tr className="bg-[var(--bg-surface-2)] border-b border-[var(--border-subtle)]">
                        {['المنتج', 'الفئة', 'السعر', 'الكمية', 'الحالة', 'آخر تحديث', 'الإجراءات'].map((h) => (
                          <th key={h} scope="col" className="px-4 py-3 text-start text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide whitespace-nowrap">
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
                              <div className="w-8 h-8 rounded-[var(--radius-md)] shrink-0" style={{ backgroundColor: p.imageColor + '44' }} aria-hidden="true" />
                              <div className="min-w-0">
                                <p className="font-medium text-[var(--text-primary)] truncate max-w-[160px]">{p.name}</p>
                                <p className="text-xs text-[var(--text-muted)]">{p.unit} · {p.packageSize}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-[var(--text-secondary)] whitespace-nowrap">
                            {CATEGORY_LABELS[p.category]}
                          </td>
                          <td className="px-4 py-3 font-semibold text-[var(--text-primary)] whitespace-nowrap">
                            {p.price.toLocaleString('ar-SA')} ل.س
                          </td>
                          <td className="px-4 py-3 text-[var(--text-secondary)]">
                            {p.stock} {p.unit}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex flex-col gap-1">
                              <Badge variant={stockVariant[p.stockStatus]} size="sm">{STOCK_LABELS[p.stockStatus]}</Badge>
                              {!p.isActive && <Badge variant="neutral" size="sm">معطّل</Badge>}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-xs text-[var(--text-muted)] whitespace-nowrap">
                            {formatDate(p.updatedAt)}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1">
                              <Button variant="ghost" size="sm" iconStart={<BarChart3 size={13} />} onClick={() => setStockProduct(p)} aria-label={`تحديث مخزون ${p.name}`}>
                                مخزون
                              </Button>
                              <Button variant="ghost" size="sm" iconStart={<Pencil size={13} />} onClick={() => setEditProduct(p)} aria-label={`تعديل ${p.name}`}>
                                تعديل
                              </Button>
                              <Button variant="ghost" size="sm" iconStart={<Trash2 size={13} />} onClick={() => setDeleteTarget(p)} aria-label={`حذف ${p.name}`} className="text-red-500 hover:bg-red-500/10 hover:text-red-500">
                                حذف
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden flex flex-col gap-3">
              {filtered.map((p) => (
                <Card key={p.id} padding="md">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-10 h-10 rounded-[var(--radius-md)] shrink-0" style={{ backgroundColor: p.imageColor + '44' }} aria-hidden="true" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-[var(--text-primary)] truncate">{p.name}</p>
                      <p className="text-xs text-[var(--text-muted)]">{CATEGORY_LABELS[p.category]}</p>
                    </div>
                    <Badge variant={stockVariant[p.stockStatus]} size="sm">{STOCK_LABELS[p.stockStatus]}</Badge>
                  </div>
                  <div className="flex items-center justify-between text-xs text-[var(--text-muted)] mb-3">
                    <span className="font-semibold text-[var(--text-primary)]">{p.price.toLocaleString('ar-SA')} ل.س</span>
                    <span>{p.stock} {p.unit}</span>
                  </div>
                  <div className="flex items-center gap-2 border-t border-[var(--border-subtle)] pt-3">
                    <Button variant="ghost" size="sm" iconStart={<BarChart3 size={13} />} onClick={() => setStockProduct(p)} className="flex-1 justify-center">مخزون</Button>
                    <Button variant="ghost" size="sm" iconStart={<Pencil size={13} />} onClick={() => setEditProduct(p)} className="flex-1 justify-center">تعديل</Button>
                    <Button variant="ghost" size="sm" iconStart={<Trash2 size={13} />} onClick={() => setDeleteTarget(p)} className="flex-1 justify-center text-red-500 hover:bg-red-500/10">حذف</Button>
                  </div>
                </Card>
              ))}
            </div>
          </>
        )}
      </ContentContainer>

      <ProductFormDrawer open={addOpen} onClose={() => setAddOpen(false)} onSave={(p) => { addProduct(p); toast({ type: 'success', title: 'تم إضافة المنتج', description: p.name }); }} />
      <ProductFormDrawer open={editProduct !== null} onClose={() => setEditProduct(null)} onSave={(p) => { updateProduct(p); toast({ type: 'success', title: 'تم التحديث', description: p.name }); }} editProduct={editProduct} />
      <StockUpdateModal open={stockProduct !== null} onClose={() => setStockProduct(null)} product={stockProduct} onSave={(id, s) => { updateStock(id, s); toast({ type: 'success', title: 'تم تحديث المخزون' }); }} />
      <DeleteConfirmModal open={deleteTarget !== null} onClose={() => setDeleteTarget(null)} onConfirm={() => deleteTarget && handleDelete(deleteTarget)} productName={deleteTarget?.name ?? ''} />
    </>
  );
}
