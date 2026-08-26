import { useState } from 'react';
import {
  Package, ShoppingCart, Warehouse, Settings, Bell,
  Search, Plus, Edit, Trash2, Download, Eye,
  CheckCircle2, AlertTriangle, XCircle, Info,
  Star, TrendingUp, Users, BarChart3, ArrowLeft,
} from 'lucide-react';
import { Button, IconButton } from '@/components/ui/Button';
import { Input, SearchInput } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Checkbox } from '@/components/ui/Checkbox';
import { Radio } from '@/components/ui/Radio';
import { Switch } from '@/components/ui/Switch';
import { Badge, StatusBadge, CountBadge } from '@/components/ui/Badge';
import { Card, CardHeader, CardTitle, CardBody, CardFooter } from '@/components/ui/Card';
import { Divider } from '@/components/ui/Divider';
import { Tooltip } from '@/components/ui/Tooltip';
import { Dropdown } from '@/components/ui/Dropdown';
import { Modal } from '@/components/ui/Modal';
import { Drawer } from '@/components/ui/Drawer';
import { Tabs } from '@/components/ui/Tabs';
import { Table } from '@/components/ui/Table';
import { Skeleton, CardSkeleton } from '@/components/ui/Skeleton';
import { EmptyState, LoadingState } from '@/components/ui/EmptyState';
import { ThemeToggle } from '@/components/common/ThemeToggle';
import { useToast } from '@/components/ui/Toast';
import { cn } from '@/lib/utils';

// ============================================================
// Design System Showcase — Internal development page only
// ============================================================

interface ProductRow extends Record<string, unknown> {
  id: number;
  name: string;
  category: string;
  stock: number;
  price: string;
  status: string;
}

const tableData: ProductRow[] = [
  { id: 1, name: 'زيت الزيتون البكر', category: 'زيوت', stock: 240, price: '٤٥ ر.س', status: 'متوفر' },
  { id: 2, name: 'أرز بسمتي ممتاز', category: 'حبوب', stock: 12, price: '٨٠ ر.س', status: 'منخفض' },
  { id: 3, name: 'عسل طبيعي', category: 'منتجات نحل', stock: 0, price: '١٢٠ ر.س', status: 'نفد' },
  { id: 4, name: 'قهوة عربية محمصة', category: 'مشروبات', stock: 88, price: '٦٥ ر.س', status: 'متوفر' },
];

function Section({ title, children, className }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={cn('mb-12', className)}>
      <h2 className="text-h3 font-bold text-[var(--text-primary)] mb-1">{title}</h2>
      <div className="h-0.5 w-12 bg-[#4C8CE4] rounded-full mb-6" />
      {children}
    </section>
  );
}

function Row({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn('flex flex-wrap items-center gap-3', className)}>
      {children}
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <p className="text-xs font-medium text-[var(--text-muted)] mb-2">{children}</p>;
}

