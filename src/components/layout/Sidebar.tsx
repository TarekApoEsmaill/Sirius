import { useCallback, useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, PanelRightClose, PanelRightOpen, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRole } from '@/contexts/RoleContext';
import { useStore } from '@/contexts/StoreContext';
import { useWarehouse } from '@/contexts/WarehouseContext';
import { getNavItems } from '@/data/navigation';
import type { NavItem } from '@/types';

// ============================================================
// SIRIUS — Sidebar Component
// ============================================================

const COLLAPSED_KEY = 'sirius-sidebar-collapsed';
const EXPANDED_WIDTH = 240;
const COLLAPSED_WIDTH = 64;

interface SidebarProps {
  className?: string;
}

// Brand mark
function SiriusBrand({ collapsed }: { collapsed: boolean }) {
  return (
    <div className={cn('flex items-center gap-3 px-4 py-5', collapsed && 'justify-center px-0')}>
      {/* Logo mark */}
      <div className="relative shrink-0">
        <div className="flex items-center justify-center w-9 h-9 rounded-[10px] bg-gradient-to-br from-[#4C8CE4] to-[#406093] shadow-[0_2px_8px_0_rgb(76_140_228/0.35)]">
          <Star size={17} className="text-white" fill="white" aria-hidden="true" />
        </div>
      </div>

      <AnimatePresence initial={false}>
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: 'auto' }}
            exit={{ opacity: 0, width: 0 }}
            transition={{ duration: 0.2, ease: [0, 0, 0.2, 1] }}
            className="overflow-hidden whitespace-nowrap"
          >
            <p className="text-base font-black text-[var(--text-primary)] leading-tight tracking-tight">
              سيريوس
            </p>
            <p className="text-[0.625rem] font-medium text-[var(--text-muted)] leading-tight tracking-wide uppercase">
              Sirius
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Single nav item
interface SidebarItemProps {
  item: NavItem;
  collapsed: boolean;
  onClick?: () => void;
}

function SidebarItem({ item, collapsed, onClick }: SidebarItemProps) {
  const location = useLocation();
  // Exact match for dashboard, prefix match for others
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
        onClick={onClick}
        aria-label={collapsed ? item.label : undefined}
        className={({ isActive: routerActive }) =>
          cn(
            'group relative flex items-center gap-3 rounded-[var(--radius-md)]',
            'font-medium text-sm transition-all duration-[120ms]',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4C8CE4]/40',
            collapsed ? 'h-10 w-10 justify-center mx-auto' : 'h-10 px-3',
            routerActive || isActive
              ? 'bg-[#4C8CE4]/10 text-[#4C8CE4]'
              : 'text-[var(--text-muted)] hover:bg-[var(--interactive-secondary)] hover:text-[var(--text-primary)]'
          )
        }
      >
        {({ isActive: routerActive }) => {
          const active = routerActive || isActive;
          return (
            <>
              {/* Active indicator */}
              {active && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute inset-0 bg-[#4C8CE4]/10 rounded-[var(--radius-md)]"
                  transition={{ duration: 0.2, ease: [0, 0, 0.2, 1] }}
                  aria-hidden="true"
                />
              )}

              {/* Icon */}
              <span
                className={cn(
                  'relative z-10 shrink-0 transition-transform duration-[120ms]',
                  active ? 'text-[#4C8CE4]' : 'text-[var(--text-muted)] group-hover:text-[var(--text-primary)]'
                )}
                aria-hidden="true"
              >
                {item.icon}
              </span>

              {/* Label */}
              <AnimatePresence initial={false}>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    transition={{ duration: 0.18, ease: [0, 0, 0.2, 1] }}
                    className={cn(
                      'relative z-10 whitespace-nowrap overflow-hidden flex-1',
                      active ? 'text-[#4C8CE4]' : ''
                    )}
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>

              {/* Badge */}
              {item.badge !== undefined && item.badge > 0 && !collapsed && (
                <motion.span
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className={cn(
                    'relative z-10 inline-flex items-center justify-center',
                    'min-w-[1.125rem] h-[1.125rem] px-1',
                    'text-[0.625rem] font-bold rounded-full',
                    active ? 'bg-[#4C8CE4] text-white' : 'bg-[var(--border-default)] text-[var(--text-muted)]'
                  )}
                  aria-label={`${item.badge} إشعار`}
                >
                  {item.badge > 99 ? '99+' : item.badge}
                </motion.span>
              )}

              {/* Collapsed badge dot */}
              {item.badge !== undefined && item.badge > 0 && collapsed && (
                <span
                  className="absolute top-1.5 end-1.5 w-2 h-2 rounded-full bg-[#4C8CE4]"
                  aria-hidden="true"
                />
              )}

              {/* Collapsed tooltip */}
              {collapsed && (
                <span
                  role="tooltip"
                  className={cn(
                    'pointer-events-none absolute end-full me-2 top-1/2 -translate-y-1/2',
                    'whitespace-nowrap px-2.5 py-1.5 text-xs font-medium',
                    'bg-[#0F172A] text-white rounded-[var(--radius-sm)]',
                    'opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100',
                    'transition-opacity duration-[120ms]',
                    'shadow-[var(--shadow-3)]',
                    'z-[600]'
                  )}
                >
                  {item.label}
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="mr-1 text-[#7FB3F5]">({item.badge})</span>
                  )}
                </span>
              )}
            </>
          );
        }}
      </NavLink>
    </li>
  );
}

