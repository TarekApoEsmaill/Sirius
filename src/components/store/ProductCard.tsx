import { useState } from 'react';
import { ShoppingCart, Heart, Plus, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { useStore } from '@/contexts/StoreContext';
import { useToast } from '@/components/ui/Toast';
import { CATEGORY_LABELS, STOCK_LABELS } from '@/types/store';
import type { Product } from '@/types/store';
import { getWarehouseById } from '@/data/mockData';

// ============================================================
// SIRIUS — Product Card Component
// ============================================================

interface ProductCardProps {
  product: Product;
  onViewDetails?: (product: Product) => void;
  className?: string;
}

const stockBadgeVariant = {
  available: 'success',
  low: 'warning',
  out: 'error',
} as const;

// Color-based placeholder image
function ProductImagePlaceholder({ color }: { color: string }) {
  return (
    <div
      className="w-full h-full flex items-center justify-center rounded-[var(--radius-md)]"
      style={{ backgroundColor: color + '33' }}
      aria-hidden="true"
    >
      <div
        className="w-12 h-12 rounded-full opacity-40"
        style={{ backgroundColor: color }}
      />
    </div>
  );
}

export function ProductCard({ product, onViewDetails, className }: ProductCardProps) {
  const { addToCart, toggleFavorite, isFavorite, getCartItem } = useStore();
  const { toast } = useToast();
  const [added, setAdded] = useState(false);

  const warehouse = getWarehouseById(product.warehouseId);
  const inCart = getCartItem(product.id);
  const favorite = isFavorite(product.id);
  const isOut = product.stockStatus === 'out';

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isOut) return;
    addToCart({
      productId: product.id,
      productName: product.name,
      warehouseId: product.warehouseId,
      warehouseName: warehouse?.name ?? '',
      unitPrice: product.price,
      unit: product.unit,
      maxStock: product.stock,
      quantity: 1,
    });
    setAdded(true);
    toast({ type: 'success', title: 'تمت الإضافة إلى السلة', description: product.name, duration: 2500 });
    setTimeout(() => setAdded(false), 1800);
  };

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorite(product.id);
    toast({
      type: favorite ? 'neutral' : 'info',
      title: favorite ? 'تمت الإزالة من المفضلة' : 'تمت الإضافة إلى المفضلة',
      duration: 1800,
    });
  };

  return (
    <motion.article
      whileHover={{ y: -2 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
      className={cn(
        'group relative flex flex-col',
        'bg-[var(--bg-surface)] border border-[var(--border-subtle)]',
        'rounded-[var(--radius-lg)] shadow-[var(--shadow-card)]',
        'overflow-hidden cursor-pointer',
        'hover:border-[var(--border-default)] hover:shadow-[0_4px_16px_0_rgb(0_0_0/0.08)]',
        'transition-shadow duration-[220ms]',
        className
      )}
      onClick={() => onViewDetails?.(product)}
      role="button"
      tabIndex={0}
      aria-label={`${product.name} — ${product.price.toLocaleString('ar-SA')} ل.س`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onViewDetails?.(product);
        }
      }}
    >
      {/* Image area */}
      <div className="relative h-36 bg-[var(--bg-surface-2)] shrink-0">
        <ProductImagePlaceholder color={product.imageColor} />

        {/* Favorite button — 36×36 min touch target */}
        <button
          onClick={handleToggleFavorite}
          aria-label={favorite ? 'إزالة من المفضلة' : 'إضافة إلى المفضلة'}
          aria-pressed={favorite}
          className={cn(
            'absolute top-2 end-2',
            'flex items-center justify-center w-8 h-8 rounded-full',
            'bg-[var(--bg-surface)]/90 backdrop-blur-sm',
            'border border-[var(--border-subtle)]',
            'transition-all duration-[120ms]',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4C8CE4]/40',
            favorite
              ? 'text-red-500 border-red-200'
              : 'text-[var(--text-muted)] hover:text-red-400'
          )}
        >
          <Heart
            size={13}
            aria-hidden="true"
            fill={favorite ? 'currentColor' : 'none'}
          />
        </button>

        {/* Stock badge */}
        <div className="absolute top-2 start-2">
          <Badge variant={stockBadgeVariant[product.stockStatus]} size="sm">
            {STOCK_LABELS[product.stockStatus]}
          </Badge>
        </div>

        {/* Cart indicator */}
        {inCart && (
          <div className="absolute bottom-2 start-2">
            <Badge variant="brand" size="sm">
              <ShoppingCart size={10} aria-hidden="true" />
              {inCart.quantity} في السلة
            </Badge>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col gap-2 p-3 flex-1">
        {/* Category */}
        <span className="text-[0.6875rem] font-medium text-[var(--text-muted)] uppercase tracking-wide">
          {CATEGORY_LABELS[product.category]}
        </span>

        {/* Name */}
        <h3 className="text-sm font-semibold text-[var(--text-primary)] leading-snug line-clamp-2">
          {product.name}
        </h3>

        {/* Warehouse */}
        {warehouse && (
          <p className="text-xs text-[var(--text-muted)] truncate">{warehouse.name}</p>
        )}

        {/* Price + Unit */}
        <div className="flex items-baseline gap-1.5 mt-auto">
          <span className="text-base font-bold text-[var(--text-primary)]">
            {product.price.toLocaleString('ar-SA')}
          </span>
          <span className="text-xs text-[var(--text-muted)]">ل.س / {product.unit}</span>
        </div>

        <p className="text-[0.6875rem] text-[var(--text-muted)]">{product.packageSize}</p>

        {/* Add to cart — h-9 for comfortable tap target */}
        <button
          onClick={handleAddToCart}
          disabled={isOut}
          aria-label={isOut ? 'نفذ المخزون' : `إضافة ${product.name} إلى السلة`}
          className={cn(
            'mt-1 flex items-center justify-center gap-1.5 h-9 rounded-[var(--radius-md)]',
            'text-xs font-semibold transition-all duration-[120ms]',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4C8CE4]/40',
            isOut
              ? 'bg-[var(--bg-surface-3)] text-[var(--text-disabled)] cursor-not-allowed'
              : added
              ? 'bg-[#91D06C]/15 text-[#3D7A1F] border border-[#91D06C]/30'
              : 'bg-[#4C8CE4]/10 text-[#4C8CE4] hover:bg-[#4C8CE4] hover:text-white border border-[#4C8CE4]/20 hover:border-[#4C8CE4]'
          )}
        >
          <AnimatePresence mode="wait" initial={false}>
            {added ? (
              <motion.span
                key="added"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.15 }}
                className="flex items-center gap-1"
              >
                <Check size={13} aria-hidden="true" />
                تمت الإضافة
              </motion.span>
            ) : (
              <motion.span
                key="add"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.15 }}
                className="flex items-center gap-1"
              >
                {isOut ? (
                  'نفذ المخزون'
                ) : (
                  <>
                    <Plus size={13} aria-hidden="true" />
                    إضافة للسلة
                  </>
                )}
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </motion.article>
  );
}

