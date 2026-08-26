import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { ContentContainer } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/common/PageHeader';
import { EmptyState } from '@/components/ui/EmptyState';
import { ProductCard } from '@/components/store/ProductCard';
import { ProductDetailDrawer } from '@/components/store/ProductDetailDrawer';
import { useStore } from '@/contexts/StoreContext';
import { useApp } from '@/contexts/AppContext';
import type { Product } from '@/types/store';

// ============================================================
// Store — Favorites  /store/favorites
// ============================================================

export function StoreFavorites() {
  const { favorites } = useStore();
  const { products } = useApp();
  const navigate = useNavigate();
  const [detailProduct, setDetailProduct] = useState<Product | null>(null);

  const favoriteProducts = products.filter((p) => favorites.includes(p.id));

  return (
    <>
      <ContentContainer>
        <PageHeader
          title="المفضلة"
          description={
            favoriteProducts.length > 0
              ? `${favoriteProducts.length} منتج في المفضلة`
              : 'المنتجات التي حفظتها للرجوع إليها لاحقاً.'
          }
          breadcrumbs={[
            { label: 'لوحة التحكم', path: '/store' },
            { label: 'المفضلة' },
          ]}
        />

        {favoriteProducts.length === 0 ? (
          <EmptyState
            icon={<Heart size={28} />}
            title="لم تتم إضافة أي منتجات إلى المفضلة بعد"
            description="تصفح المنتجات المتاحة وأضف ما يعجبك إلى المفضلة للوصول إليه بسرعة."
            action={{
              label: 'تصفح المنتجات',
              onClick: () => navigate('/store/products'),
            }}
          />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {favoriteProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onViewDetails={setDetailProduct}
              />
            ))}
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
