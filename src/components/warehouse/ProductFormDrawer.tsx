import { useState, useEffect } from 'react';
import { Drawer } from '@/components/ui/Drawer';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Switch } from '@/components/ui/Switch';
import { CATEGORY_LABELS } from '@/types/store';
import type { WarehouseProduct, ProductCategory } from '@/types/store';
import { cn } from '@/lib/utils';

// ============================================================
// SIRIUS — Product Form Drawer (Add / Edit)
// ============================================================

const DEMO_WH_ID = 'wh-1';
const IMAGE_COLORS = [
  '#F0E6CC', '#D4E8A0', '#F5F5F0', '#E8A87C', '#B8D4A0',
  '#FFE08A', '#C8E8F8', '#F0EEE8', '#C8E0F8', '#E0C8F8',
  '#E85428', '#C8A060',
];

type FormErrors = Partial<Record<keyof FormState, string>>;

interface FormState {
  name: string;
  category: ProductCategory | '';
  price: string;
  unit: string;
  packageSize: string;
  stock: string;
  minStock: string;
  description: string;
  imageColor: string;
  isActive: boolean;
}

const EMPTY_FORM: FormState = {
  name: '',
  category: '',
  price: '',
  unit: '',
  packageSize: '',
  stock: '',
  minStock: '20',
  description: '',
  imageColor: IMAGE_COLORS[0],
  isActive: true,
};

function productToForm(p: WarehouseProduct): FormState {
  return {
    name: p.name,
    category: p.category,
    price: String(p.price),
    unit: p.unit,
    packageSize: p.packageSize,
    stock: String(p.stock),
    minStock: String(p.minStock),
    description: p.description,
    imageColor: p.imageColor,
    isActive: p.isActive,
  };
}

function validate(f: FormState): FormErrors {
  const errors: FormErrors = {};
  if (!f.name.trim())       errors.name        = 'اسم المنتج مطلوب.';
  if (!f.category)          errors.category    = 'الفئة مطلوبة.';
  if (!f.unit.trim())       errors.unit        = 'وحدة القياس مطلوبة.';
  const price = Number(f.price);
  if (!f.price || isNaN(price) || price <= 0)
    errors.price = 'السعر يجب أن يكون أكبر من صفر.';
  const stock = Number(f.stock);
  if (f.stock === '' || isNaN(stock) || stock < 0)
    errors.stock = 'الكمية يجب أن تكون 0 أو أكثر.';
  const min = Number(f.minStock);
  if (f.minStock === '' || isNaN(min) || min < 0)
    errors.minStock = 'الحد الأدنى يجب أن يكون 0 أو أكثر.';
  return errors;
}

interface ProductFormDrawerProps {
  open: boolean;
  onClose: () => void;
  onSave: (product: WarehouseProduct) => void;
  editProduct?: WarehouseProduct | null;
}

