import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  ClipboardList,
  Heart,
  Bell,
  Settings,
  Warehouse,
  BarChart3,
  Store,
} from 'lucide-react';
import type { NavItem, DemoRole } from '@/types';

// ============================================================
// SIRIUS — Navigation Configuration
// ============================================================

export const STORE_NAV: NavItem[] = [
  {
    key: 'dashboard',
    label: 'لوحة التحكم',
    icon: <LayoutDashboard size={20} aria-hidden="true" />,
    path: '/store',
  },
  {
    key: 'warehouses',
    label: 'المستودعات',
    icon: <Warehouse size={20} aria-hidden="true" />,
    path: '/store/warehouses',
  },
  {
    key: 'products',
    label: 'المنتجات',
    icon: <Package size={20} aria-hidden="true" />,
    path: '/store/products',
  },
  {
    key: 'cart',
    label: 'السلة',
    icon: <ShoppingCart size={20} aria-hidden="true" />,
    path: '/store/cart',
  },
  {
    key: 'orders',
    label: 'طلباتي',
    icon: <ClipboardList size={20} aria-hidden="true" />,
    path: '/store/orders',
  },
  {
    key: 'favorites',
    label: 'المفضلة',
    icon: <Heart size={20} aria-hidden="true" />,
    path: '/store/favorites',
  },
  {
    key: 'notifications',
    label: 'الإشعارات',
    icon: <Bell size={20} aria-hidden="true" />,
    path: '/store/notifications',
  },
  {
    key: 'settings',
    label: 'الإعدادات',
    icon: <Settings size={20} aria-hidden="true" />,
    path: '/store/settings',
  },
];

export const WAREHOUSE_NAV: NavItem[] = [
  {
    key: 'dashboard',
    label: 'لوحة التحكم',
    icon: <LayoutDashboard size={20} aria-hidden="true" />,
    path: '/warehouse',
  },
  {
    key: 'products',
    label: 'المنتجات',
    icon: <Package size={20} aria-hidden="true" />,
    path: '/warehouse/products',
  },
  {
    key: 'inventory',
    label: 'المخزون',
    icon: <BarChart3 size={20} aria-hidden="true" />,
    path: '/warehouse/inventory',
  },
  {
    key: 'orders',
    label: 'الطلبات',
    icon: <ClipboardList size={20} aria-hidden="true" />,
    path: '/warehouse/orders',
  },
  {
    key: 'stores',
    label: 'المحلات',
    icon: <Store size={20} aria-hidden="true" />,
    path: '/warehouse/stores',
  },
  {
    key: 'notifications',
    label: 'الإشعارات',
    icon: <Bell size={20} aria-hidden="true" />,
    path: '/warehouse/notifications',
  },
  {
    key: 'settings',
    label: 'الإعدادات',
    icon: <Settings size={20} aria-hidden="true" />,
    path: '/warehouse/settings',
  },
];

export function getNavItems(role: DemoRole): NavItem[] {
  return role === 'store' ? STORE_NAV : WAREHOUSE_NAV;
}

export function getNotificationCount(role: DemoRole): number {
  const nav = getNavItems(role);
  const notifications = nav.find((n) => n.key === 'notifications');
  return notifications?.badge ?? 0;
}
