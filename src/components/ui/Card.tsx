import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

// ============================================================
// SIRIUS — Card Component
// ============================================================

type CardVariant = 'default' | 'interactive' | 'selected' | 'elevated';

interface CardProps {
  variant?: CardVariant;
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
  selected?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  as?: 'div' | 'article' | 'section' | 'li';
}

const paddingClasses = {
  none: '',
  sm:   'p-3',
  md:   'p-4',
  lg:   'p-6',
};

const variantClasses: Record<CardVariant, string> = {
  default: [
    'bg-[var(--bg-surface)]',
    'border border-[var(--border-subtle)]',
    'rounded-[var(--radius-lg)]',
    'shadow-[var(--shadow-card)]',
  ].join(' '),

  interactive: [
    'bg-[var(--bg-surface)]',
    'border border-[var(--border-subtle)]',
    'rounded-[var(--radius-lg)]',
    'shadow-[var(--shadow-card)]',
    'cursor-pointer',
    'hover:border-[var(--border-default)]',
    'hover:-translate-y-px',
    'hover:shadow-[0_4px_12px_0_rgb(0_0_0/0.08)]',
    'transition-all duration-[220ms] ease-out',
  ].join(' '),

  selected: [
    'bg-[var(--bg-surface)]',
    'border-2 border-[#4C8CE4]',
    'rounded-[var(--radius-lg)]',
    'shadow-[0_0_0_3px_rgb(76_140_228/0.12)]',
  ].join(' '),

  elevated: [
    'bg-[var(--bg-surface)]',
    'border border-[var(--border-default)]',
    'rounded-[var(--radius-lg)]',
    'shadow-[0_4px_12px_0_rgb(0_0_0/0.1)]',
  ].join(' '),
};

export function Card({
  variant = 'default',
  className,
  children,
  onClick,
  selected,
  padding = 'md',
  as: Tag = 'div',
}: CardProps) {
  const appliedVariant = selected ? 'selected' : variant;

  if (variant === 'interactive' || onClick) {
    return (
      <motion.div
        whileHover={{ y: -1 }}
        transition={{ duration: 0.18, ease: 'easeOut' }}
        className={cn(variantClasses[appliedVariant], paddingClasses[padding], className)}
        onClick={onClick}
        role={onClick ? 'button' : undefined}
        tabIndex={onClick ? 0 : undefined}
        onKeyDown={
          onClick
            ? (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onClick();
                }
              }
            : undefined
        }
      >
        {children}
      </motion.div>
    );
  }

  return (
    <Tag
      className={cn(variantClasses[appliedVariant], paddingClasses[padding], className)}
    >
      {children}
    </Tag>
  );
}

// --- Card sub-components ---
export function CardHeader({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={cn('flex items-center justify-between gap-3 mb-4', className)}>
      {children}
    </div>
  );
}

export function CardTitle({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <h3 className={cn('text-[0.9375rem] font-semibold text-[var(--text-primary)]', className)}>
      {children}
    </h3>
  );
}

export function CardBody({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={cn('text-[var(--text-secondary)]', className)}>
      {children}
    </div>
  );
}

export function CardFooter({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={cn('flex items-center gap-3 mt-4 pt-4 border-t border-[var(--border-subtle)]', className)}>
      {children}
    </div>
  );
}