// Main Sidebar
export function Sidebar({ className }: SidebarProps) {
  const { role } = useRole();
  const baseNavItems = getNavItems(role);

  // Live badge counts from context
  const { cartCount, unreadCount: storeUnread } = useStore();
  const { pendingOrderCount, unreadCount: warehouseUnread } = useWarehouse();

  // Inject live counts into nav items
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

  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem(COLLAPSED_KEY) === 'true';
    } catch { return false; }
  });

  const toggle = useCallback(() => {
    setCollapsed((prev) => {
      const next = !prev;
      try { localStorage.setItem(COLLAPSED_KEY, String(next)); } catch { /* ignore */ }
      return next;
    });
  }, []);

  // Keyboard: Ctrl+B toggles sidebar
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'b') { e.preventDefault(); toggle(); }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [toggle]);

  return (
    <motion.aside
      role="navigation"
      aria-label="القائمة الرئيسية"
      initial={false}
      animate={{ width: collapsed ? COLLAPSED_WIDTH : EXPANDED_WIDTH }}
      transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
      style={{ minWidth: collapsed ? COLLAPSED_WIDTH : EXPANDED_WIDTH }}
      className={cn(
        'hidden lg:flex flex-col shrink-0',
        'bg-[var(--bg-surface)] border-s border-[var(--border-subtle)]',
        'h-screen sticky top-0 overflow-hidden',
        className
      )}
    >
      {/* Brand */}
      <SiriusBrand collapsed={collapsed} />

      {/* Divider */}
      <div className="h-px bg-[var(--border-subtle)] mx-4 mb-2" />

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto overflow-x-hidden px-2 py-1">
        <ul role="list" className="flex flex-col gap-0.5">
          {navItems.map((item) => (
            <SidebarItem key={item.key} item={item} collapsed={collapsed} />
          ))}
        </ul>
      </nav>

      {/* Divider */}
      <div className="h-px bg-[var(--border-subtle)] mx-4 mt-2" />

      {/* Collapse toggle */}
      <div className={cn('p-2', collapsed && 'flex justify-center')}>
        <button
          onClick={toggle}
          aria-label={collapsed ? 'توسيع القائمة الجانبية' : 'طي القائمة الجانبية'}
          className={cn(
            'flex items-center gap-2.5 w-full px-3 h-9 rounded-[var(--radius-md)]',
            'text-sm font-medium text-[var(--text-muted)]',
            'hover:bg-[var(--interactive-secondary)] hover:text-[var(--text-primary)]',
            'transition-colors duration-[120ms]',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4C8CE4]/40',
            collapsed && 'w-10 justify-center px-0'
          )}
        >
          {collapsed ? (
            <PanelRightOpen size={18} aria-hidden="true" />
          ) : (
            <>
              <PanelRightClose size={18} aria-hidden="true" />
              <span>طي القائمة</span>
            </>
          )}
        </button>
      </div>

      {/* Bottom padding */}
      <div className="h-4" />
    </motion.aside>
  );
}

// Arrow icon for breadcrumbs (RTL-aware)
export function BreadcrumbArrow() {
  return <ChevronRight size={14} className="text-[var(--text-disabled)]" aria-hidden="true" />;
}
