import { forwardRef } from 'react';
import { Check, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================================
// SIRIUS — Checkbox Component
// ============================================================

interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  helperText?: string;
  indeterminate?: boolean;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, helperText, indeterminate = false, className, id, disabled, ...props }, ref) => {
    const checkId = id ?? `checkbox-${Math.random().toString(36).slice(2, 7)}`;

    return (
      <div className={cn('flex items-start gap-2.5', className)}>
        <div className="relative flex items-center justify-center mt-0.5">
          <input
            ref={ref}
            type="checkbox"
            id={checkId}
            disabled={disabled}
            className="sr-only peer"
            aria-checked={indeterminate ? 'mixed' : undefined}
            {...props}
          />
          <div
            aria-hidden="true"
            className={cn(
              'h-4.5 w-4.5 rounded-[var(--radius-xs)] border-2',
              'transition-all duration-[120ms]',
              'flex items-center justify-center shrink-0',
              'peer-focus-visible:ring-2 peer-focus-visible:ring-[#4C8CE4]/40',
              props.checked || indeterminate
                ? 'bg-[#4C8CE4] border-[#4C8CE4]'
                : 'bg-[var(--bg-surface)] border-[var(--border-default)]',
              disabled && 'opacity-50 cursor-not-allowed'
            )}
          >
            {indeterminate ? (
              <Minus size={11} className="text-white stroke-[3]" />
            ) : props.checked ? (
              <Check size={11} className="text-white stroke-[3]" />
            ) : null}
          </div>
        </div>

        {(label || helperText) && (
          <label
            htmlFor={checkId}
            className={cn(
              'flex flex-col gap-0.5 cursor-pointer',
              disabled && 'cursor-not-allowed opacity-50'
            )}
          >
            {label && (
              <span className="text-sm font-medium text-[var(--text-primary)]">{label}</span>
            )}
            {helperText && (
              <span className="text-xs text-[var(--text-muted)]">{helperText}</span>
            )}
          </label>
        )}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';
