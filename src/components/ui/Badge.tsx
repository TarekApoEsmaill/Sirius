import { cn } from '@/lib/utils';
import type { StatusType, Size } from '@/types';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Info,
  Circle,
} from 'lucide-react';

// ============================================================
// SIRIUS — Badge & StatusBadge Components
// ============================================================

type BadgeVariant = 'default' | 'brand' | 'success' | 'warning' | 'error' | 'info' | 'neutral';

interface BadgeProps {
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
  dot?: boolean;
  className?: string;
  children: React.ReactNode;
}

const badgeVariantClasses: Record<BadgeVariant, string> = {
  default:    'bg-[var(--interactive-secondary)] text-[var(--text-primary)] border border-[var(--border-subtle)]',
  brand:      'bg-[#4C8CE4]/10 text-[#4C8CE4] border border-[#4C8CE4]/20 dark:bg-[#4C8CE4]/15 dark:text-[#7FB3F5]',
  success:    'bg-[var(--status-success-bg)] text-[var(--status-success-text)] border border-[var(--status-success-border)]',
  warning:    'bg-[var(--status-warning-bg)] text-[var(--status-warning-text)] border border-[var(--status-warning-border)]',
  error:      'bg-[var(--status-error-bg)] text-[var(--status-error-text)] border border-[var(--status-error-border)]',
  info:       'bg-[var(--status-info-bg)] text-[var(--status-info-text)] border border-[var(--status-info-border)]',
  neutral:    'bg-[var(--status-neutral-bg)] text-[var(--status-neutral-text)] border border-[var(--status-neutral-border)]',
};

const badgeSizeClasses: Record<'sm' | 'md', string> = {
  sm: 'text-[0.6875rem] px-1.5 py-0.5 gap-1',
  md: 'text-xs px-2 py-0.5 gap-1.5',
};

const dotVariantClasses: Record<BadgeVariant, string> = {
  default: 'bg-[var(--text-muted)]',
  brand:   'bg-[#4C8CE4]',
  success: 'bg-[#91D06C]',
  warning: 'bg-[#E8DD00]',
  error:   'bg-[#EF4444]',
  info:    'bg-[#4C8CE4]',
  neutral: 'bg-[var(--border-strong)]',
};

export function Badge({
  variant = 'default',
  size = 'md',
  dot = false,
  className,
  children,
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center font-medium rounded-[var(--radius-xs)]',
        badgeVariantClasses[variant],
        badgeSizeClasses[size],
        className
      )}
    >
      {dot && (
        <span
          aria-hidden="true"
          className={cn('shrink-0 rounded-full h-1.5 w-1.5', dotVariantClasses[variant])}
        />
      )}
      {children}
    </span>
  );
}

// --- Status Badge ---
interface StatusBadgeProps {
  status: StatusType;
  label: string;
  size?: 'sm' | 'md';
  className?: string;
  showIcon?: boolean;
}

const statusIcons: Record<StatusType, React.ReactNode> = {
  success: <CheckCircle2 size={12} aria-hidden="true" />,
  warning: <AlertTriangle size={12} aria-hidden="true" />,
  error:   <XCircle size={12} aria-hidden="true" />,
  info:    <Info size={12} aria-hidden="true" />,
  neutral: <Circle size={12} aria-hidden="true" />,
};

const statusToVariant: Record<StatusType, BadgeVariant> = {
  success: 'success',
  warning: 'warning',
  error:   'error',
  info:    'info',
  neutral: 'neutral',
};

const statusLabels: Record<StatusType, string> = {
  success: 'نجاح',
  warning: 'تحذير',
  error:   'خطأ',
  info:    'معلومة',
  neutral: 'محايد',
};

export function StatusBadge({
  status,
  label,
  size = 'md',
  className,
  showIcon = true,
}: StatusBadgeProps) {
  return (
    <Badge
      variant={statusToVariant[status]}
      size={size}
      className={className}
    >
      {showIcon && (
        <span
          aria-hidden="true"
          className="shrink-0"
          title={statusLabels[status]}
        >
          {statusIcons[status]}
        </span>
      )}
      <span>{label}</span>
    </Badge>
  );
}

// --- Count Badge (notification dot) ---
interface CountBadgeProps {
  count: number;
  max?: number;
  className?: string;
}

export function CountBadge({ count, max = 99, className }: CountBadgeProps) {
  const display = count > max ? `${max}+` : String(count);
  return (
    <span
      aria-label={`${count} إشعار`}
      className={cn(
        'inline-flex items-center justify-center',
        'min-w-[1.125rem] h-[1.125rem] px-1',
        'text-[0.625rem] font-bold',
        'bg-[#EF4444] text-white rounded-full',
        className
      )}
    >
      {display}
    </span>
  );
}

// Keep Size import usage to avoid unused warning
export type { Size };
