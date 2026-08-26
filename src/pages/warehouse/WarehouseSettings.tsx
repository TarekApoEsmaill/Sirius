import { useState } from 'react';
import { Save, Building2, Bell, Palette, Power } from 'lucide-react';
import { ContentContainer } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/common/PageHeader';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Switch } from '@/components/ui/Switch';
import { Badge } from '@/components/ui/Badge';
import { ThemeToggle } from '@/components/common/ThemeToggle';
import { useWarehouse } from '@/contexts/WarehouseContext';
import { useToast } from '@/components/ui/Toast';

// ============================================================
// Warehouse — Settings  /warehouse/settings
// ============================================================

function SectionCard({
  icon,
  title,
  description,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <Card padding="none" className="overflow-hidden">
      <div className="flex items-start gap-3 px-6 py-4 border-b border-[var(--border-subtle)] bg-[var(--bg-surface-2)]">
        <div className="flex items-center justify-center w-8 h-8 rounded-[var(--radius-md)] bg-[#406093]/10 text-[#406093] shrink-0">
          {icon}
        </div>
        <div>
          <h2 className="text-[0.9375rem] font-semibold text-[var(--text-primary)]">{title}</h2>
          {description && <p className="text-xs text-[var(--text-muted)] mt-0.5">{description}</p>}
        </div>
      </div>
      <div className="p-6">{children}</div>
    </Card>
  );
}

function ToggleRow({
  id, label, description, checked, onChange,
}: {
  id: string; label: string; description?: string;
  checked: boolean; onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-3 border-b border-[var(--border-subtle)] last:border-0">
      <div className="min-w-0">
        <label htmlFor={id} className="text-sm font-medium text-[var(--text-primary)] cursor-pointer">{label}</label>
        {description && <p className="text-xs text-[var(--text-muted)] mt-0.5">{description}</p>}
      </div>
      <Switch id={id} checked={checked} onChange={(e) => onChange(e.target.checked)} aria-label={label} />
    </div>
  );
}

export function WarehouseSettings() {
  const { settings, updateSettings } = useWarehouse();
  const { toast } = useToast();

  const [form, setForm] = useState({
    warehouseName: settings.warehouseName,
    phone:         settings.phone,
    address:       settings.address,
    city:          settings.city,
  });
  const [saving, setSaving] = useState(false);

  const handleSaveInfo = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 400));
    updateSettings(form);
    setSaving(false);
    toast({ type: 'success', title: 'تم الحفظ', description: 'تم تحديث معلومات المستودع.' });
  };

  const handleToggleOpen = (v: boolean) => {
    updateSettings({ isOpen: v });
    toast({ type: 'info', title: v ? 'المستودع مفتوح الآن' : 'المستودع مغلق الآن' });
  };

  return (
    <ContentContainer maxWidth="lg">
      <PageHeader
        title="الإعدادات"
        description="إدارة معلومات المستودع وتفضيلات الإشعارات والمظهر."
        breadcrumbs={[{ label: 'لوحة التحكم', path: '/warehouse' }, { label: 'الإعدادات' }]}
      />

      <div className="flex flex-col gap-6">
        {/* Warehouse status */}
        <Card padding="md">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Power size={16} className="text-[var(--text-muted)]" aria-hidden="true" />
              <div>
                <p className="text-sm font-semibold text-[var(--text-primary)]">حالة المستودع</p>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">
                  {settings.isOpen ? 'المستودع مفتوح ويستقبل الطلبات' : 'المستودع مغلق مؤقتاً'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <Badge variant={settings.isOpen ? 'success' : 'neutral'} size="sm">
                {settings.isOpen ? 'مفتوح' : 'مغلق'}
              </Badge>
              <Switch
                id="warehouse-open"
                checked={settings.isOpen}
                onChange={(e) => handleToggleOpen(e.target.checked)}
                aria-label="حالة المستودع"
              />
            </div>
          </div>
        </Card>

        {/* Warehouse info */}
        <SectionCard
          icon={<Building2 size={16} aria-hidden="true" />}
          title="معلومات المستودع"
          description="البيانات الأساسية الظاهرة للمحلات."
        >
          <div className="grid sm:grid-cols-2 gap-4">
            <Input
              label="اسم المستودع"
              value={form.warehouseName}
              onChange={(e) => setForm((f) => ({ ...f, warehouseName: e.target.value }))}
              placeholder="اسم المستودع"
            />
            <Input
              label="رقم الهاتف"
              value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              placeholder="011-XXX-XXXX"
              type="tel"
              dir="ltr"
            />
            <Input
              label="المدينة"
              value={form.city}
              onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
              placeholder="المدينة"
            />
            <Input
              label="العنوان"
              value={form.address}
              onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
              placeholder="المنطقة، الشارع"
            />
          </div>
          <div className="mt-5 flex justify-end">
            <Button variant="primary" size="sm" loading={saving} onClick={handleSaveInfo} iconStart={<Save size={15} />}>
              {saving ? 'جارٍ الحفظ…' : 'حفظ التغييرات'}
            </Button>
          </div>
        </SectionCard>

        {/* Notifications */}
        <SectionCard
          icon={<Bell size={16} aria-hidden="true" />}
          title="الإشعارات"
          description="اختر متى تريد تلقي تنبيهات."
        >
          <ToggleRow
            id="notif-new-order"
            label="طلب جديد"
            description="عند وصول طلب جديد من متجر."
            checked={settings.notifyOnNewOrder}
            onChange={(v) => updateSettings({ notifyOnNewOrder: v })}
          />
          <ToggleRow
            id="notif-low-stock"
            label="مخزون منخفض"
            description="عندما يصل مخزون منتج إلى الحد الأدنى."
            checked={settings.notifyOnLowStock}
            onChange={(v) => updateSettings({ notifyOnLowStock: v })}
          />
        </SectionCard>

        {/* Appearance */}
        <SectionCard
          icon={<Palette size={16} aria-hidden="true" />}
          title="المظهر"
          description="اختر مظهر الواجهة المناسب لك."
        >
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-[var(--text-primary)]">وضع العرض</p>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">فاتح، داكن، أو تلقائي.</p>
            </div>
            <ThemeToggle variant="segmented" />
          </div>
        </SectionCard>
      </div>
    </ContentContainer>
  );
}
