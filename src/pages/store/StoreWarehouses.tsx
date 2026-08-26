import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Package, Star, Clock, X, Warehouse as WarehouseIcon } from 'lucide-react';
import { ContentContainer } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/common/PageHeader';
import { Card } from '@/components/ui/Card';
import { SearchInput } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { MOCK_WAREHOUSES } from '@/data/mockData';
import { CATEGORY_LABELS } from '@/types/store';
import type { Warehouse } from '@/types/store';

// ============================================================
// Store — Warehouses  /store/warehouses
// ============================================================

type SortKey = 'name' | 'rating' | 'products' | 'delivery';

function WarehouseCard({ warehouse }: { warehouse: Warehouse }) {
  const navigate = useNavigate();

  return (
    <Card variant="interactive" padding="none" className="overflow-hidden">
      {/* Header strip */}
      <div
        className="h-2 w-full"
        style={{
          background: warehouse.isOpen
            ? 'linear-gradient(90deg, #4C8CE4, #406093)'
            : 'var(--border-default)',
        }}
        aria-hidden="true"
      />

      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="min-w-0">
            <h3 className="text-[0.9375rem] font-semibold text-[var(--text-primary)] leading-snug">
              {warehouse.name}
            </h3>
            <div className="flex items-center gap-1.5 mt-1 text-xs text-[var(--text-muted)]">
              <MapPin size={12} aria-hidden="true" />
              <span>{warehouse.city} — {warehouse.address}</span>
            </div>
          </div>
          <Badge variant={warehouse.isOpen ? 'success' : 'neutral'} size="sm">
            {warehouse.isOpen ? 'مفتوح' : 'مغلق'}
          </Badge>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="flex flex-col items-center gap-0.5 p-2 rounded-[var(--radius-md)] bg-[var(--bg-surface-2)]">
            <Package size={14} className="text-[#4C8CE4]" aria-hidden="true" />
            <span className="text-sm font-bold text-[var(--text-primary)]">{warehouse.productCount}</span>
            <span className="text-[0.625rem] text-[var(--text-muted)]">منتج</span>
          </div>
          <div className="flex flex-col items-center gap-0.5 p-2 rounded-[var(--radius-md)] bg-[var(--bg-surface-2)]">
            <Star size={14} className="text-[#E8A020]" aria-hidden="true" />
            <span className="text-sm font-bold text-[var(--text-primary)]">{warehouse.rating.toFixed(1)}</span>
            <span className="text-[0.625rem] text-[var(--text-muted)]">تقييم</span>
          </div>
          <div className="flex flex-col items-center gap-0.5 p-2 rounded-[var(--radius-md)] bg-[var(--bg-surface-2)]">
            <Clock size={14} className="text-[#406093]" aria-hidden="true" />
            <span className="text-sm font-bold text-[var(--text-primary)]">{warehouse.deliveryDays}</span>
            <span className="text-[0.625rem] text-[var(--text-muted)]">يوم توصيل</span>
          </div>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap gap-1.5 mb-4" aria-label="الفئات المتاحة">
          {warehouse.categories.slice(0, 3).map((cat) => (
            <Badge key={cat} variant="neutral" size="sm">{CATEGORY_LABELS[cat]}</Badge>
          ))}
          {warehouse.categories.length > 3 && (
            <Badge variant="neutral" size="sm">+{warehouse.categories.length - 3}</Badge>
          )}
        </div>

        {/* Action */}
        <Button
          variant="primary"
          size="sm"
          fullWidth
          disabled={!warehouse.isOpen}
          iconStart={<Package size={15} />}
          onClick={() => navigate(`/store/products?warehouse=${warehouse.id}`)}
        >
          {warehouse.isOpen ? 'عرض المنتجات' : 'المستودع مغلق'}
        </Button>
      </div>
    </Card>
  );
}

export function StoreWarehouses() {
  const [search, setSearch] = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('rating');

  const cities = useMemo(
    () => [...new Set(MOCK_WAREHOUSES.map((w) => w.city))],
    []
  );

  const filtered = useMemo(() => {
    let list = [...MOCK_WAREHOUSES];

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (w) =>
          w.name.toLowerCase().includes(q) ||
          w.city.toLowerCase().includes(q) ||
          w.address.toLowerCase().includes(q)
      );
    }
    if (cityFilter) list = list.filter((w) => w.city === cityFilter);
    if (statusFilter === 'open') list = list.filter((w) => w.isOpen);
    if (statusFilter === 'closed') list = list.filter((w) => !w.isOpen);

    list.sort((a, b) => {
      if (sortKey === 'rating')   return b.rating - a.rating;
      if (sortKey === 'products') return b.productCount - a.productCount;
      if (sortKey === 'delivery') return a.deliveryDays - b.deliveryDays;
      return a.name.localeCompare(b.name, 'ar');
    });

    return list;
  }, [search, cityFilter, statusFilter, sortKey]);

  const hasFilters = search || cityFilter || statusFilter;

  const clearFilters = () => {
    setSearch('');
    setCityFilter('');
    setStatusFilter('');
  };

  return (
    <ContentContainer>
      <PageHeader
        title="المستودعات"
        description="تصفح المستودعات التجارية المتاحة واطلع على منتجاتها وشروط التوريد."
        breadcrumbs={[
          { label: 'لوحة التحكم', path: '/store' },
          { label: 'المستودعات' },
        ]}
      />

      {/* Filters bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex-1">
          <SearchInput
            placeholder="ابحث عن مستودع..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onClear={() => setSearch('')}
            aria-label="البحث في المستودعات"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <Select
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
            aria-label="تصفية حسب المدينة"
            className="min-w-[130px]"
          >
            <option value="">كل المدن</option>
            {cities.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </Select>
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            aria-label="تصفية حسب الحالة"
            className="min-w-[130px]"
          >
            <option value="">كل الحالات</option>
            <option value="open">مفتوح</option>
            <option value="closed">مغلق</option>
          </Select>
          <Select
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value as SortKey)}
            aria-label="ترتيب حسب"
            className="min-w-[140px]"
          >
            <option value="rating">الأعلى تقييماً</option>
            <option value="products">الأكثر منتجات</option>
            <option value="delivery">أسرع توصيل</option>
            <option value="name">الاسم</option>
          </Select>
        </div>
      </div>

      {/* Results summary */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <p className="text-sm text-[var(--text-muted)]">
          {filtered.length} مستودع
          {hasFilters && ' (نتائج مصفّاة)'}
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

      {/* Grid */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={<WarehouseIcon size={28} />}
          title="لا توجد مستودعات مطابقة"
          description="جرّب تعديل معايير البحث أو الفلاتر."
          action={{ label: 'مسح الفلاتر', onClick: clearFilters }}
        />
      ) : (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((wh) => (
            <WarehouseCard key={wh.id} warehouse={wh} />
          ))}
        </div>
      )}
    </ContentContainer>
  );
}
