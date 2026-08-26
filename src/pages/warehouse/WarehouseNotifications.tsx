import { Link } from 'react-router-dom';
import { Bell, CheckCheck, Package, ClipboardList, AlertTriangle, Info } from 'lucide-react';
import { motion } from 'framer-motion';
import { ContentContainer } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/common/PageHeader';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { useWarehouse } from '@/contexts/WarehouseContext';
import { cn } from '@/lib/utils';
import type { WarehouseNotification } from '@/types/store';

// ============================================================
// Warehouse — Notifications  /warehouse/notifications
// ============================================================

const TYPE_ICONS: Record<WarehouseNotification['type'], React.ReactNode> = {
  new_order:         <ClipboardList size={15} aria-hidden="true" />,
  order_cancelled:   <ClipboardList size={15} aria-hidden="true" />,
  low_stock:         <AlertTriangle size={15} aria-hidden="true" />,
  general:           <Info size={15} aria-hidden="true" />,
};

const TYPE_COLORS: Record<WarehouseNotification['type'], string> = {
  new_order:         'bg-[#4C8CE4]/10 text-[#4C8CE4]',
  order_cancelled:   'bg-[var(--status-error-bg)] text-[var(--status-error-text)]',
  low_stock:         'bg-[var(--status-warning-bg)] text-[var(--status-warning-text)]',
  general:           'bg-[var(--bg-surface-3)] text-[var(--text-muted)]',
};

function formatRelativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours   = Math.floor(minutes / 60);
  const days    = Math.floor(hours / 24);
  if (days > 0)    return `منذ ${days} ${days === 1 ? 'يوم' : 'أيام'}`;
  if (hours > 0)   return `منذ ${hours} ${hours === 1 ? 'ساعة' : 'ساعات'}`;
  if (minutes > 0) return `منذ ${minutes} دقيقة`;
  return 'الآن';
}

function NotificationItem({ notification }: { notification: WarehouseNotification }) {
  const { markNotificationRead } = useWarehouse();

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18 }}
      className={cn(
        'flex items-start gap-3 px-5 py-4 transition-colors cursor-pointer',
        !notification.isRead
          ? 'bg-[#4C8CE4]/[0.03] hover:bg-[#4C8CE4]/[0.06]'
          : 'hover:bg-[var(--bg-surface-2)]'
      )}
      onClick={() => !notification.isRead && markNotificationRead(notification.id)}
      role={!notification.isRead ? 'button' : 'article'}
      tabIndex={!notification.isRead ? 0 : undefined}
      onKeyDown={(e) => {
        if (!notification.isRead && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          markNotificationRead(notification.id);
        }
      }}
    >
      <div className={cn('flex items-center justify-center w-8 h-8 rounded-full shrink-0 mt-0.5', TYPE_COLORS[notification.type])}>
        {TYPE_ICONS[notification.type]}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className={cn('text-sm leading-snug', notification.isRead ? 'font-medium text-[var(--text-secondary)]' : 'font-semibold text-[var(--text-primary)]')}>
            {notification.title}
          </p>
          <span className="text-[0.6875rem] text-[var(--text-muted)] whitespace-nowrap shrink-0 mt-0.5">
            {formatRelativeTime(notification.createdAt)}
          </span>
        </div>
        <p className="text-xs text-[var(--text-muted)] mt-0.5 leading-relaxed">{notification.body}</p>

        {notification.orderId && (
          <Link
            to={`/warehouse/orders/${notification.orderId}`}
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1 mt-1.5 text-xs text-[#4C8CE4] hover:text-[#3B7BD4] font-medium transition-colors rounded-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#4C8CE4]/40"
          >
            عرض الطلب #{notification.orderId}
          </Link>
        )}
        {notification.productId && (
          <Link
            to="/warehouse/inventory"
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1 mt-1.5 text-xs text-[#E8A020] hover:text-[#C88A00] font-medium transition-colors rounded-sm focus-visible:outline-none"
          >
            <Package size={11} aria-hidden="true" />
            إدارة المخزون
          </Link>
        )}
      </div>

      {!notification.isRead && (
        <div className="w-2 h-2 rounded-full bg-[#4C8CE4] shrink-0 mt-2" aria-label="غير مقروء" />
      )}
    </motion.div>
  );
}

export function WarehouseNotifications() {
  const { notifications, markAllNotificationsRead, unreadCount } = useWarehouse();

  const sorted = [...notifications].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <ContentContainer>
      <PageHeader
        title="الإشعارات"
        description={unreadCount > 0 ? `لديك ${unreadCount} إشعار غير مقروء` : 'تنبيهات الطلبات والمخزون.'}
        breadcrumbs={[{ label: 'لوحة التحكم', path: '/warehouse' }, { label: 'الإشعارات' }]}
        primaryAction={
          unreadCount > 0 ? (
            <Button variant="ghost" size="sm" iconStart={<CheckCheck size={15} />} onClick={markAllNotificationsRead}>
              تحديد الكل كمقروء
            </Button>
          ) : undefined
        }
      />

      {sorted.length === 0 ? (
        <EmptyState icon={<Bell size={28} />} title="لا توجد إشعارات" description="ستظهر هنا تنبيهات الطلبات الجديدة والمخزون." />
      ) : (
        <Card padding="none" className="overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-[var(--border-subtle)] bg-[var(--bg-surface-2)]">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-[var(--text-primary)]">الإشعارات</span>
              {unreadCount > 0 && <Badge variant="brand" size="sm">{unreadCount} جديد</Badge>}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllNotificationsRead}
                className="flex items-center gap-1 text-xs text-[#4C8CE4] hover:text-[#3B7BD4] font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#4C8CE4]/40 rounded-sm"
              >
                <CheckCheck size={12} aria-hidden="true" /> تحديد الكل
              </button>
            )}
          </div>
          <div className="divide-y divide-[var(--border-subtle)]" role="list">
            {sorted.map((n) => (
              <div key={n.id} role="listitem">
                <NotificationItem notification={n} />
              </div>
            ))}
          </div>
        </Card>
      )}
    </ContentContainer>
  );
}
