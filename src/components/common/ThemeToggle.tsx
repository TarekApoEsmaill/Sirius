import { Sun, Moon, Monitor } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTheme } from '@/hooks/useTheme';
import { cn } from '@/lib/utils';
import type { Theme } from '@/types';

// ============================================================
// SIRIUS — Theme Toggle Component
// ============================================================

interface ThemeToggleProps {
  variant?: 'icon' | 'segmented';
  className?: string;
}

export function ThemeToggle({ variant = 'icon', className }: ThemeToggleProps) {
  const { resolvedTheme, theme, toggleTheme, setTheme } = useTheme();

  if (variant === 'segmented') {
    const options: { value: Theme; label: string; icon: React.ReactNode }[] = [
      { value: 'light',  label: 'فاتح',  icon: <Sun size={14} aria-hidden="true" /> },
      { value: 'dark',   label: 'داكن',  icon: <Moon size={14} aria-hidden="true" /> },
      { value: 'system', label: 'تلقائي', icon: <Monitor size={14} aria-hidden="true" /> },
    ];

    return (
      <div
        role="radiogroup"
        aria-label="اختيار المظهر"
        className={cn(
          'inline-flex gap-0.5 p-1 rounded-[var(--radius-md)]',
          'bg-[var(--bg-surface-3)] border border-[var(--border-subtle)]',
          className
        )}
      >
        {options.map((opt) => (
          <button
            key={opt.value}
            role="radio"
            aria-checked={theme === opt.value}
            onClick={() => setTheme(opt.value)}
            className={cn(
              'relative flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium',
              'rounded-[var(--radius-sm)] transition-colors duration-[120ms]',
              theme === opt.value
                ? 'text-[var(--text-primary)]'
                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            )}
          >
            {theme === opt.value && (
              <motion.div
                layoutId="theme-indicator"
                className="absolute inset-0 rounded-[var(--radius-sm)] bg-[var(--bg-surface)] shadow-[var(--shadow-1)]"
                transition={{ duration: 0.18, ease: [0, 0, 0.2, 1] }}
              />
            )}
            <span className="relative z-10 flex items-center gap-1.5">
              {opt.icon}
              {opt.label}
            </span>
          </button>
        ))}
      </div>
    );
  }

  // Icon toggle
  return (
    <button
      onClick={toggleTheme}
      aria-label={resolvedTheme === 'dark' ? 'التبديل إلى الوضع الفاتح' : 'التبديل إلى الوضع الداكن'}
      className={cn(
        'relative flex items-center justify-center w-9 h-9',
        'rounded-[var(--radius-md)]',
        'text-[var(--text-muted)] hover:text-[var(--text-primary)]',
        'hover:bg-[var(--interactive-secondary)]',
        'transition-colors duration-[120ms]',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4C8CE4]/40',
        className
      )}
    >
      <motion.div
        key={resolvedTheme}
        initial={{ rotate: -15, opacity: 0, scale: 0.8 }}
        animate={{ rotate: 0, opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }}
      >
        {resolvedTheme === 'dark' ? <Moon size={18} /> : <Sun size={18} />}
      </motion.div>
    </button>
  );
}