export function ProductFormDrawer({
  open, onClose, onSave, editProduct,
}: ProductFormDrawerProps) {
  const isEdit = Boolean(editProduct);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Partial<Record<keyof FormState, boolean>>>({});

  // Reset / populate when drawer opens
  useEffect(() => {
    if (open) {
      setForm(editProduct ? productToForm(editProduct) : EMPTY_FORM);
      setErrors({});
      setTouched({});
    }
  }, [open, editProduct]);

  const set = (field: keyof FormState, value: string | boolean) => {
    setForm((f) => ({ ...f, [field]: value }));
    setTouched((t) => ({ ...t, [field]: true }));
  };

  const getError = (field: keyof FormState) =>
    touched[field] ? errors[field] : undefined;

  const handleSave = () => {
    // Touch all to show errors
    const allTouched = Object.fromEntries(
      Object.keys(EMPTY_FORM).map((k) => [k, true])
    ) as Partial<Record<keyof FormState, boolean>>;
    setTouched(allTouched);

    const errs = validate(form);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    const stock = Number(form.stock);
    const minStock = Number(form.minStock);
    const stockStatus =
      stock === 0 ? 'out' : stock <= minStock ? 'low' : 'available';

    const product: WarehouseProduct = {
      id: editProduct?.id ?? `p-${Date.now()}`,
      name: form.name.trim(),
      category: form.category as ProductCategory,
      warehouseId: DEMO_WH_ID,
      price: Number(form.price),
      unit: form.unit.trim(),
      packageSize: form.packageSize.trim() || form.unit.trim(),
      stock,
      stockStatus,
      description: form.description.trim(),
      imageColor: form.imageColor,
      minStock,
      isActive: form.isActive,
      updatedAt: new Date().toISOString(),
    };

    onSave(product);
    onClose();
  };

  const CATEGORIES = Object.entries(CATEGORY_LABELS) as [ProductCategory, string][];

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={isEdit ? 'تعديل المنتج' : 'إضافة منتج جديد'}
      side="start"
      size="lg"
      footer={
        <div className="flex items-center gap-2 w-full">
          <Button variant="ghost" size="sm" onClick={onClose}>إلغاء</Button>
          <Button variant="primary" size="sm" fullWidth onClick={handleSave}>
            {isEdit ? 'حفظ التغييرات' : 'إضافة المنتج'}
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-4">

        {/* Name */}
        <Input
          label="اسم المنتج *"
          value={form.name}
          onChange={(e) => set('name', e.target.value)}
          placeholder="مثال: أرز بسمتي ممتاز"
          errorText={getError('name')}
        />

        {/* Category */}
        <Select
          label="الفئة *"
          value={form.category}
          onChange={(e) => set('category', e.target.value)}
          errorText={getError('category')}
        >
          <option value="" disabled>اختر الفئة</option>
          {CATEGORIES.map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </Select>

        {/* Price + Unit row */}
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="السعر (ل.س) *"
            value={form.price}
            onChange={(e) => set('price', e.target.value)}
            placeholder="0"
            type="number"
            min="0"
            dir="ltr"
            errorText={getError('price')}
          />
          <Input
            label="وحدة القياس *"
            value={form.unit}
            onChange={(e) => set('unit', e.target.value)}
            placeholder="كرتون / كيس / علبة"
            errorText={getError('unit')}
          />
        </div>

        {/* Package size */}
        <Input
          label="حجم العبوة"
          value={form.packageSize}
          onChange={(e) => set('packageSize', e.target.value)}
          placeholder="مثال: 12 × 1 لتر"
        />

        {/* Stock + Min Stock row */}
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="الكمية المتوفرة *"
            value={form.stock}
            onChange={(e) => set('stock', e.target.value)}
            placeholder="0"
            type="number"
            min="0"
            dir="ltr"
            errorText={getError('stock')}
          />
          <Input
            label="حد المخزون المنخفض"
            value={form.minStock}
            onChange={(e) => set('minStock', e.target.value)}
            placeholder="20"
            type="number"
            min="0"
            dir="ltr"
            errorText={getError('minStock')}
          />
        </div>

        {/* Description */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-[var(--text-primary)]">وصف المنتج</label>
          <textarea
            value={form.description}
            onChange={(e) => set('description', e.target.value)}
            placeholder="وصف مختصر للمنتج..."
            rows={3}
            className={cn(
              'w-full bg-[var(--bg-surface)] text-[var(--text-primary)]',
              'border border-[var(--border-default)] rounded-[var(--radius-sm)]',
              'px-3 py-2 text-sm resize-none',
              'placeholder:text-[var(--text-disabled)]',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4C8CE4]/40 focus:border-[#4C8CE4]',
              'transition-colors duration-[120ms]'
            )}
          />
        </div>

        {/* Color picker */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-[var(--text-primary)]">لون المنتج</label>
          <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="اختيار لون المنتج">
            {IMAGE_COLORS.map((color) => (
              <button
                key={color}
                type="button"
                role="radio"
                aria-checked={form.imageColor === color}
                aria-label={`لون ${color}`}
                onClick={() => set('imageColor', color)}
                className={cn(
                  'w-7 h-7 rounded-full border-2 transition-all duration-[120ms]',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4C8CE4]/40',
                  form.imageColor === color
                    ? 'border-[#4C8CE4] scale-110 shadow-md'
                    : 'border-[var(--border-subtle)] hover:scale-105'
                )}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>

        {/* Active toggle */}
        <div className="flex items-center justify-between p-3 rounded-[var(--radius-md)] bg-[var(--bg-surface-2)]">
          <div>
            <p className="text-sm font-medium text-[var(--text-primary)]">حالة المنتج</p>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              {form.isActive ? 'مفعّل — متاح للمحلات' : 'معطّل — غير مرئي للمحلات'}
            </p>
          </div>
          <Switch
            id="product-active"
            checked={form.isActive}
            onChange={(e) => set('isActive', e.target.checked)}
            aria-label="حالة المنتج"
          />
        </div>

      </div>
    </Drawer>
  );
}
