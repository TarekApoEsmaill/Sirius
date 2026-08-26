import { Link } from 'react-router-dom';
import {
  Bell, Check, CheckCheck,
  Package, Truck, Star, ClipboardList, Info,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { ContentContainer } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/common/PageHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { useStore } from '@/contexts/StoreContext';
import { cn } from '@/lib/utils';
import type { StoreNotification } from '@/types/store';

// ============================================================
// Store — Notifications  /store/notifications
// ============================================================

const TYPE_ICONS: Record<StoreNotification['type'], React.ReactNode> = {
  order_accepted:  <Check size={15} aria-hidden="true" />,
  order_rejected:  <ClipboardList size={15} aria-hidden="true" />,
  order_ready:     <Package size={15} aria-hidden="true" />,
  order_shipped:   <Truck size={15} aria-hidden="true" />,
  order_completed: <Star size={15} aria-hidden="true" />,
  general:         <Info size={15} aria-hidden="true" />,
};

const TYPE_COLORS: Record<StoreNotification['type'], string> = {
  order_accepted:  'bg-[#4C8CE4]/10 text-[#4C8CE4]',
  order_rejected:  'bg-[var(--status-error-bg)] text-[var(--status-error-text)]',
  order_ready:     'bg-[#91D06C]/15 text-[#3D7A1F]',
  order_shipped:   'bg-[#406093]/10 text-[#406093]',
  order_completed: 'bg-[#FFF799]/50 text-[#7A6E00]',
  general:         'bg-[var(--bg-surface-3)] text-[var(--text-muted)]',
};

function formatRelativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  if (days > 0) return `منذ ${days} ${days === 1 ? 'يوم' : 'أيام'}`;
  if (hours > 0) return `منذ ${hours} ${hours === 1 ? 'ساعة' : 'ساعات'}`;
  if (minutes > 0) return `منذ ${minutes} دقيقة`;
  return 'الآن';
}

function NotificationItem({ notification }: { notification: StoreNotification }) {
  const { markNotificationRead } = useStore();
  const iconColors = TYPE_COLORS[notification.type];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.18 }}
      className={cn(
        'flex items-start gap-3 px-5 py-4 transition-colors',
        !notification.isRead
          ? 'bg-[#4C8CE4]/[0.03] hover:bg-[#4C8CE4]/[0.06] cursor-pointer'
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
      aria-label={!notification.isRead ? `تحديد "${notification.title}" كمقروء` : undefined}
    >
      {/* Icon */}
      <div className={cn('flex items-center justify-center w-8 h-8 rounded-full shrink-0 mt-0.5', iconColors)}>
        {TYPE_ICONS[notification.type]}
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className={cn(
            'text-sm leading-snug',
            notification.isRead
              ? 'font-medium text-[var(--text-secondary)]'
              : 'font-semibold text-[var(--text-primary)]'
          )}>
            {notification.title}
          </p>
          <span className="text-[0.6875rem] text-[var(--text-muted)] whitespace-nowrap shrink-0 mt-0.5">
            {formatRelativeTime(notification.createdAt)}
          </span>
        </div>
        <p className="text-xs text-[var(--text-muted)] mt-0.5 leading-relaxed">{notification.body}</p>

        {/* Link to order if available */}
        {notification.orderId && (
          <Link
            to={`/store/orders/${notification.orderId}`}
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1 mt-1.5 text-xs text-[#4C8CE4] hover:text-[#3B7BD4] font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#4C8CE4]/40 rounded-sm"
          >
            عرض الطلب #{notification.orderId}
          </Link>
        )}
      </div>

      {/* Unread indicator */}
      {!notification.isRead && (
        <div
          className="w-2 h-2 rounded-full bg-[#4C8CE4] shrink-0 mt-2"
          aria-label="غير مقروء"
        />
      )}
    </motion.div>
  );
}

export function StoreNotifications() {
  const { notifications, markAllNotificationsRead, unreadCount } = useStore();

  const sorted = [...notifications].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return (
    <ContentContainer>
      <PageHeader
        title="الإشعارات"
        description={
          unreadCount > 0
            ? `لديك ${unreadCount} إشعار غير مقروء`
            : 'جميع إشعاراتك من الطلبات والمستودعات.'
        }
        breadcrumbs={[
          { label: 'لوحة التحكم', path: '/store' },
          { label: 'الإشعارات' },
        ]}
        primaryAction={
          unreadCount > 0 ? (
            <Button
              variant="ghost"
              size="sm"
              iconStart={<CheckCheck size={15} />}
              onClick={markAllNotificationsRead}
            >
              تحديد الكل كمقروء
            </Button>
          ) : undefined
        }
      />

      {sorted.length === 0 ? (
        <EmptyState
          icon={<Bell size={28} />}
          title="لا توجد إشعارات"
          description="ستظهر هنا إشعارات طلباتك وتحديثات المستودعات."
        />
      ) : (
        <Card padding="none" className="overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-[var(--border-subtle)] bg-[var(--bg-surface-2)]">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-[var(--text-primary)]">
                الإشعارات
              </span>
              {unreadCount > 0 && (
                <Badge variant="brand" size="sm">{unreadCount} جديد</Badge>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllNotificationsRead}
                className="flex items-center gap-1 text-xs text-[#4C8CE4] hover:text-[#3B7BD4] font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#4C8CE4]/40 rounded-sm"
              >
                <CheckCheck size={12} aria-hidden="true" />
                تحديد الكل كمقروء
              </button>
            )}
          </div>

          {/* List */}
          <div className="divide-y divide-[var(--border-subtle)]" role="list" aria-label="قائمة الإشعارات">
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
