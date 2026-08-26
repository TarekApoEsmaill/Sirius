import { useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRole } from '@/contexts/RoleContext';
import { useStore } from '@/contexts/StoreContext';
import { useWarehouse } from '@/contexts/WarehouseContext';
import { getNavItems } from '@/data/navigation';
import { RoleSwitcher } from '@/components/common/RoleSwitcher';
import { UserIdentity } from '@/components/common/UserIdentity';
import type { NavItem } from '@/types';

// ============================================================
// SIRIUS — Mobile Navigation Drawer
// ============================================================

interface MobileNavProps {
  open: boolean;
  onClose: () => void;
}

function MobileNavItem({ item, onClose }: { item: NavItem; onClose: () => void }) {
  const location = useLocation();
  const isActive =
    item.path === location.pathname ||
    (item.path !== '/store' &&
      item.path !== '/warehouse' &&
      location.pathname.startsWith(item.path));

  return (
    <li role="none">
      <NavLink
        to={item.path}
        end={item.path === '/store' || item.path === '/warehouse'}
        onClick={onClose}
        className={({ isActive: routerActive }) =>
          cn(
            'flex items-center gap-3 h-12 px-4 rounded-[var(--radius-md)]',
            'text-sm font-medium transition-colors duration-[120ms]',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4C8CE4]/40',
            (routerActive || isActive)
              ? 'bg-[#4C8CE4]/10 text-[#4C8CE4]'
              : 'text-[var(--text-secondary)] hover:bg-[var(--interactive-secondary)] hover:text-[var(--text-primary)]'
          )
        }
      >
        {({ isActive: routerActive }) => {
          const active = routerActive || isActive;
          return (
            <>
              <span
                className={cn(
                  'shrink-0',
                  active ? 'text-[#4C8CE4]' : 'text-[var(--text-muted)]'
                )}
                aria-hidden="true"
              >
                {item.icon}
              </span>
              <span className="flex-1">{item.label}</span>
              {item.badge !== undefined && item.badge > 0 && (
                <span
                  className={cn(
                    'inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1',
                    'text-[0.625rem] font-bold rounded-full',
                    active ? 'bg-[#4C8CE4] text-white' : 'bg-[var(--border-default)] text-[var(--text-muted)]'
                  )}
                  aria-label={`${item.badge} إشعار`}
                >
                  {item.badge}
                </span>
              )}
            </>
          );
        }}
      </NavLink>
    </li>
  );
}

export function MobileNav({ open, onClose }: MobileNavProps) {
  const { role } = useRole();
  const { cartCount, unreadCount: storeUnread } = useStore();
  const { pendingOrderCount, unreadCount: warehouseUnread } = useWarehouse();

  const baseNavItems = getNavItems(role);
  const navItems: NavItem[] = baseNavItems.map((item) => {
    if (role === 'store') {
      if (item.key === 'cart')          return { ...item, badge: cartCount || undefined };
      if (item.key === 'notifications') return { ...item, badge: storeUnread || undefined };
    } else {
      if (item.key === 'orders')        return { ...item, badge: pendingOrderCount || undefined };
      if (item.key === 'notifications') return { ...item, badge: warehouseUnread || undefined };
    }
    return item;
  });

  // Close on route change
  const location = useLocation();
  useEffect(() => {
    onClose();
  }, [location.pathname, onClose]);

  // Trap focus and handle Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="القائمة الرئيسية"
          style={{ zIndex: 400 }}
          className="fixed inset-0 lg:hidden"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-[var(--bg-overlay)]"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Drawer panel — slides from right (inline-start in RTL) */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ duration: 0.28, ease: [0, 0, 0.2, 1] }}
            className={cn(
              'absolute inset-y-0 start-0 w-72 max-w-[85vw]',
              'flex flex-col',
              'bg-[var(--bg-surface)] border-e border-[var(--border-subtle)]',
              'shadow-[var(--shadow-modal)]'
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-4 border-b border-[var(--border-subtle)] shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="flex items-center justify-center w-8 h-8 rounded-[9px] bg-gradient-to-br from-[#4C8CE4] to-[#406093] shadow-[0_2px_6px_0_rgb(76_140_228/0.35)]">
                  <Star size={15} className="text-white" fill="white" aria-hidden="true" />
                </div>
                <span className="text-base font-black text-[var(--text-primary)]">سيريوس</span>
              </div>

              <button
                onClick={onClose}
                aria-label="إغلاق القائمة"
                autoFocus
                className={cn(
                  'flex items-center justify-center w-9 h-9 rounded-[var(--radius-md)]',
                  'text-[var(--text-muted)] hover:text-[var(--text-primary)]',
                  'hover:bg-[var(--interactive-secondary)]',
                  'transition-colors duration-[120ms]',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4C8CE4]/40'
                )}
              >
                <X size={18} aria-hidden="true" />
              </button>
            </div>

            {/* Identity */}
            <div className="px-4 py-3 border-b border-[var(--border-subtle)] shrink-0">
              <UserIdentity compact />
            </div>

            {/* Navigation */}
            <nav
              aria-label="القائمة الرئيسية"
              className="flex-1 overflow-y-auto px-2 py-3"
            >
              <ul role="list" className="flex flex-col gap-0.5">
                {navItems.map((item) => (
                  <MobileNavItem key={item.key} item={item} onClose={onClose} />
                ))}
              </ul>
            </nav>

            {/* Role switcher at bottom */}
            <div className="shrink-0 px-4 pb-5 pt-3 border-t border-[var(--border-subtle)]">
              <p className="text-xs text-[var(--text-muted)] mb-2 font-medium">تجربة النظام كـ</p>
              <RoleSwitcher compact />
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
