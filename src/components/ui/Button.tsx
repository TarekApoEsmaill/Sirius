import { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ButtonType, Size, Variant } from '@/types';

// ============================================================
// SIRIUS — Button Component
// ============================================================

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  iconStart?: React.ReactNode;
  iconEnd?: React.ReactNode;
  fullWidth?: boolean;
  type?: ButtonType;
}

const variantClasses: Record<Variant, string> = {
  primary: [
    'bg-[#4C8CE4] text-white border border-[#4C8CE4]',
    'hover:bg-[#3B7BD4] hover:border-[#3B7BD4]',
    'active:bg-[#2E6CBD] active:border-[#2E6CBD]',
    'focus-visible:ring-2 focus-visible:ring-[#4C8CE4]/40',
    'disabled:bg-[#94A3B8] disabled:border-[#94A3B8] disabled:cursor-not-allowed',
    'shadow-[0_1px_3px_0_rgb(76_140_228/0.3)]',
    'hover:shadow-[0_2px_8px_0_rgb(76_140_228/0.35)]',
  ].join(' '),

  secondary: [
    'bg-[var(--interactive-secondary)] text-[var(--text-primary)]',
    'border border-[var(--border-default)]',
    'hover:bg-[var(--interactive-secondary-hover)] hover:border-[var(--border-strong)]',
    'active:bg-[var(--border-subtle)]',
    'disabled:opacity-50 disabled:cursor-not-allowed',
  ].join(' '),

  outline: [
    'bg-transparent text-[#4C8CE4]',
    'border border-[#4C8CE4]',
    'hover:bg-[#4C8CE4]/8 hover:border-[#3B7BD4]',
    'active:bg-[#4C8CE4]/15',
    'disabled:text-[var(--text-disabled)] disabled:border-[var(--border-subtle)] disabled:cursor-not-allowed',
  ].join(' '),

  ghost: [
    'bg-transparent text-[var(--text-secondary)]',
    'border border-transparent',
    'hover:bg-[var(--interactive-secondary)] hover:text-[var(--text-primary)]',
    'active:bg-[var(--border-subtle)]',
    'disabled:opacity-50 disabled:cursor-not-allowed',
  ].join(' '),

  success: [
    'bg-[#91D06C] text-[#1A3D08] border border-[#91D06C]',
    'hover:bg-[#7EC056] hover:border-[#7EC056]',
    'active:bg-[#6EB84D]',
    'disabled:bg-[#94A3B8] disabled:border-[#94A3B8] disabled:cursor-not-allowed',
  ].join(' '),

  destructive: [
    'bg-[#EF4444] text-white border border-[#EF4444]',
    'hover:bg-[#DC2626] hover:border-[#DC2626]',
    'active:bg-[#B91C1C]',
    'disabled:bg-[#94A3B8] disabled:border-[#94A3B8] disabled:cursor-not-allowed',
  ].join(' '),
};

const sizeClasses: Record<Size, string> = {
  xs: 'h-7 px-2.5 text-xs gap-1 rounded-[var(--radius-sm)]',
  sm: 'h-8 px-3 text-sm gap-1.5 rounded-[var(--radius-md)]',
  md: 'h-10 px-4 text-[0.9375rem] gap-2 rounded-[var(--radius-md)]',
  lg: 'h-11 px-5 text-[1rem] gap-2 rounded-[var(--radius-md)]',
  xl: 'h-12 px-6 text-[1.0625rem] gap-2.5 rounded-[var(--radius-lg)]',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      loading = false,
      iconStart,
      iconEnd,
      fullWidth = false,
      className,
      children,
      disabled,
      type = 'button',
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        type={type}
        disabled={isDisabled}
        aria-busy={loading}
        className={cn(
          'inline-flex items-center justify-center font-semibold',
          'transition-all duration-[120ms] ease-out',
          'select-none whitespace-nowrap',
          'focus-visible:outline-none',
          variantClasses[variant],
          sizeClasses[size],
          fullWidth && 'w-full',
          className
        )}
        {...props}
      >
        {loading ? (
          <Loader2
            className="animate-spin shrink-0"
            size={size === 'xs' ? 12 : size === 'sm' ? 14 : 16}
            aria-hidden="true"
          />
        ) : (
          iconStart && (
            <span className="shrink-0" aria-hidden="true">
              {iconStart}
            </span>
          )
        )}
        {children && <span>{children}</span>}
        {!loading && iconEnd && (
          <span className="shrink-0" aria-hidden="true">
            {iconEnd}
          </span>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

// Icon-only button
interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  'aria-label': string;
}

const iconSizeClasses: Record<Size, string> = {
  xs: 'h-7 w-7 rounded-[var(--radius-sm)]',
  sm: 'h-8 w-8 rounded-[var(--radius-md)]',
  md: 'h-10 w-10 rounded-[var(--radius-md)]',
  lg: 'h-11 w-11 rounded-[var(--radius-md)]',
  xl: 'h-12 w-12 rounded-[var(--radius-lg)]',
};

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ variant = 'ghost', size = 'md', loading = false, className, children, disabled, ...props }, ref) => {
    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        type="button"
        disabled={isDisabled}
        aria-busy={loading}
        className={cn(
          'inline-flex items-center justify-center',
          'transition-all duration-[120ms] ease-out',
          'focus-visible:outline-none',
          variantClasses[variant],
          iconSizeClasses[size],
          className
        )}
        {...props}
      >
        {loading ? (
          <Loader2 className="animate-spin" size={16} aria-hidden="true" />
        ) : (
          children
        )}
      </button>
    );
  }
);

IconButton.displayName = 'IconButton';
