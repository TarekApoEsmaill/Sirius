import { useState, useEffect } from 'react';
import { Minus, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { STOCK_LABELS } from '@/types/store';
import type { WarehouseProduct } from '@/types/store';

// ============================================================
// SIRIUS — Stock Update Modal
// ============================================================

interface StockUpdateModalProps {
  open: boolean;
  onClose: () => void;
  product: WarehouseProduct | null;
  onSave: (productId: string, newStock: number) => void;
}

const stockBadgeVariant = {
  available: 'success',
  low:       'warning',
  out:       'error',
} as const;

export function StockUpdateModal({
  open, onClose, product, onSave,
}: StockUpdateModalProps) {
  const [qty, setQty] = useState(0);
  const [inputVal, setInputVal] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (open && product) {
      setQty(product.stock);
      setInputVal(String(product.stock));
      setError('');
    }
  }, [open, product]);

  if (!product) return null;

  const adjust = (delta: number) => {
    const next = Math.max(0, qty + delta);
    setQty(next);
    setInputVal(String(next));
    setError('');
  };

  const handleInputChange = (val: string) => {
    setInputVal(val);
    const n = Number(val);
    if (val === '' || isNaN(n) || n < 0) {
      setError('الكمية يجب أن تكون 0 أو أكثر.');
    } else {
      setError('');
      setQty(n);
    }
  };

  const handleSave = () => {
    if (error || inputVal === '') return;
    onSave(product.id, qty);
    onClose();
  };

  const derivedStatus =
    qty === 0 ? 'out' : qty <= product.minStock ? 'low' : 'available';
  const changed = qty !== product.stock;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="تحديث المخزون"
      description={product.name}
      size="sm"
      footer={
        <>
          <Button variant="ghost" size="sm" onClick={onClose}>إلغاء</Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleSave}
            disabled={Boolean(error) || !changed}
          >
            حفظ
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-5">
        {/* Current info */}
        <div className="flex items-center justify-between p-3 rounded-[var(--radius-md)] bg-[var(--bg-surface-2)]">
          <div>
            <p className="text-xs text-[var(--text-muted)]">الكمية الحالية</p>
            <p className="text-lg font-bold text-[var(--text-primary)]">
              {product.stock} {product.unit}
            </p>
          </div>
          <Badge variant={stockBadgeVariant[product.stockStatus]} size="sm">
            {STOCK_LABELS[product.stockStatus]}
          </Badge>
        </div>

        {/* Stepper */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-[var(--text-primary)]">الكمية الجديدة</label>
          <div className="flex items-center gap-3">
            <div className="flex items-center border border-[var(--border-default)] rounded-[var(--radius-md)] overflow-hidden">
              <button
                onClick={() => adjust(-1)}
                disabled={qty <= 0}
                aria-label="تقليل"
                className="flex items-center justify-center w-10 h-10 text-[var(--text-muted)] hover:bg-[var(--interactive-secondary)] hover:text-[var(--text-primary)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none"
              >
                <Minus size={15} aria-hidden="true" />
              </button>
              <motion.span
                key={qty}
                initial={{ scale: 0.85, opacity: 0.5 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.12 }}
                className="w-14 text-center text-base font-bold text-[var(--text-primary)]"
                aria-live="polite"
              >
                {qty}
              </motion.span>
              <button
                onClick={() => adjust(1)}
                aria-label="زيادة"
                className="flex items-center justify-center w-10 h-10 text-[var(--text-muted)] hover:bg-[var(--interactive-secondary)] hover:text-[var(--text-primary)] transition-colors focus-visible:outline-none"
              >
                <Plus size={15} aria-hidden="true" />
              </button>
            </div>

            {/* Direct input */}
            <Input
              value={inputVal}
              onChange={(e) => handleInputChange(e.target.value)}
              type="number"
              min="0"
              dir="ltr"
              className="w-28"
              aria-label="الكمية المدخلة"
              errorText={error}
            />
          </div>
        </div>

        {/* Preview new status */}
        {changed && (
          <div className="flex items-center gap-2 p-3 rounded-[var(--radius-md)] bg-[var(--bg-surface-2)] border border-[var(--border-subtle)]">
            <span className="text-xs text-[var(--text-muted)]">الحالة الجديدة:</span>
            <Badge variant={stockBadgeVariant[derivedStatus]} size="sm">
              {STOCK_LABELS[derivedStatus]}
            </Badge>
          </div>
        )}

        <p className="text-xs text-[var(--text-muted)]">
          حد التنبيه: {product.minStock} {product.unit}
        </p>
      </div>
    </Modal>
  );
}
