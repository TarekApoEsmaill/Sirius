import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

// ============================================================
// SIRIUS — Radio Component
// ============================================================

interface RadioProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  helperText?: string;
}

export const Radio = forwardRef<HTMLInputElement, RadioProps>(
  ({ label, helperText, className, id, disabled, ...props }, ref) => {
    const radioId = id ?? `radio-${Math.random().toString(36).slice(2, 7)}`;

    return (
      <div className={cn('flex items-start gap-2.5', className)}>
        <div className="relative flex items-center justify-center mt-0.5">
          <input
            ref={ref}
            type="radio"
            id={radioId}
            disabled={disabled}
            className="sr-only peer"
            {...props}
          />
          <div
            aria-hidden="true"
            className={cn(
              'h-4.5 w-4.5 rounded-full border-2',
              'transition-all duration-[120ms]',
              'flex items-center justify-center shrink-0',
              'peer-focus-visible:ring-2 peer-focus-visible:ring-[#4C8CE4]/40',
              props.checked
                ? 'border-[#4C8CE4]'
                : 'border-[var(--border-default)] bg-[var(--bg-surface)]',
              disabled && 'opacity-50 cursor-not-allowed'
            )}
          >
            {props.checked && (
              <div className="h-2 w-2 rounded-full bg-[#4C8CE4]" />
            )}
          </div>
        </div>

        {(label || helperText) && (
          <label
            htmlFor={radioId}
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

Radio.displayName = 'Radio';
