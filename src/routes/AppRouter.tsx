import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useRole } from '@/contexts/RoleContext';
import { AppShell } from '@/components/layout/AppShell';

// Store pages
import { StoreDashboard } from '@/pages/store/StoreDashboard';
import { StoreWarehouses } from '@/pages/store/StoreWarehouses';
import { StoreProducts } from '@/pages/store/StoreProducts';
import { StoreCart } from '@/pages/store/StoreCart';
import { StoreOrders } from '@/pages/store/StoreOrders';
import { StoreOrderDetail } from '@/pages/store/StoreOrderDetail';
import { StoreFavorites } from '@/pages/store/StoreFavorites';
import { StoreNotifications } from '@/pages/store/StoreNotifications';
import { StoreSettings } from '@/pages/store/StoreSettings';

// Warehouse pages
import { WarehouseDashboard } from '@/pages/warehouse/WarehouseDashboard';
import { WarehouseProducts } from '@/pages/warehouse/WarehouseProducts';
import { WarehouseInventory } from '@/pages/warehouse/WarehouseInventory';
import { WarehouseOrders } from '@/pages/warehouse/WarehouseOrders';
import { WarehouseOrderDetail } from '@/pages/warehouse/WarehouseOrderDetail';
import { WarehouseStores } from '@/pages/warehouse/WarehouseStores';
import { WarehouseNotifications } from '@/pages/warehouse/WarehouseNotifications';
import { WarehouseSettings } from '@/pages/warehouse/WarehouseSettings';

import { NotFound } from '@/pages/NotFound';

// ============================================================
// SIRIUS — Page Transition Wrapper
// ============================================================

const pageTransition = {
  initial: { opacity: 0, y: 6 },
  animate: { opacity: 1, y: 0 },
  exit:    { opacity: 0, y: -4 },
  transition: {
    duration: 0.2,
    ease: [0, 0, 0.2, 1] as [number, number, number, number],
  },
};

function PageWrapper({ children }: { children: React.ReactNode }) {
  return (
    <motion.div {...pageTransition}>
      {children}
    </motion.div>
  );
}

// ============================================================
// SIRIUS — Role Guard
// If role=store tries to access /warehouse/* → redirect to /store
// If role=warehouse tries to access /store/* → redirect to /warehouse
// ============================================================

function RoleGuard({
  requiredRole,
  children,
}: {
  requiredRole: 'store' | 'warehouse';
  children: React.ReactNode;
}) {
  const { role } = useRole();

  if (role !== requiredRole) {
    const redirect = role === 'store' ? '/store' : '/warehouse';
    return <Navigate to={redirect} replace />;
  }

  return <>{children}</>;
}

// ============================================================
// SIRIUS — Main Router
// ============================================================

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <Routes location={location} key={location.pathname}>
        {/* Root redirect */}
        <Route path="/" element={<RootRedirect />} />

        {/* ── STORE ROUTES ── */}
        <Route
          path="/store"
          element={
            <RoleGuard requiredRole="store">
              <PageWrapper><StoreDashboard /></PageWrapper>
            </RoleGuard>
          }
        />
        <Route
          path="/store/warehouses"
          element={
            <RoleGuard requiredRole="store">
              <PageWrapper><StoreWarehouses /></PageWrapper>
            </RoleGuard>
          }
        />
        <Route
          path="/store/products"
          element={
            <RoleGuard requiredRole="store">
              <PageWrapper><StoreProducts /></PageWrapper>
            </RoleGuard>
          }
        />
        <Route
          path="/store/cart"
          element={
            <RoleGuard requiredRole="store">
              <PageWrapper><StoreCart /></PageWrapper>
            </RoleGuard>
          }
        />
        <Route
          path="/store/orders"
          element={
            <RoleGuard requiredRole="store">
              <PageWrapper><StoreOrders /></PageWrapper>
            </RoleGuard>
          }
        />
        <Route
          path="/store/orders/:id"
          element={
            <RoleGuard requiredRole="store">
              <PageWrapper><StoreOrderDetail /></PageWrapper>
            </RoleGuard>
          }
        />
        <Route
          path="/store/favorites"
          element={
            <RoleGuard requiredRole="store">
              <PageWrapper><StoreFavorites /></PageWrapper>
            </RoleGuard>
          }
        />
        <Route
          path="/store/notifications"
          element={
            <RoleGuard requiredRole="store">
              <PageWrapper><StoreNotifications /></PageWrapper>
            </RoleGuard>
          }
        />
        <Route
          path="/store/settings"
          element={
            <RoleGuard requiredRole="store">
              <PageWrapper><StoreSettings /></PageWrapper>
            </RoleGuard>
          }
        />

        {/* ── WAREHOUSE ROUTES ── */}
        <Route
          path="/warehouse"
          element={
            <RoleGuard requiredRole="warehouse">
              <PageWrapper><WarehouseDashboard /></PageWrapper>
            </RoleGuard>
          }
        />
        <Route
          path="/warehouse/products"
          element={
            <RoleGuard requiredRole="warehouse">
              <PageWrapper><WarehouseProducts /></PageWrapper>
            </RoleGuard>
          }
        />
        <Route
          path="/warehouse/inventory"
          element={
            <RoleGuard requiredRole="warehouse">
              <PageWrapper><WarehouseInventory /></PageWrapper>
            </RoleGuard>
          }
        />
        <Route
          path="/warehouse/orders"
          element={
            <RoleGuard requiredRole="warehouse">
              <PageWrapper><WarehouseOrders /></PageWrapper>
            </RoleGuard>
          }
        />
        <Route
          path="/warehouse/orders/:id"
          element={
            <RoleGuard requiredRole="warehouse">
              <PageWrapper><WarehouseOrderDetail /></PageWrapper>
            </RoleGuard>
          }
        />
        <Route
          path="/warehouse/stores"
          element={
            <RoleGuard requiredRole="warehouse">
              <PageWrapper><WarehouseStores /></PageWrapper>
            </RoleGuard>
          }
        />
        <Route
          path="/warehouse/notifications"
          element={
            <RoleGuard requiredRole="warehouse">
              <PageWrapper><WarehouseNotifications /></PageWrapper>
            </RoleGuard>
          }
        />
        <Route
          path="/warehouse/settings"
          element={
            <RoleGuard requiredRole="warehouse">
              <PageWrapper><WarehouseSettings /></PageWrapper>
            </RoleGuard>
          }
        />

        {/* 404 */}
        <Route path="*" element={<PageWrapper><NotFound /></PageWrapper>} />
      </Routes>
    </AnimatePresence>
  );
}

function RootRedirect() {
  const { role } = useRole();
  return <Navigate to={role === 'store' ? '/store' : '/warehouse'} replace />;
}

export function AppRouter() {
  return (
    <AppShell>
      <AnimatedRoutes />
    </AppShell>
  );
}
