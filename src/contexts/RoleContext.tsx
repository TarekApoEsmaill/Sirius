import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { DemoRole, DemoIdentity } from '@/types';

// ============================================================
// SIRIUS — Demo Role Context
// ============================================================

interface RoleContextValue {
  role: DemoRole;
  setRole: (role: DemoRole) => void;
  identity: DemoIdentity;
}

const ROLE_KEY = 'sirius-role';

const IDENTITIES: Record<DemoRole, DemoIdentity> = {
  store: {
    name: 'متجر النور',
    subtitle: 'محل تجزئة',
    role: 'store',
  },
  warehouse: {
    name: 'مستودع السويداء المركزي',
    subtitle: 'مستودع',
    role: 'warehouse',
  },
};

export const RoleContext = createContext<RoleContextValue | null>(null);

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const [role, setRoleState] = useState<DemoRole>(() => {
    try {
      const stored = localStorage.getItem(ROLE_KEY);
      if (stored === 'store' || stored === 'warehouse') return stored;
    } catch { /* ignore */ }
    return 'store';
  });

  const setRole = useCallback((next: DemoRole) => {
    setRoleState(next);
    try {
      localStorage.setItem(ROLE_KEY, next);
    } catch { /* ignore */ }
  }, []);

  const identity = useMemo(() => IDENTITIES[role], [role]);

  const value = useMemo(() => ({ role, setRole, identity }), [role, setRole, identity]);

  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
}

export function useRole() {
  const ctx = useContext(RoleContext);
  if (!ctx) throw new Error('useRole must be used inside RoleProvider');
  return ctx;
}
