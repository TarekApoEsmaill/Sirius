import { useState } from 'react';
import { Minus, Plus, ShoppingCart, Heart, MapPin, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Drawer } from '@/components/ui/Drawer';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useStore } from '@/contexts/StoreContext';
import { useToast } from '@/components/ui/Toast';
import { CATEGORY_LABELS, STOCK_LABELS } from '@/types/store';
import type { Product } from '@/types/store';
import { getWarehouseById } from '@/data/mockData';

// ============================================================
// SIRIUS — Product Detail Drawer
// ============================================================

interface ProductDetailDrawerProps {
  product: Product | null;
  open: boolean;
  onClose: () => void;
}

const stockBadgeVariant = {
  available: 'success',
  low: 'warning',
  out: 'error',
} as const;

export function ProductDetailDrawer({ product, open, onClose }: ProductDetailDrawerProps) {
  const [qty, setQty] = useState(1);
  const { addToCart, toggleFavorite, isFavorite } = useStore();
  const { toast } = useToast();

  if (!product) return null;

  const warehouse = getWarehouseById(product.warehouseId);
  const favorite = isFavorite(product.id);
  const isOut = product.stockStatus === 'out';
  const maxQty = product.stock;

  const decrement = () => setQty((q) => Math.max(1, q - 1));
  const increment = () => setQty((q) => Math.min(maxQty, q + 1));

  const handleAddToCart = () => {
    if (isOut) return;
    addToCart({
      productId: product.id,
      productName: product.name,
      warehouseId: product.warehouseId,
      warehouseName: warehouse?.name ?? '',
      unitPrice: product.price,
      unit: product.unit,
      maxStock: product.stock,
      quantity: qty,
    });
    toast({
      type: 'success',
      title: 'تمت الإضافة إلى السلة',
      description: `${qty} ${product.unit} من ${product.name}`,
      duration: 3000,
    });
    setQty(1);
    onClose();
  };

  const handleToggleFavorite = () => {
    toggleFavorite(product.id);
    toast({
      type: favorite ? 'neutral' : 'info',
      title: favorite ? 'تمت الإزالة من المفضلة' : 'تمت الإضافة إلى المفضلة',
      duration: 1800,
    });
  };

  const lineTotal = product.price * qty;

  return (
    <Drawer
      open={open}
      onClose={() => { setQty(1); onClose(); }}
      title={product.name}
      side="start"
      size="md"
      footer={
        <div className="flex items-center gap-2 w-full">
          <Button
            variant="ghost"
            size="sm"
            aria-label={favorite ? 'إزالة من المفضلة' : 'إضافة إلى المفضلة'}
            aria-pressed={favorite}
            onClick={handleToggleFavorite}
            className={cn(favorite && 'text-red-500')}
            iconStart={<Heart size={15} fill={favorite ? 'currentColor' : 'none'} aria-hidden="true" />}
          >
            {favorite ? 'في المفضلة' : 'إضافة للمفضلة'}
          </Button>
          <Button
            variant="primary"
            size="sm"
            fullWidth
            disabled={isOut}
            onClick={handleAddToCart}
            iconStart={<ShoppingCart size={15} aria-hidden="true" />}
          >
            {isOut ? 'نفذ المخزون' : `إضافة للسلة — ${lineTotal.toLocaleString('ar-SA')} ل.س`}
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-5">
        {/* Image placeholder */}
        <div
          className="w-full h-48 rounded-[var(--radius-lg)] flex items-center justify-center"
          style={{ backgroundColor: product.imageColor + '33' }}
          aria-hidden="true"
        >
          <div
            className="w-20 h-20 rounded-full opacity-30"
            style={{ backgroundColor: product.imageColor }}
          />
        </div>

        {/* Header info */}
        <div className="flex flex-col gap-2">
          <div className="flex items-start justify-between gap-3">
            <div>
              <span className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wide">
                {CATEGORY_LABELS[product.category]}
              </span>
              <h2 className="text-h4 font-bold text-[var(--text-primary)] mt-0.5">{product.name}</h2>
            </div>
            <Badge variant={stockBadgeVariant[product.stockStatus]} size="sm">
              {STOCK_LABELS[product.stockStatus]}
            </Badge>
          </div>

          <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{product.description}</p>
        </div>

        {/* Details grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-0.5 p-3 rounded-[var(--radius-md)] bg-[var(--bg-surface-2)]">
            <span className="text-xs text-[var(--text-muted)]">السعر</span>
            <span className="text-base font-bold text-[var(--text-primary)]">
              {product.price.toLocaleString('ar-SA')} ل.س
            </span>
            <span className="text-xs text-[var(--text-muted)]">/ {product.unit}</span>
          </div>
          <div className="flex flex-col gap-0.5 p-3 rounded-[var(--radius-md)] bg-[var(--bg-surface-2)]">
            <span className="text-xs text-[var(--text-muted)]">التعبئة</span>
            <span className="text-sm font-semibold text-[var(--text-primary)]">{product.packageSize}</span>
          </div>
          <div className="flex flex-col gap-0.5 p-3 rounded-[var(--radius-md)] bg-[var(--bg-surface-2)]">
            <span className="text-xs text-[var(--text-muted)]">المخزون المتاح</span>
            <span className={cn('text-sm font-semibold', product.stockStatus === 'low' ? 'text-[#7A6E00]' : 'text-[var(--text-primary)]')}>
              {product.stock} {product.unit}
            </span>
          </div>
          <div className="flex flex-col gap-0.5 p-3 rounded-[var(--radius-md)] bg-[var(--bg-surface-2)]">
            <span className="text-xs text-[var(--text-muted)]">المستودع</span>
            <span className="text-sm font-semibold text-[var(--text-primary)] truncate">
              {warehouse?.name ?? '—'}
            </span>
          </div>
        </div>

        {/* Warehouse info */}
        {warehouse && (
          <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
            <MapPin size={14} aria-hidden="true" />
            <span>{warehouse.city} — {warehouse.address}</span>
          </div>
        )}

        {/* Low stock warning */}
        {product.stockStatus === 'low' && (
          <div className="flex items-start gap-2 p-3 rounded-[var(--radius-md)] bg-[var(--status-warning-bg)] border border-[var(--status-warning-border)]">
            <AlertTriangle size={14} className="text-[var(--status-warning-text)] shrink-0 mt-0.5" aria-hidden="true" />
            <p className="text-xs text-[var(--status-warning-text)]">
              الكمية المتبقية محدودة — {product.stock} {product.unit} فقط.
            </p>
          </div>
        )}

        {/* Quantity selector */}
        {!isOut && (
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-[var(--text-primary)]">الكمية</label>
            <div className="flex items-center gap-3">
              <div className="flex items-center border border-[var(--border-default)] rounded-[var(--radius-md)] overflow-hidden">
                <button
                  onClick={decrement}
                  disabled={qty <= 1}
                  aria-label="تقليل الكمية"
                  className={cn(
                    'flex items-center justify-center w-9 h-9',
                    'text-[var(--text-muted)] hover:text-[var(--text-primary)]',
                    'hover:bg-[var(--interactive-secondary)]',
                    'transition-colors duration-[120ms]',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#4C8CE4]/40',
                    'disabled:opacity-40 disabled:cursor-not-allowed'
                  )}
                >
                  <Minus size={14} aria-hidden="true" />
                </button>

                <motion.span
                  key={qty}
                  initial={{ scale: 0.85, opacity: 0.6 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.12 }}
                  className="w-10 text-center text-sm font-semibold text-[var(--text-primary)]"
                  aria-live="polite"
                  aria-label={`الكمية: ${qty}`}
                >
                  {qty}
                </motion.span>

                <button
                  onClick={increment}
                  disabled={qty >= maxQty}
                  aria-label="زيادة الكمية"
                  className={cn(
                    'flex items-center justify-center w-9 h-9',
                    'text-[var(--text-muted)] hover:text-[var(--text-primary)]',
                    'hover:bg-[var(--interactive-secondary)]',
                    'transition-colors duration-[120ms]',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#4C8CE4]/40',
                    'disabled:opacity-40 disabled:cursor-not-allowed'
                  )}
                >
                  <Plus size={14} aria-hidden="true" />
                </button>
              </div>

              <div className="text-sm text-[var(--text-muted)]">
                المجموع:{' '}
                <span className="font-semibold text-[var(--text-primary)]">
                  {lineTotal.toLocaleString('ar-SA')} ل.س
                </span>
              </div>
            </div>

            <p className="text-xs text-[var(--text-muted)]">
              الحد الأقصى: {maxQty} {product.unit}
            </p>
          </div>
        )}
      </div>
    </Drawer>
  );
}