// ── Skeleton ─────────────────────────────────────────────────
export function ProductCardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'flex flex-col bg-[var(--bg-surface)] border border-[var(--border-subtle)]',
        'rounded-[var(--radius-lg)] overflow-hidden',
        className
      )}
      aria-hidden="true"
    >
      <div className="h-36 bg-[var(--border-subtle)] animate-pulse" />
      <div className="p-3 flex flex-col gap-2">
        <div className="h-3 w-16 bg-[var(--border-subtle)] rounded animate-pulse" />
        <div className="h-4 w-3/4 bg-[var(--border-subtle)] rounded animate-pulse" />
        <div className="h-3 w-1/2 bg-[var(--border-subtle)] rounded animate-pulse" />
        <div className="h-5 w-1/3 bg-[var(--border-subtle)] rounded animate-pulse mt-1" />
        <div className="h-8 bg-[var(--border-subtle)] rounded-[var(--radius-md)] animate-pulse mt-1" />
      </div>
    </div>
  );
}

// ── Mini card (for dashboard recommended section) ─────────────
interface ProductMiniCardProps {
  product: Product;
  onViewDetails?: (product: Product) => void;
}

export function ProductMiniCard({ product, onViewDetails }: ProductMiniCardProps) {
  const { addToCart } = useStore();
  const { toast } = useToast();
  const warehouse = getWarehouseById(product.warehouseId);
  const isOut = product.stockStatus === 'out';

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isOut) return;
    addToCart({
      productId: product.id,
      productName: product.name,
      warehouseId: product.warehouseId,
      warehouseName: warehouse?.name ?? '',
      unitPrice: product.price,
      unit: product.unit,
      maxStock: product.stock,
      quantity: 1,
    });
    toast({ type: 'success', title: 'تمت الإضافة إلى السلة', description: product.name, duration: 2000 });
  };

  return (
    <div
      className={cn(
        'flex items-center gap-3 p-3 cursor-pointer',
        'bg-[var(--bg-surface)] border border-[var(--border-subtle)]',
        'rounded-[var(--radius-md)] hover:border-[var(--border-default)]',
        'transition-colors duration-[120ms]'
      )}
      onClick={() => onViewDetails?.(product)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter') onViewDetails?.(product); }}
    >
      {/* Color swatch */}
      <div
        className="w-10 h-10 rounded-[var(--radius-md)] shrink-0 flex items-center justify-center"
        style={{ backgroundColor: product.imageColor + '44' }}
        aria-hidden="true"
      >
        <div className="w-5 h-5 rounded-full opacity-50" style={{ backgroundColor: product.imageColor }} />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[var(--text-primary)] truncate">{product.name}</p>
        <p className="text-xs text-[var(--text-muted)]">
          {product.price.toLocaleString('ar-SA')} ل.س / {product.unit}
        </p>
      </div>

      <button
        onClick={handleAdd}
        disabled={isOut}
        aria-label={`إضافة ${product.name} إلى السلة`}
        className={cn(
          'shrink-0 flex items-center justify-center w-7 h-7 rounded-[var(--radius-sm)]',
          'transition-colors duration-[120ms]',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4C8CE4]/40',
          isOut
            ? 'text-[var(--text-disabled)] cursor-not-allowed'
            : 'bg-[#4C8CE4]/10 text-[#4C8CE4] hover:bg-[#4C8CE4] hover:text-white'
        )}
      >
        <Plus size={14} aria-hidden="true" />
      </button>
    </div>
  );
}
