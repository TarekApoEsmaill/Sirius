import { forwardRef } from 'react';
import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================================
// SIRIUS — Input Components
// ============================================================

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  errorText?: string;
  iconStart?: React.ReactNode;
  iconEnd?: React.ReactNode;
  onClear?: () => void;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      helperText,
      errorText,
      iconStart,
      iconEnd,
      onClear,
      className,
      id,
      disabled,
      ...props
    },
    ref
  ) => {
    const hasError = Boolean(errorText);
    const inputId = id ?? `input-${Math.random().toString(36).slice(2, 7)}`;

    return (
      <div className={cn('flex flex-col gap-1.5', className)}>
        {label && (
          <label
            htmlFor={inputId}
            className={cn(
              'text-[var(--text-label)] text-sm font-medium',
              disabled && 'text-[var(--text-disabled)]'
            )}
          >
            {label}
          </label>
        )}

        <div className="relative flex items-center">
          {iconStart && (
            <span
              className="absolute end-3 flex items-center pointer-events-none text-[var(--text-muted)]"
              aria-hidden="true"
            >
              {iconStart}
            </span>
          )}

          <input
            ref={ref}
            id={inputId}
            disabled={disabled}
            aria-invalid={hasError}
            aria-describedby={
              hasError
                ? `${inputId}-error`
                : helperText
                ? `${inputId}-helper`
                : undefined
            }
            className={cn(
              'w-full bg-[var(--bg-surface)] text-[var(--text-primary)]',
              'border rounded-[var(--radius-sm)]',
              'h-10 px-3 text-[0.9375rem]',
              'placeholder:text-[var(--text-disabled)]',
              'transition-colors duration-[120ms]',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4C8CE4]/40',
              // Border states
              hasError
                ? 'border-[#EF4444] focus:border-[#EF4444]'
                : 'border-[var(--border-default)] focus:border-[#4C8CE4]',
              // Disabled
              disabled && 'bg-[var(--bg-surface-3)] text-[var(--text-disabled)] cursor-not-allowed',
              // Padding adjustments for icons (RTL — iconStart is on the right end)
              iconStart ? 'pe-10' : undefined,
              (iconEnd || onClear) ? 'ps-10' : undefined
            )}
            {...props}
          />

          {onClear && props.value && (
            <button
              type="button"
              onClick={onClear}
              aria-label="مسح النص"
              className={cn(
                'absolute start-3 flex items-center justify-center',
                'text-[var(--text-muted)] hover:text-[var(--text-primary)]',
                'transition-colors duration-[120ms]'
              )}
            >
              <X size={14} />
            </button>
          )}

          {iconEnd && !onClear && (
            <span
              className="absolute start-3 flex items-center pointer-events-none text-[var(--text-muted)]"
              aria-hidden="true"
            >
              {iconEnd}
            </span>
          )}
        </div>

        {hasError && (
          <p
            id={`${inputId}-error`}
            className="text-xs text-[#EF4444]"
            role="alert"
          >
            {errorText}
          </p>
        )}

        {helperText && !hasError && (
          <p
            id={`${inputId}-helper`}
            className="text-xs text-[var(--text-muted)]"
          >
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

// --- Search Input ---
interface SearchInputProps extends Omit<InputProps, 'iconStart' | 'type'> {
  onClear?: () => void;
}

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  ({ className, onClear, ...props }, ref) => {
    return (
      <Input
        ref={ref}
        type="search"
        iconStart={<Search size={16} />}
        onClear={onClear}
        className={className}
        {...props}
      />
    );
  }
);

SearchInput.displayName = 'SearchInput';
