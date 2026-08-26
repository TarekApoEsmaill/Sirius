import { forwardRef } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================================
// SIRIUS — Select Component
// ============================================================

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  helperText?: string;
  errorText?: string;
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      helperText,
      errorText,
      placeholder,
      className,
      id,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const hasError = Boolean(errorText);
    const selectId = id ?? `select-${Math.random().toString(36).slice(2, 7)}`;

    return (
      <div className={cn('flex flex-col gap-1.5', className)}>
        {label && (
          <label
            htmlFor={selectId}
            className={cn(
              'text-sm font-medium text-[var(--text-primary)]',
              disabled && 'text-[var(--text-disabled)]'
            )}
          >
            {label}
          </label>
        )}

        <div className="relative flex items-center">
          <select
            ref={ref}
            id={selectId}
            disabled={disabled}
            aria-invalid={hasError}
            aria-describedby={
              hasError
                ? `${selectId}-error`
                : helperText
                ? `${selectId}-helper`
                : undefined
            }
            className={cn(
              'w-full appearance-none',
              'bg-[var(--bg-surface)] text-[var(--text-primary)]',
              'border rounded-[var(--radius-sm)]',
              'h-10 ps-3 pe-9 text-[0.9375rem]',
              'transition-colors duration-[120ms]',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4C8CE4]/40',
              hasError
                ? 'border-[#EF4444] focus:border-[#EF4444]'
                : 'border-[var(--border-default)] focus:border-[#4C8CE4]',
              disabled && 'bg-[var(--bg-surface-3)] text-[var(--text-disabled)] cursor-not-allowed',
              'cursor-pointer'
            )}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {children}
          </select>

          <ChevronDown
            size={16}
            className="absolute end-3 text-[var(--text-muted)] pointer-events-none"
            aria-hidden="true"
          />
        </div>

        {hasError && (
          <p
            id={`${selectId}-error`}
            className="text-xs text-[#EF4444]"
            role="alert"
          >
            {errorText}
          </p>
        )}

        {helperText && !hasError && (
          <p id={`${selectId}-helper`} className="text-xs text-[var(--text-muted)]">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';
