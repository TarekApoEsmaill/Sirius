import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { LayoutGrid, List, X, SlidersHorizontal } from 'lucide-react';
import { ContentContainer } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/common/PageHeader';
import { SearchInput } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { EmptyState } from '@/components/ui/EmptyState';
import { Badge } from '@/components/ui/Badge';
import { ProductCard, ProductCardSkeleton } from '@/components/store/ProductCard';
import { ProductDetailDrawer } from '@/components/store/ProductDetailDrawer';
import { MOCK_WAREHOUSES } from '@/data/mockData';
import { useApp } from '@/contexts/AppContext';
import { CATEGORY_LABELS, STOCK_LABELS } from '@/types/store';
import type { Product, ProductCategory, StockStatus } from '@/types/store';
import { cn } from '@/lib/utils';
import { useStore } from '@/contexts/StoreContext';

// ============================================================
// Store — Products  /store/products
// ============================================================

type ViewMode = 'grid' | 'list';
type SortKey = 'name' | 'price_asc' | 'price_desc' | 'stock';

const CATEGORIES = Object.entries(CATEGORY_LABELS) as [ProductCategory, string][];

export function StoreProducts() {
  const [searchParams] = useSearchParams();
  const { getCartItem } = useStore();
  const { products: liveProducts } = useApp();

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<ProductCategory | ''>('');
  const [warehouseFilter, setWarehouseFilter] = useState(searchParams.get('warehouse') ?? '');
  const [stockFilter, setStockFilter] = useState<StockStatus | ''>('');
  const [sortKey, setSortKey] = useState<SortKey>('name');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [detailProduct, setDetailProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  // Simulate loading
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(t);
  }, []);

  // Sync warehouse param
  useEffect(() => {
    const wh = searchParams.get('warehouse');
    if (wh) setWarehouseFilter(wh);
  }, [searchParams]);

  const filtered = useMemo(() => {
    // Use live products from AppContext — reflects warehouse CRUD changes
    let list = [...liveProducts];

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (p) => p.name.toLowerCase().includes(q) || CATEGORY_LABELS[p.category].toLowerCase().includes(q)
      );
    }
    if (categoryFilter) list = list.filter((p) => p.category === categoryFilter);
    if (warehouseFilter) list = list.filter((p) => p.warehouseId === warehouseFilter);
    if (stockFilter) list = list.filter((p) => p.stockStatus === stockFilter);

    list.sort((a, b) => {
      if (sortKey === 'price_asc')  return a.price - b.price;
      if (sortKey === 'price_desc') return b.price - a.price;
      if (sortKey === 'stock')      return b.stock - a.stock;
      return a.name.localeCompare(b.name, 'ar');
    });

    return list;
  }, [search, categoryFilter, warehouseFilter, stockFilter, sortKey, liveProducts]);

  const hasFilters = search || categoryFilter || warehouseFilter || stockFilter;

  const clearFilters = () => {
    setSearch('');
    setCategoryFilter('');
    setWarehouseFilter('');
    setStockFilter('');
  };

  const activeWarehouse = MOCK_WAREHOUSES.find((w) => w.id === warehouseFilter);

  return (
    <>
      <ContentContainer>
        <PageHeader
          title="المنتجات"
          description="تصفح آلاف المنتجات المتاحة من المستودعات وأضفها مباشرةً إلى سلتك."
          breadcrumbs={[
            { label: 'لوحة التحكم', path: '/store' },
            ...(activeWarehouse
              ? [{ label: 'المستودعات', path: '/store/warehouses' }, { label: activeWarehouse.name }]
              : [{ label: 'المنتجات' }]),
          ]}
        />

        {/* Filter bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="flex-1">
            <SearchInput
              placeholder="ابحث عن منتج..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onClear={() => setSearch('')}
              aria-label="البحث في المنتجات"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value as ProductCategory | '')}
              aria-label="تصفية حسب الفئة"
              className="min-w-[140px]"
            >
              <option value="">كل الفئات</option>
              {CATEGORIES.map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </Select>
            <Select
              value={warehouseFilter}
              onChange={(e) => setWarehouseFilter(e.target.value)}
              aria-label="تصفية حسب المستودع"
              className="min-w-[160px]"
            >
              <option value="">كل المستودعات</option>
              {MOCK_WAREHOUSES.map((w) => (
                <option key={w.id} value={w.id}>{w.name}</option>
              ))}
            </Select>
            <Select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value as StockStatus | '')}
              aria-label="تصفية حسب التوفر"
              className="min-w-[130px]"
            >
              <option value="">كل الحالات</option>
              {(Object.entries(STOCK_LABELS) as [StockStatus, string][]).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </Select>
            <Select
              value={sortKey}
              onChange={(e) => setSortKey(e.target.value as SortKey)}
              aria-label="ترتيب حسب"
              className="min-w-[140px]"
            >
              <option value="name">الاسم</option>
              <option value="price_asc">السعر: الأقل أولاً</option>
              <option value="price_desc">السعر: الأعلى أولاً</option>
              <option value="stock">المخزون المتاح</option>
            </Select>
          </div>
        </div>

        {/* Results bar */}
        <div className="flex items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-3">
            <p className="text-sm text-[var(--text-muted)]">
              {loading ? '…' : `${filtered.length} منتج`}
              {hasFilters && !loading && ' (نتائج مصفّاة)'}
            </p>
            {hasFilters && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 text-xs text-[#4C8CE4] hover:text-[#3B7BD4] font-medium transition-colors"
              >
                <X size={12} aria-hidden="true" />
                مسح الفلاتر
              </button>
            )}
          </div>
          {/* View toggle */}
          <div className="flex items-center border border-[var(--border-default)] rounded-[var(--radius-md)] overflow-hidden">
            {(['grid', 'list'] as ViewMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                aria-label={mode === 'grid' ? 'عرض شبكي' : 'عرض قائمة'}
                aria-pressed={viewMode === mode}
                className={cn(
                  'flex items-center justify-center w-8 h-8 transition-colors duration-[120ms]',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#4C8CE4]/40',
                  viewMode === mode
                    ? 'bg-[#4C8CE4] text-white'
                    : 'text-[var(--text-muted)] hover:bg-[var(--interactive-secondary)]'
                )}
              >
                {mode === 'grid' ? <LayoutGrid size={15} /> : <List size={15} />}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className={cn(
            viewMode === 'grid'
              ? 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4'
              : 'flex flex-col gap-3'
          )}>
            {Array.from({ length: 8 }).map((_, i) => (
              <ProductCardSkeleton key={i} className={viewMode === 'list' ? 'flex-row' : ''} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<SlidersHorizontal size={28} />}
            title="لا توجد منتجات مطابقة"
            description="جرّب تعديل معايير البحث أو الفلاتر."
            action={{ label: 'مسح الفلاتر', onClick: clearFilters }}
          />
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {filtered.map((p) => (
              <ProductCard key={p.id} product={p} onViewDetails={setDetailProduct} />
            ))}
          </div>
        ) : (
          /* List view */
          <div className="flex flex-col divide-y divide-[var(--border-subtle)] border border-[var(--border-subtle)] rounded-[var(--radius-lg)] overflow-hidden">
            {filtered.map((p) => {
              const wh = MOCK_WAREHOUSES.find((w) => w.id === p.warehouseId);
              const cartItem = getCartItem(p.id);
              return (
                <button
                  key={p.id}
                  onClick={() => setDetailProduct(p)}
                  className="flex items-center gap-4 px-4 py-3 text-start bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-2)] transition-colors"
                  aria-label={`${p.name} — ${p.price.toLocaleString('ar-SA')} ل.س`}
                >
                  {/* Color swatch */}
                  <div
                    className="w-12 h-12 rounded-[var(--radius-md)] shrink-0 flex items-center justify-center"
                    style={{ backgroundColor: p.imageColor + '44' }}
                    aria-hidden="true"
                  >
                    <div className="w-6 h-6 rounded-full opacity-40" style={{ backgroundColor: p.imageColor }} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-[var(--text-primary)] truncate">{p.name}</p>
                    <p className="text-xs text-[var(--text-muted)] truncate">
                      {CATEGORY_LABELS[p.category]} · {wh?.name}
                    </p>
                  </div>

                  <div className="shrink-0 text-start hidden sm:flex flex-col items-end gap-1">
                    <span className="text-sm font-bold text-[var(--text-primary)]">
                      {p.price.toLocaleString('ar-SA')} ل.س
                    </span>
                    <span className="text-xs text-[var(--text-muted)]">/ {p.unit}</span>
                  </div>

                  <Badge
                    variant={p.stockStatus === 'available' ? 'success' : p.stockStatus === 'low' ? 'warning' : 'error'}
                    size="sm"
                    className="hidden sm:inline-flex shrink-0"
                  >
                    {STOCK_LABELS[p.stockStatus]}
                  </Badge>

                  {cartItem && (
                    <Badge variant="brand" size="sm" className="shrink-0">
                      {cartItem.quantity} في السلة
                    </Badge>
                  )}
                </button>
              );
            })}
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
