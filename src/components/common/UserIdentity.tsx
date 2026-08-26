import { Store, Warehouse } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRole } from '@/contexts/RoleContext';

// ============================================================
// SIRIUS — User / Organization Identity Component
// ============================================================

interface UserIdentityProps {
  compact?: boolean;
  className?: string;
}

export function UserIdentity({ compact = false, className }: UserIdentityProps) {
  const { identity } = useRole();

  const Icon = identity.role === 'store' ? Store : Warehouse;
  const bgColor = identity.role === 'store'
    ? 'bg-[#4C8CE4]/10 text-[#4C8CE4]'
    : 'bg-[#406093]/10 text-[#406093]';

  if (compact) {
    return (
      <div className={cn('flex items-center gap-2.5', className)}>
        <div className={cn('flex items-center justify-center w-8 h-8 rounded-[var(--radius-md)] shrink-0', bgColor)}>
          <Icon size={15} aria-hidden="true" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-[var(--text-primary)] truncate leading-tight">
            {identity.name}
          </p>
          <p className="text-xs text-[var(--text-muted)] leading-tight">{identity.subtitle}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <div className={cn('flex items-center justify-center w-9 h-9 rounded-[var(--radius-md)] shrink-0', bgColor)}>
        <Icon size={17} aria-hidden="true" />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-[var(--text-primary)] truncate leading-tight">
          {identity.name}
        </p>
        <p className="text-xs text-[var(--text-muted)] leading-tight">{identity.subtitle}</p>
      </div>
    </div>
  );
}
