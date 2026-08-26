import { cn } from '@/lib/utils';
import { Button } from './Button';

// ============================================================
// SIRIUS — Empty State & Loading State Components
// ============================================================

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3 py-12 px-6 text-center',
        className
      )}
    >
      {icon && (
        <div
          aria-hidden="true"
          className="flex items-center justify-center w-16 h-16 rounded-2xl bg-[var(--bg-surface-3)] text-[var(--text-muted)] mb-1"
        >
          {icon}
        </div>
      )}
      <div className="flex flex-col gap-1.5">
        <p className="text-h4 font-semibold text-[var(--text-primary)]">{title}</p>
        {description && (
          <p className="text-sm text-[var(--text-muted)] max-w-xs mx-auto">{description}</p>
        )}
      </div>
      {action && (
        <Button
          variant="primary"
          size="sm"
          onClick={action.onClick}
          className="mt-1"
        >
          {action.label}
        </Button>
      )}
    </div>
  );
}

// Loading State
interface LoadingStateProps {
  message?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const spinnerSizes = {
  sm: 'h-5 w-5 border-2',
  md: 'h-8 w-8 border-2',
  lg: 'h-12 w-12 border-3',
};

export function LoadingState({
  message = 'جارٍ التحميل…',
  className,
  size = 'md',
}: LoadingStateProps) {
  return (
    <div
      role="status"
      aria-label={message}
      className={cn(
        'flex flex-col items-center justify-center gap-3 py-12',
        className
      )}
    >
      <div
        aria-hidden="true"
        className={cn(
          'rounded-full border-[var(--border-default)] border-t-[#4C8CE4] animate-spin',
          spinnerSizes[size]
        )}
      />
      {message && (
        <p className="text-sm text-[var(--text-muted)]">{message}</p>
      )}
    </div>
  );
}
