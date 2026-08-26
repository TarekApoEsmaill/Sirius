import { useEffect, useRef, useState, useCallback } from 'react';
import { cn } from '@/lib/utils';

// ============================================================
// SIRIUS — Dropdown Component
// ============================================================

interface DropdownItem {
  key: string;
  label: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  danger?: boolean;
  dividerAfter?: boolean;
}

interface DropdownProps {
  trigger: React.ReactElement;
  items: DropdownItem[];
  onSelect?: (key: string) => void;
  align?: 'start' | 'end';
  width?: number | 'auto';
  className?: string;
}

export function Dropdown({
  trigger,
  items,
  onSelect,
  align = 'end',
  width = 200,
  className,
}: DropdownProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    function handler(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        close();
      }
    }
    function keyHandler(e: KeyboardEvent) {
      if (e.key === 'Escape') close();
    }
    document.addEventListener('mousedown', handler);
    document.addEventListener('keydown', keyHandler);
    return () => {
      document.removeEventListener('mousedown', handler);
      document.removeEventListener('keydown', keyHandler);
    };
  }, [open, close]);

  const handleSelect = useCallback(
    (key: string, disabled?: boolean) => {
      if (disabled) return;
      onSelect?.(key);
      close();
    },
    [onSelect, close]
  );

  return (
    <div ref={containerRef} className={cn('relative inline-block', className)}>
      <div onClick={() => setOpen((v) => !v)} style={{ display: 'contents' }}>
        {trigger}
      </div>

      {open && (
        <div
          role="menu"
          aria-orientation="vertical"
          style={{
            width: width === 'auto' ? 'auto' : width,
            zIndex: 100,
          }}
          className={cn(
            'absolute mt-1 py-1',
            'bg-[var(--bg-surface)] border border-[var(--border-default)]',
            'rounded-[var(--radius-md)] shadow-[var(--shadow-dropdown)]',
            align === 'end' ? 'end-0' : 'start-0',
            'min-w-[160px]'
          )}
        >
          {items.map((item) => (
            <div key={item.key}>
              <button
                role="menuitem"
                disabled={item.disabled}
                onClick={() => handleSelect(item.key, item.disabled)}
                className={cn(
                  'w-full flex items-center gap-2.5 px-3 py-2 text-sm text-start',
                  'transition-colors duration-[120ms]',
                  item.danger
                    ? 'text-[#EF4444] hover:bg-[#FEF2F2] dark:hover:bg-[#EF4444]/10'
                    : 'text-[var(--text-primary)] hover:bg-[var(--interactive-secondary)]',
                  item.disabled && 'opacity-40 cursor-not-allowed pointer-events-none'
                )}
              >
                {item.icon && (
                  <span className="shrink-0 text-[var(--text-muted)]" aria-hidden="true">
                    {item.icon}
                  </span>
                )}
                <span>{item.label}</span>
              </button>

              {item.dividerAfter && (
                <div className="my-1 h-px bg-[var(--border-subtle)]" role="separator" />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
