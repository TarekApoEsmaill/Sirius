import { cn } from '@/lib/utils';

// ============================================================
// SIRIUS — Divider Component
// ============================================================

interface DividerProps {
  orientation?: 'horizontal' | 'vertical';
  label?: string;
  className?: string;
}

export function Divider({ orientation = 'horizontal', label, className }: DividerProps) {
  if (orientation === 'vertical') {
    return (
      <div
        role="separator"
        aria-orientation="vertical"
        className={cn('w-px bg-[var(--border-subtle)] self-stretch', className)}
      />
    );
  }

  if (label) {
    return (
      <div
        role="separator"
        className={cn('flex items-center gap-3', className)}
      >
        <div className="flex-1 h-px bg-[var(--border-subtle)]" />
        <span className="text-xs text-[var(--text-muted)] font-medium whitespace-nowrap">
          {label}
        </span>
        <div className="flex-1 h-px bg-[var(--border-subtle)]" />
      </div>
    );
  }

  return (
    <hr
      role="separator"
      className={cn('border-none h-px bg-[var(--border-subtle)] my-0', className)}
    />
  );
}
