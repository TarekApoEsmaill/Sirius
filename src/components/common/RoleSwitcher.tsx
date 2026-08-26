import { useNavigate } from 'react-router-dom';
import { Store, Warehouse } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useRole } from '@/contexts/RoleContext';
import type { DemoRole } from '@/types';

// ============================================================
// SIRIUS — Demo Role Switcher
// ============================================================

interface RoleSwitcherProps {
  compact?: boolean;
  className?: string;
}

const ROLES: { value: DemoRole; label: string; icon: React.ReactNode; path: string }[] = [
  {
    value: 'store',
    label: 'محل',
    icon: <Store size={15} aria-hidden="true" />,
    path: '/store',
  },
  {
    value: 'warehouse',
    label: 'مستودع',
    icon: <Warehouse size={15} aria-hidden="true" />,
    path: '/warehouse',
  },
];

export function RoleSwitcher({ compact = false, className }: RoleSwitcherProps) {
  const { role, setRole } = useRole();
  const navigate = useNavigate();

  const handleSelect = (next: DemoRole, path: string) => {
    if (next === role) return;
    setRole(next);
    navigate(path, { replace: true });
  };

  if (compact) {
    return (
      <div
        role="radiogroup"
        aria-label="اختيار دور العرض"
        className={cn('flex gap-2', className)}
      >
        {ROLES.map((r) => (
          <button
            key={r.value}
            role="radio"
            aria-checked={role === r.value}
            onClick={() => handleSelect(r.value, r.path)}
            className={cn(
              'relative flex-1 flex items-center justify-center gap-2',
              'h-9 px-3 rounded-[var(--radius-md)] text-sm font-semibold',
              'transition-colors duration-[120ms]',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4C8CE4]/40',
              role === r.value
                ? 'bg-[#4C8CE4] text-white'
                : 'bg-[var(--interactive-secondary)] text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            )}
          >
            {r.icon}
            {r.label}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <p className="text-xs text-[var(--text-muted)] font-medium">تجربة النظام كـ</p>
      <div
        role="radiogroup"
        aria-label="اختيار دور العرض"
        className={cn(
          'flex gap-1 p-1 rounded-[var(--radius-md)]',
          'bg-[var(--bg-surface-3)] border border-[var(--border-subtle)]'
        )}
      >
        {ROLES.map((r) => (
          <button
            key={r.value}
            role="radio"
            aria-checked={role === r.value}
            onClick={() => handleSelect(r.value, r.path)}
            className={cn(
              'relative flex flex-1 items-center justify-center gap-1.5',
              'h-8 px-3 text-sm font-medium rounded-[var(--radius-sm)]',
              'transition-colors duration-[120ms]',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4C8CE4]/40',
              role === r.value
                ? 'text-[var(--text-primary)]'
                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            )}
          >
            {role === r.value && (
              <motion.div
                layoutId="role-indicator"
                className="absolute inset-0 rounded-[var(--radius-sm)] bg-[var(--bg-surface)] shadow-[var(--shadow-1)]"
                transition={{ duration: 0.18, ease: [0, 0, 0.2, 1] }}
              />
            )}
            <span className="relative z-10 flex items-center gap-1.5">
              {r.icon}
              {r.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
