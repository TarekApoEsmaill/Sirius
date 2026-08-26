import { useState } from 'react';
import { Save, Store, Bell, Palette } from 'lucide-react';
import { ContentContainer } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/common/PageHeader';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Switch } from '@/components/ui/Switch';
import { ThemeToggle } from '@/components/common/ThemeToggle';
import { useStore } from '@/contexts/StoreContext';
import { useToast } from '@/components/ui/Toast';

// ============================================================
// Store — Settings  /store/settings
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
        <div className="flex items-center justify-center w-8 h-8 rounded-[var(--radius-md)] bg-[#4C8CE4]/10 text-[#4C8CE4] shrink-0">
          {icon}
        </div>
        <div>
          <h2 className="text-[0.9375rem] font-semibold text-[var(--text-primary)]">{title}</h2>
          {description && (
            <p className="text-xs text-[var(--text-muted)] mt-0.5">{description}</p>
          )}
        </div>
      </div>
      <div className="p-6">{children}</div>
    </Card>
  );
}

function ToggleRow({
  label,
  description,
  checked,
  onChange,
  id,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  id: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-3 border-b border-[var(--border-subtle)] last:border-0">
      <div className="min-w-0">
        <label htmlFor={id} className="text-sm font-medium text-[var(--text-primary)] cursor-pointer">
          {label}
        </label>
        {description && (
          <p className="text-xs text-[var(--text-muted)] mt-0.5">{description}</p>
        )}
      </div>
      <Switch
        id={id}
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        aria-label={label}
      />
    </div>
  );
}

export function StoreSettings() {
  const { settings, updateSettings } = useStore();
  const { toast } = useToast();

  // Local form state
  const [form, setForm] = useState({
    storeName: settings.storeName,
    phone: settings.phone,
    address: settings.address,
    city: settings.city,
  });
  const [notifSettings, setNotifSettings] = useState({
    notifyOnOrderAccepted: settings.notifyOnOrderAccepted,
    notifyOnOrderReady: settings.notifyOnOrderReady,
    notifyOnOrderShipped: settings.notifyOnOrderShipped,
  });
  const [saving, setSaving] = useState(false);

  const handleSaveInfo = async () => {
    setSaving(true);
    // Simulate async save
    await new Promise((r) => setTimeout(r, 500));
    updateSettings({ ...form });
    setSaving(false);
    toast({ type: 'success', title: 'تم الحفظ', description: 'تم تحديث معلومات المتجر بنجاح.' });
  };

  const handleToggleNotif = (key: keyof typeof notifSettings, value: boolean) => {
    const updated = { ...notifSettings, [key]: value };
    setNotifSettings(updated);
    updateSettings({ [key]: value });
  };

  return (
    <ContentContainer maxWidth="lg">
      <PageHeader
        title="الإعدادات"
        description="إدارة معلومات متجرك وتفضيلات الإشعارات والمظهر."
        breadcrumbs={[
          { label: 'لوحة التحكم', path: '/store' },
          { label: 'الإعدادات' },
        ]}
      />

      <div className="flex flex-col gap-6">
        {/* Store info */}
        <SectionCard
          icon={<Store size={16} aria-hidden="true" />}
          title="معلومات المتجر"
          description="البيانات الأساسية لمتجرك."
        >
          <div className="grid sm:grid-cols-2 gap-4">
            <Input
              label="اسم المتجر"
              value={form.storeName}
              onChange={(e) => setForm((f) => ({ ...f, storeName: e.target.value }))}
              placeholder="أدخل اسم المتجر"
            />
            <Input
              label="رقم الهاتف"
              value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              placeholder="09XX-XXX-XXX"
              type="tel"
              dir="ltr"
            />
            <Input
              label="المدينة"
              value={form.city}
              onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
              placeholder="أدخل المدينة"
            />
            <Input
              label="العنوان"
              value={form.address}
              onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
              placeholder="الشارع، الحي، رقم البناء"
            />
          </div>

          <div className="mt-5 flex justify-end">
            <Button
              variant="primary"
              size="sm"
              loading={saving}
              onClick={handleSaveInfo}
              iconStart={<Save size={15} aria-hidden="true" />}
            >
              {saving ? 'جارٍ الحفظ…' : 'حفظ التغييرات'}
            </Button>
          </div>
        </SectionCard>

        {/* Notifications */}
        <SectionCard
          icon={<Bell size={16} aria-hidden="true" />}
          title="الإشعارات"
          description="اختر متى تريد أن تتلقى إشعارات على طلباتك."
        >
          <ToggleRow
            id="notif-accepted"
            label="تأكيد الطلب"
            description="عند قبول طلبك من المستودع."
            checked={notifSettings.notifyOnOrderAccepted}
            onChange={(v) => handleToggleNotif('notifyOnOrderAccepted', v)}
          />
          <ToggleRow
            id="notif-ready"
            label="الطلب جاهز"
            description="عندما يكون طلبك جاهزاً للإرسال."
            checked={notifSettings.notifyOnOrderReady}
            onChange={(v) => handleToggleNotif('notifyOnOrderReady', v)}
          />
          <ToggleRow
            id="notif-shipped"
            label="تم الإرسال"
            description="عند شحن طلبك وإرساله."
            checked={notifSettings.notifyOnOrderShipped}
            onChange={(v) => handleToggleNotif('notifyOnOrderShipped', v)}
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
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                يمكنك التبديل بين الوضع الفاتح والداكن أو اتباع إعداد النظام.
              </p>
            </div>
            <ThemeToggle variant="segmented" />
          </div>
        </SectionCard>
      </div>
    </ContentContainer>
  );
}