export function DesignSystemShowcase() {
  const { toast } = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [switchOn, setSwitchOn] = useState(true);
  const [checkbox1, setCheckbox1] = useState(true);
  const [searchValue, setSearchValue] = useState('');

  const showToast = (type: 'success' | 'warning' | 'error' | 'info') => {
    const messages = {
      success: { title: 'تمت العملية بنجاح', description: 'تم حفظ التغييرات على المنتج.' },
      warning: { title: 'تحذير: مخزون منخفض', description: 'أرز بسمتي — ١٢ وحدة متبقية فقط.' },
      error:   { title: 'حدث خطأ', description: 'تعذّر الاتصال بالخادم. حاول مجدداً.' },
      info:    { title: 'معلومة', description: 'تم إضافة ٣ منتجات جديدة إلى قائمتك.' },
    };
    toast({ type, ...messages[type] });
  };

  return (
    <div
      dir="rtl"
      className="min-h-screen bg-[var(--bg-page)]"
      style={{ fontFamily: 'var(--font-sans)' }}
    >
      {/* Top bar */}
      <header className="sticky top-0 z-50 bg-[var(--bg-surface)] border-b border-[var(--border-subtle)] shadow-[var(--shadow-1)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {/* Sirius Logo mark */}
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-[#4C8CE4] to-[#406093]">
              <Star size={16} className="text-white" aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm font-bold text-[var(--text-primary)] leading-tight">سيريوس</p>
              <p className="text-[0.625rem] text-[var(--text-muted)] leading-tight">نظام التصميم — المرحلة الأولى</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle variant="segmented" />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        {/* Hero */}
        <div className="mb-14 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 mb-4 rounded-full bg-[#4C8CE4]/10 border border-[#4C8CE4]/20">
            <span className="text-xs font-semibold text-[#4C8CE4]">نظام التصميم — المرحلة الأولى</span>
          </div>
          <h1 className="text-display font-black text-[var(--text-primary)] mb-3">
            سيريوس — Design System
          </h1>
          <p className="text-body-lg text-[var(--text-muted)] max-w-xl mx-auto">
            صفحة التحقق الداخلية من مكونات النظام البصري. تُستخدم أثناء التطوير فقط.
          </p>
        </div>

        {/* ── COLORS ── */}
        <Section title="الألوان الرسمية">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            {[
              { name: 'Primary Dark Blue', hex: '#406093', cls: 'bg-[#406093]' },
              { name: 'Primary Blue', hex: '#4C8CE4', cls: 'bg-[#4C8CE4]' },
              { name: 'Fresh Green', hex: '#91D06C', cls: 'bg-[#91D06C]' },
              { name: 'Soft Yellow', hex: '#FFF799', cls: 'bg-[#FFF799] border border-[var(--border-default)]' },
            ].map((c) => (
              <div key={c.hex} className="card p-4 flex flex-col gap-3">
                <div className={cn('h-16 rounded-[var(--radius-md)]', c.cls)} />
                <div>
                  <p className="text-sm font-semibold text-[var(--text-primary)]">{c.name}</p>
                  <p className="text-xs text-[var(--text-muted)] font-mono">{c.hex}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { label: 'خلفية الصفحة', cls: 'bg-[var(--bg-page)]', name: '--bg-page' },
              { label: 'سطح', cls: 'bg-[var(--bg-surface)]', name: '--bg-surface' },
              { label: 'سطح ثانوي', cls: 'bg-[var(--bg-surface-2)]', name: '--bg-surface-2' },
              { label: 'سطح ثالث', cls: 'bg-[var(--bg-surface-3)]', name: '--bg-surface-3' },
            ].map((c) => (
              <div key={c.name} className="card p-4 flex flex-col gap-3">
                <div className={cn('h-12 rounded-[var(--radius-md)] border border-[var(--border-subtle)]', c.cls)} />
                <div>
                  <p className="text-sm font-medium text-[var(--text-primary)]">{c.label}</p>
                  <p className="text-xs text-[var(--text-muted)] font-mono">{c.name}</p>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* ── TYPOGRAPHY ── */}
        <Section title="التايبوغرافي">
          <div className="card p-6 space-y-5">
            <div>
              <Label>Display / Hero</Label>
              <p className="text-display font-black text-[var(--text-primary)]">منصة سيريوس للتجارة</p>
            </div>
            <Divider />
            <div>
              <Label>H1 — عنوان الصفحة</Label>
              <p className="text-h1 font-bold text-[var(--text-primary)]">لوحة تحكم المستودع</p>
            </div>
            <div>
              <Label>H2 — عنوان القسم</Label>
              <p className="text-h2 font-bold text-[var(--text-primary)]">إدارة المنتجات</p>
            </div>
            <div>
              <Label>H3 — عنوان البطاقة</Label>
              <p className="text-h3 font-semibold text-[var(--text-primary)]">تفاصيل الطلبية</p>
            </div>
            <div>
              <Label>H4 — عنوان فرعي</Label>
              <p className="text-h4 font-semibold text-[var(--text-primary)]">معلومات المتجر</p>
            </div>
            <Divider />
            <div>
              <Label>Body Large</Label>
              <p className="text-body-lg text-[var(--text-secondary)]">
                منصة سيريوس تربط المستودعات التجارية بالمتاجر بكفاءة عالية وأمان تام.
              </p>
            </div>
            <div>
              <Label>Body</Label>
              <p className="text-body text-[var(--text-secondary)]">
                يمكنك إدارة المنتجات والطلبيات والفواتير من مكان واحد. نظام متكامل يوفر لك الوقت والجهد.
              </p>
            </div>
            <div>
              <Label>Body Small</Label>
              <p className="text-body-sm text-[var(--text-muted)]">
                آخر تحديث: منذ ٥ دقائق · ٢٤٠ منتج نشط · ١٢ طلب معلق
              </p>
            </div>
            <div>
              <Label>Caption</Label>
              <p className="text-caption">معرّف الطلب: ORD-٢٠٢٦-٠٠١٢٤</p>
            </div>
          </div>
        </Section>

        {/* ── BUTTONS ── */}
        <Section title="الأزرار">
          <div className="card p-6 space-y-6">
            <div>
              <Label>المتغيرات</Label>
              <Row>
                <Button variant="primary">أساسي</Button>
                <Button variant="secondary">ثانوي</Button>
                <Button variant="outline">إطار</Button>
                <Button variant="ghost">شفاف</Button>
                <Button variant="success">نجاح</Button>
                <Button variant="destructive">حذف</Button>
              </Row>
            </div>
            <Divider />
            <div>
              <Label>الأحجام</Label>
              <Row className="items-end">
                <Button size="xs">صغير جداً</Button>
                <Button size="sm">صغير</Button>
                <Button size="md">متوسط</Button>
                <Button size="lg">كبير</Button>
                <Button size="xl">كبير جداً</Button>
              </Row>
            </div>
            <Divider />
            <div>
              <Label>مع أيقونات</Label>
              <Row>
                <Button variant="primary" iconStart={<Plus size={16} />}>إضافة منتج</Button>
                <Button variant="secondary" iconStart={<Download size={16} />}>تصدير</Button>
                <Button variant="outline" iconEnd={<ArrowLeft size={16} />}>عرض الكل</Button>
              </Row>
            </div>
            <Divider />
            <div>
              <Label>حالات خاصة</Label>
              <Row>
                <Button loading>جارٍ الحفظ</Button>
                <Button disabled>معطّل</Button>
                <Button variant="primary" fullWidth className="max-w-xs">عرض عريض</Button>
              </Row>
            </div>
            <Divider />
            <div>
              <Label>أزرار الأيقونة</Label>
              <Row>
                <Tooltip content="بحث">
                  <IconButton aria-label="بحث" variant="ghost"><Search size={16} /></IconButton>
                </Tooltip>
                <Tooltip content="تعديل">
                  <IconButton aria-label="تعديل" variant="outline"><Edit size={16} /></IconButton>
                </Tooltip>
                <Tooltip content="حذف">
                  <IconButton aria-label="حذف" variant="destructive"><Trash2 size={16} /></IconButton>
                </Tooltip>
                <Tooltip content="عرض">
                  <IconButton aria-label="عرض" variant="secondary"><Eye size={16} /></IconButton>
                </Tooltip>
              </Row>
            </div>
          </div>
        </Section>

        {/* ── INPUTS ── */}
        <Section title="حقول الإدخال">
          <div className="card p-6 grid sm:grid-cols-2 gap-6">
            <Input label="اسم المنتج" placeholder="أدخل اسم المنتج" />
            <Input label="السعر" placeholder="٠.٠٠" iconStart={<span className="text-xs font-medium">ر.س</span>} />
            <SearchInput
              label="بحث"
              placeholder="ابحث عن منتج…"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onClear={() => setSearchValue('')}
            />
            <Input label="مع نص مساعد" placeholder="أدخل القيمة" helperText="سيُستخدم هذا الحقل للمعرّف الفريد" />
            <Input label="حالة الخطأ" placeholder="أدخل البريد الإلكتروني" errorText="البريد الإلكتروني غير صالح" defaultValue="invalid@" />
            <Input label="معطّل" placeholder="لا يمكن التعديل" disabled defaultValue="قيمة ثابتة" />
          </div>
        </Section>

        {/* ── SELECT ── */}
        <Section title="قوائم الاختيار">
          <div className="card p-6 grid sm:grid-cols-2 gap-6">
            <Select label="الفئة" placeholder="اختر فئة">
              <option value="oils">زيوت</option>
              <option value="grains">حبوب</option>
              <option value="beverages">مشروبات</option>
            </Select>
            <Select label="المستودع" placeholder="اختر مستودع">
              <option value="w1">مستودع الرياض الرئيسي</option>
              <option value="w2">مستودع جدة الغربي</option>
            </Select>
            <Select label="مع خطأ" errorText="الرجاء اختيار فئة">
              <option value="">—</option>
            </Select>
            <Select label="معطّل" disabled>
              <option>غير متاح</option>
            </Select>
          </div>
        </Section>

        {/* ── CHECKBOXES & RADIOS & SWITCHES ── */}
        <Section title="عناصر التحديد">
          <div className="card p-6 grid sm:grid-cols-3 gap-6">
            <div className="space-y-3">
              <Label>مربعات الاختيار</Label>
              <Checkbox label="متوفر في المخزن" checked={checkbox1} onChange={(e) => setCheckbox1(e.target.checked)} />
              <Checkbox label="منتج مميز" checked={false} onChange={() => {}} />
              <Checkbox label="معطّل" disabled checked />
              <Checkbox label="غير محدد جزئياً" indeterminate checked />
            </div>
            <div className="space-y-3">
              <Label>أزرار الراديو</Label>
              <Radio label="شحن سريع" name="shipping" value="fast" checked onChange={() => {}} />
              <Radio label="شحن عادي" name="shipping" value="standard" checked={false} onChange={() => {}} />
              <Radio label="استلام ذاتي" name="shipping" value="pickup" checked={false} onChange={() => {}} />
            </div>
            <div className="space-y-4">
              <Label>المفاتيح</Label>
              <Switch
                label="تفعيل المنتج"
                helperText="سيظهر في نتائج البحث"
                checked={switchOn}
                onChange={(e) => setSwitchOn(e.target.checked)}
              />
              <Switch label="تنبيهات المخزن" checked={false} onChange={() => {}} />
              <Switch label="معطّل" disabled checked />
            </div>
          </div>
        </Section>

        {/* ── BADGES ── */}
        <Section title="التسميات والحالات">
          <div className="card p-6 space-y-5">
            <div>
              <Label>Badge — المتغيرات</Label>
              <Row>
                <Badge variant="default">افتراضي</Badge>
                <Badge variant="brand">سيريوس</Badge>
                <Badge variant="success">نجاح</Badge>
                <Badge variant="warning">تحذير</Badge>
                <Badge variant="error">خطأ</Badge>
                <Badge variant="info">معلومة</Badge>
                <Badge variant="neutral">محايد</Badge>
              </Row>
            </div>
            <div>
              <Label>Badge مع نقطة</Label>
              <Row>
                <Badge variant="success" dot>متوفر</Badge>
                <Badge variant="warning" dot>منخفض</Badge>
                <Badge variant="error" dot>نفد</Badge>
                <Badge variant="neutral" dot>معلّق</Badge>
              </Row>
            </div>
            <div>
              <Label>StatusBadge</Label>
              <Row>
                <StatusBadge status="success" label="تم التسليم" />
                <StatusBadge status="warning" label="مخزون منخفض" />
                <StatusBadge status="error" label="ملغي" />
                <StatusBadge status="info" label="قيد المعالجة" />
                <StatusBadge status="neutral" label="مسودة" />
              </Row>
            </div>
            <div>
              <Label>CountBadge</Label>
              <Row>
                <div className="relative inline-flex">
                  <Bell size={20} className="text-[var(--text-muted)]" />
                  <CountBadge count={3} className="absolute -top-1 -start-1" />
                </div>
                <div className="relative inline-flex">
                  <Package size={20} className="text-[var(--text-muted)]" />
                  <CountBadge count={127} className="absolute -top-1 -start-1" />
                </div>
              </Row>
            </div>
          </div>
        </Section>

        {/* ── CARDS ── */}
        <Section title="البطاقات">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            {/* Default */}
            <Card padding="md">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-[var(--radius-md)] bg-[#4C8CE4]/10">
                  <Package size={20} className="text-[#4C8CE4]" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-xs text-[var(--text-muted)]">إجمالي المنتجات</p>
                  <p className="text-h3 font-bold text-[var(--text-primary)]">٢٤٠</p>
                </div>
              </div>
              <div className="flex items-center gap-1 text-[#91D06C]">
                <TrendingUp size={12} aria-hidden="true" />
                <span className="text-xs font-medium">+١٢٪ هذا الشهر</span>
              </div>
            </Card>

            {/* Interactive */}
            <Card variant="interactive" padding="md" onClick={() => {}}>
              <div className="flex items-center gap-3 mb-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-[var(--radius-md)] bg-[#91D06C]/10">
                  <ShoppingCart size={20} className="text-[#6EB84D]" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-xs text-[var(--text-muted)]">الطلبيات النشطة</p>
                  <p className="text-h3 font-bold text-[var(--text-primary)]">٣٨</p>
                </div>
              </div>
              <p className="text-xs text-[var(--text-muted)]">اضغط للتفاصيل</p>
            </Card>

            {/* Selected */}
            <Card variant="selected" padding="md">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-[var(--radius-md)] bg-[#406093]/10">
                  <Warehouse size={20} className="text-[#406093]" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-xs text-[var(--text-muted)]">المستودعات</p>
                  <p className="text-h3 font-bold text-[var(--text-primary)]">٥</p>
                </div>
              </div>
              <Badge variant="brand" size="sm">محدد</Badge>
            </Card>

            {/* Elevated */}
            <Card variant="elevated" padding="md">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-[var(--radius-md)] bg-[#FFF799]/30">
                  <Users size={20} className="text-[#7A6E00]" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-xs text-[var(--text-muted)]">المتاجر المسجلة</p>
                  <p className="text-h3 font-bold text-[var(--text-primary)]">١٨٥</p>
                </div>
              </div>
              <Badge variant="warning" size="sm">مرتفع</Badge>
            </Card>
          </div>

          {/* Card with header/body/footer */}
          <Card padding="none">
            <CardHeader className="px-5 pt-5 pb-0">
              <CardTitle>تفاصيل المنتج</CardTitle>
              <Badge variant="success" dot>متوفر</Badge>
            </CardHeader>
            <CardBody className="px-5 py-4">
              <p className="text-sm text-[var(--text-secondary)]">
                زيت الزيتون البكر الممتاز — الدرجة الأولى. صالح للاستخدام حتى ٢٠٢٧. الكمية: ٢٤٠ علبة.
              </p>
            </CardBody>
            <CardFooter className="px-5 pb-5">
              <Button variant="primary" size="sm" iconStart={<Edit size={14} />}>تعديل</Button>
              <Button variant="ghost" size="sm">إلغاء</Button>
            </CardFooter>
          </Card>
        </Section>

        {/* ── TABS ── */}
        <Section title="التبويبات">
          <div className="card p-6 space-y-6">
            <div>
              <Label>Line — تبويب خطي</Label>
              <Tabs
                tabs={[
                  { key: 'all', label: 'الكل', count: 240 },
                  { key: 'active', label: 'نشط', count: 180, icon: <CheckCircle2 size={14} /> },
                  { key: 'low', label: 'منخفض', count: 12, icon: <AlertTriangle size={14} /> },
                  { key: 'out', label: 'نفد', count: 8, icon: <XCircle size={14} /> },
                  { key: 'disabled', label: 'معطّل', disabled: true },
                ]}
                defaultTab="all"
              />
            </div>
            <div>
              <Label>Pill — تبويب حبة</Label>
              <Tabs
                variant="pill"
                tabs={[
                  { key: 'products', label: 'منتجات', icon: <Package size={14} /> },
                  { key: 'orders', label: 'طلبيات', icon: <ShoppingCart size={14} /> },
                  { key: 'analytics', label: 'تحليلات', icon: <BarChart3 size={14} /> },
                  { key: 'settings', label: 'إعدادات', icon: <Settings size={14} /> },
                ]}
                defaultTab="products"
              />
            </div>
          </div>
        </Section>

        {/* ── TABLE ── */}
        <Section title="الجداول">
          <Table<ProductRow>
            rowKey="id"
            columns={[
              { key: 'name', header: 'المنتج', sortable: true },
              { key: 'category', header: 'الفئة' },
              {
                key: 'stock',
                header: 'المخزون',
                sortable: true,
                align: 'center',
                render: (v) => {
                  const n = v as number;
                  const color = n === 0 ? 'error' : n < 20 ? 'warning' : 'success';
                  return <StatusBadge status={color} label={String(n)} />;
                },
              },
              { key: 'price', header: 'السعر', align: 'end' },
              {
                key: 'status',
                header: 'الحالة',
                render: (v) => {
                  const s = v as string;
                  return (
                    <Badge
                      variant={s === 'متوفر' ? 'success' : s === 'منخفض' ? 'warning' : 'error'}
                      dot
                    >
                      {s}
                    </Badge>
                  );
                },
              },
              {
                key: 'id',
                header: 'إجراءات',
                align: 'center',
                render: () => (
                  <Row className="justify-center">
                    <IconButton aria-label="عرض" variant="ghost" size="xs"><Eye size={14} /></IconButton>
                    <IconButton aria-label="تعديل" variant="ghost" size="xs"><Edit size={14} /></IconButton>
                    <IconButton aria-label="حذف" variant="ghost" size="xs"><Trash2 size={14} /></IconButton>
                  </Row>
                ),
              },
            ]}
            data={tableData}
          />
        </Section>

        {/* ── DROPDOWN & TOOLTIP ── */}
        <Section title="القوائم المنسدلة والتلميحات">
          <div className="card p-6 flex flex-wrap gap-6">
            <div>
              <Label>Dropdown</Label>
              <Dropdown
                trigger={<Button variant="secondary" iconEnd={<Settings size={16} />}>الإعدادات</Button>}
                items={[
                  { key: 'edit', label: 'تعديل', icon: <Edit size={14} /> },
                  { key: 'view', label: 'عرض', icon: <Eye size={14} />, dividerAfter: true },
                  { key: 'export', label: 'تصدير', icon: <Download size={14} /> },
                  { key: 'delete', label: 'حذف', icon: <Trash2 size={14} />, danger: true },
                ]}
                onSelect={(key) => toast({ type: 'info', title: `تم اختيار: ${key}` })}
              />
            </div>
            <div>
              <Label>Tooltip — أعلى</Label>
              <Tooltip content="هذا تلميح توضيحي" placement="top">
                <Button variant="outline">تمرير الفأرة</Button>
              </Tooltip>
            </div>
            <div>
              <Label>Tooltip — أسفل</Label>
              <Tooltip content="معلومات إضافية هنا" placement="bottom">
                <Button variant="ghost" iconStart={<Info size={16} />}>معلومات</Button>
              </Tooltip>
            </div>
          </div>
        </Section>

        {/* ── MODAL & DRAWER ── */}
        <Section title="الحوارات والأدراج">
          <div className="card p-6 flex flex-wrap gap-4">
            <Button variant="primary" onClick={() => setModalOpen(true)}>
              فتح نافذة حوار
            </Button>
            <Button variant="secondary" onClick={() => setDrawerOpen(true)}>
              فتح الدرج الجانبي
            </Button>
          </div>

          <Modal
            open={modalOpen}
            onClose={() => setModalOpen(false)}
            title="تأكيد الطلبية"
            description="يرجى مراجعة تفاصيل الطلبية قبل الإرسال"
            footer={
              <>
                <Button variant="ghost" onClick={() => setModalOpen(false)}>إلغاء</Button>
                <Button variant="primary" onClick={() => { setModalOpen(false); toast({ type: 'success', title: 'تم إرسال الطلبية', description: 'سيتم معالجتها خلال ٢٤ ساعة.' }); }}>
                  إرسال الطلبية
                </Button>
              </>
            }
          >
            <div className="space-y-4">
              <p className="text-sm text-[var(--text-secondary)]">
                أنت على وشك إرسال طلبية تحتوي على ٣ منتجات بإجمالي <strong className="text-[var(--text-primary)]">٥٤٠ ر.س</strong>.
              </p>
              <div className="card bg-[var(--bg-surface-2)] p-4 space-y-2">
                {['زيت الزيتون × ٢ — ٩٠ ر.س', 'أرز بسمتي × ٣ — ٢٤٠ ر.س', 'قهوة عربية × ٣ — ١٩٥ ر.س'].map((item) => (
                  <div key={item} className="flex items-center justify-between text-sm">
                    <span className="text-[var(--text-secondary)]">{item}</span>
                    <CheckCircle2 size={14} className="text-[#91D06C]" />
                  </div>
                ))}
              </div>
            </div>
          </Modal>

          <Drawer
            open={drawerOpen}
            onClose={() => setDrawerOpen(false)}
            title="تفاصيل المنتج"
            footer={
              <>
                <Button variant="ghost" size="sm" onClick={() => setDrawerOpen(false)}>إغلاق</Button>
                <Button variant="primary" size="sm">حفظ التغييرات</Button>
              </>
            }
          >
            <div className="space-y-4">
              <Input label="اسم المنتج" defaultValue="زيت الزيتون البكر" />
              <Select label="الفئة">
                <option value="oils">زيوت</option>
                <option value="grains">حبوب</option>
              </Select>
              <Input label="السعر" defaultValue="٤٥" iconStart={<span className="text-xs">ر.س</span>} />
              <Switch label="منتج نشط" checked onChange={() => {}} />
            </div>
          </Drawer>
        </Section>

        {/* ── TOASTS ── */}
        <Section title="الإشعارات">
          <div className="card p-6 flex flex-wrap gap-3">
            <Button variant="success" iconStart={<CheckCircle2 size={16} />} onClick={() => showToast('success')}>نجاح</Button>
            <Button variant="outline" iconStart={<AlertTriangle size={16} />} onClick={() => showToast('warning')} className="text-[#7A6E00] border-[#E8DD00]">تحذير</Button>
            <Button variant="destructive" iconStart={<XCircle size={16} />} onClick={() => showToast('error')}>خطأ</Button>
            <Button variant="secondary" iconStart={<Info size={16} />} onClick={() => showToast('info')}>معلومة</Button>
          </div>
        </Section>

        {/* ── SKELETON & EMPTY & LOADING ── */}
        <Section title="الهياكل العظمية والحالات الفارغة">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <Label>Skeleton Loading</Label>
              <CardSkeleton />
            </div>
            <div>
              <Label>Empty State</Label>
              <Card padding="none">
                <EmptyState
                  icon={<Package size={28} />}
                  title="لا توجد منتجات"
                  description="لم تقم بإضافة أي منتج بعد. ابدأ بإضافة منتجك الأول."
                  action={{ label: 'إضافة منتج', onClick: () => toast({ type: 'info', title: 'فتح نموذج الإضافة' }) }}
                />
              </Card>
            </div>
            <div>
              <Label>Loading State</Label>
              <Card padding="none">
                <LoadingState message="جارٍ تحميل المنتجات…" />
              </Card>
            </div>
          </div>

          <div className="mt-6 card p-6 space-y-3">
            <Label>Skeleton — أشكال مختلفة</Label>
            <div className="flex items-center gap-3">
              <Skeleton variant="circular" width={48} height={48} />
              <div className="flex-1">
                <Skeleton variant="text" width="50%" className="mb-2" />
                <Skeleton variant="text" height={12} width="35%" />
              </div>
            </div>
            <Skeleton variant="rounded" height={100} />
            <div className="flex gap-2">
              <Skeleton variant="rounded" height={36} className="flex-1" />
              <Skeleton variant="rounded" height={36} className="flex-1" />
              <Skeleton variant="rounded" height={36} width={80} />
            </div>
          </div>
        </Section>

        {/* ── DIVIDERS ── */}
        <Section title="الفواصل">
          <div className="card p-6 space-y-5">
            <Divider />
            <Divider label="أو" />
            <div className="flex items-center gap-4 h-12">
              <span className="text-sm text-[var(--text-muted)]">نص على اليمين</span>
              <Divider orientation="vertical" />
              <span className="text-sm text-[var(--text-muted)]">نص على اليسار</span>
              <Divider orientation="vertical" />
              <span className="text-sm text-[var(--text-muted)]">نص ثالث</span>
            </div>
          </div>
        </Section>

        {/* ── THEME ── */}
        <Section title="نظام الثيم">
          <div className="card p-6 space-y-4">
            <p className="text-sm text-[var(--text-secondary)]">
              يدعم النظام وضعين: فاتح وداكن مع حفظ التفضيل في localStorage.
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <ThemeToggle variant="segmented" />
              <ThemeToggle variant="icon" />
            </div>
          </div>
        </Section>

        {/* Footer */}
        <footer className="mt-16 pt-8 border-t border-[var(--border-subtle)] text-center">
          <p className="text-sm text-[var(--text-muted)]">
            سيريوس — نظام التصميم · المرحلة الأولى · للاستخدام الداخلي فقط
          </p>
        </footer>
      </main>
    </div>
  );
}
