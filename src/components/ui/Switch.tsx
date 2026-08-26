import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

// ============================================================
// SIRIUS — Switch Component
// ============================================================

interface SwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  label?: string;
  helperText?: string;
  size?: 'sm' | 'md';
}

export const Switch = forwardRef<HTMLInputElement, SwitchProps>(
  ({ label, helperText, size = 'md', className, id, disabled, checked, onChange, ...props }, ref) => {
    const switchId = id ?? `switch-${Math.random().toString(36).slice(2, 7)}`;

    const trackSize = size === 'sm' ? 'w-8 h-4.5' : 'w-10 h-6';
    const thumbSize = size === 'sm' ? 'h-3 w-3' : 'h-4 w-4';

    return (
      <div className={cn('flex items-start gap-2.5', className)}>
        <div className="relative mt-0.5">
          <input
            ref={ref}
            type="checkbox"
            role="switch"
            id={switchId}
            disabled={disabled}
            checked={checked}
            onChange={onChange}
            className="sr-only peer"
            aria-checked={checked}
            {...props}
          />
          <label
            htmlFor={switchId}
            aria-hidden="true"
            className={cn(
              'relative flex items-center rounded-full cursor-pointer',
              'transition-colors duration-[220ms]',
              trackSize,
              checked ? 'bg-[#4C8CE4]' : 'bg-[var(--border-default)]',
              disabled && 'opacity-50 cursor-not-allowed',
              'peer-focus-visible:ring-2 peer-focus-visible:ring-[#4C8CE4]/40'
            )}
          >
            <span
              className={cn(
                'absolute start-auto rounded-full bg-white shadow-sm',
                'transition-transform duration-[220ms] ease-out',
                thumbSize,
                checked ? 'end-0.5' : 'end-auto start-0.5'
              )}
            />
          </label>
        </div>

        {(label || helperText) && (
          <label
            htmlFor={switchId}
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

Switch.displayName = 'Switch';
