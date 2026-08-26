import { Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useRole } from '@/contexts/RoleContext';
import { useStore } from '@/contexts/StoreContext';
import { useWarehouse } from '@/contexts/WarehouseContext';

// ============================================================
// SIRIUS — Notification Button
// Shows live unread count from the active role's context.
// ============================================================

interface NotificationButtonProps {
  className?: string;
}

export function NotificationButton({ className }: NotificationButtonProps) {
  const { role } = useRole();
  const navigate = useNavigate();

  // Read live unread counts from each context
  const { unreadCount: storeUnread }     = useStore();
  const { unreadCount: warehouseUnread } = useWarehouse();

  const count = role === 'store' ? storeUnread : warehouseUnread;

  return (
    <button
      onClick={() => navigate(`/${role}/notifications`)}
      aria-label={count > 0 ? `الإشعارات — ${count} غير مقروء` : 'الإشعارات'}
      className={cn(
        'relative flex items-center justify-center w-9 h-9',
        'rounded-[var(--radius-md)]',
        'text-[var(--text-muted)] hover:text-[var(--text-primary)]',
        'hover:bg-[var(--interactive-secondary)]',
        'transition-colors duration-[120ms]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4C8CE4]/40',
        className
      )}
    >
      <Bell size={19} aria-hidden="true" />

      {count > 0 && (
        <span
          aria-hidden="true"
          className={cn(
            'absolute top-1 end-1',
            'flex items-center justify-center',
            'min-w-[1rem] h-4 px-0.5',
            'text-[0.55rem] font-bold',
            'bg-[#4C8CE4] text-white rounded-full',
            'ring-2 ring-[var(--bg-surface)]'
          )}
        >
          {count > 9 ? '9+' : count}
        </span>
      )}
    </button>
  );
}
