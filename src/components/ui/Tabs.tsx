import { useState } from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

// ============================================================
// SIRIUS — Tabs Component
// ============================================================

interface Tab {
  key: string;
  label: string;
  icon?: React.ReactNode;
  count?: number;
  disabled?: boolean;
}

interface TabsProps {
  tabs: Tab[];
  defaultTab?: string;
  activeTab?: string;
  onTabChange?: (key: string) => void;
  variant?: 'line' | 'pill';
  className?: string;
  children?: React.ReactNode;
}

export function Tabs({
  tabs,
  defaultTab,
  activeTab: controlledActive,
  onTabChange,
  variant = 'line',
  className,
}: TabsProps) {
  const [internalActive, setInternalActive] = useState(defaultTab ?? tabs[0]?.key ?? '');
  const active = controlledActive ?? internalActive;

  const handleSelect = (key: string, disabled?: boolean) => {
    if (disabled) return;
    setInternalActive(key);
    onTabChange?.(key);
  };

  if (variant === 'pill') {
    return (
      <div
        role="tablist"
        aria-orientation="horizontal"
        className={cn(
          'inline-flex gap-1 p-1 rounded-[var(--radius-md)]',
          'bg-[var(--bg-surface-3)] border border-[var(--border-subtle)]',
          className
        )}
      >
        {tabs.map((tab) => (
          <button
            key={tab.key}
            role="tab"
            aria-selected={active === tab.key}
            aria-disabled={tab.disabled}
            disabled={tab.disabled}
            onClick={() => handleSelect(tab.key, tab.disabled)}
            className={cn(
              'relative flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium',
              'rounded-[var(--radius-sm)] transition-colors duration-[120ms]',
              active === tab.key
                ? 'bg-[var(--bg-surface)] text-[var(--text-primary)] shadow-[var(--shadow-1)]'
                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]',
              tab.disabled && 'opacity-40 cursor-not-allowed'
            )}
          >
            {tab.icon && <span aria-hidden="true">{tab.icon}</span>}
            {tab.label}
            {tab.count !== undefined && (
              <span className="text-xs bg-[var(--border-subtle)] text-[var(--text-muted)] rounded-full px-1.5 py-0.5">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>
    );
  }

  // Line variant
  return (
    <div
      role="tablist"
      aria-orientation="horizontal"
      className={cn(
        'relative flex gap-0 border-b border-[var(--border-subtle)]',
        className
      )}
    >
      {tabs.map((tab) => (
        <button
          key={tab.key}
          role="tab"
          aria-selected={active === tab.key}
          aria-disabled={tab.disabled}
          disabled={tab.disabled}
          onClick={() => handleSelect(tab.key, tab.disabled)}
          className={cn(
            'relative flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium',
            'transition-colors duration-[120ms]',
            'border-b-2 -mb-px',
            active === tab.key
              ? 'border-[#4C8CE4] text-[#4C8CE4]'
              : 'border-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-[var(--border-default)]',
            tab.disabled && 'opacity-40 cursor-not-allowed'
          )}
        >
          {tab.icon && <span aria-hidden="true">{tab.icon}</span>}
          {tab.label}
          {tab.count !== undefined && (
            <span
              className={cn(
                'text-xs rounded-full px-1.5 py-0.5',
                active === tab.key
                  ? 'bg-[#4C8CE4]/10 text-[#4C8CE4]'
                  : 'bg-[var(--border-subtle)] text-[var(--text-muted)]'
              )}
            >
              {tab.count}
            </span>
          )}

          {active === tab.key && (
            <motion.div
              layoutId="tab-indicator"
              className="absolute bottom-[-1px] start-0 end-0 h-0.5 bg-[#4C8CE4] rounded-t-full"
              transition={{ duration: 0.2, ease: [0, 0, 0.2, 1] }}
            />
          )}
        </button>
      ))}
    </div>
  );
}
