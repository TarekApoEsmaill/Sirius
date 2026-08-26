import { Link } from 'react-router-dom';
import { ChevronLeft, Home } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { BreadcrumbItem } from '@/types';

// ============================================================
// SIRIUS — Breadcrumbs Component (RTL-aware)
// ============================================================

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  showHome?: boolean;
  className?: string;
}

export function Breadcrumbs({ items, showHome = false, className }: BreadcrumbsProps) {
  if (items.length === 0 && !showHome) return null;

  return (
    <nav aria-label="مسار التنقل" className={cn('flex items-center', className)}>
      <ol
        role="list"
        className="flex items-center flex-wrap gap-1 text-sm"
      >
        {showHome && (
          <>
            <li role="listitem">
              <Link
                to="/"
                aria-label="الرئيسية"
                className={cn(
                  'flex items-center text-[var(--text-muted)]',
                  'hover:text-[var(--text-primary)]',
                  'transition-colors duration-[120ms]',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4C8CE4]/40 rounded-sm'
                )}
              >
                <Home size={13} aria-hidden="true" />
              </Link>
            </li>
            {items.length > 0 && (
              <li aria-hidden="true" className="flex items-center text-[var(--text-disabled)]">
                {/* RTL: arrow points left to show hierarchy */}
                <ChevronLeft size={13} />
              </li>
            )}
          </>
        )}

        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={index} role="listitem" className="flex items-center gap-1">
              {isLast ? (
                <span
                  aria-current="page"
                  className="font-medium text-[var(--text-primary)] truncate max-w-[200px]"
                >
                  {item.label}
                </span>
              ) : item.path ? (
                <>
                  <Link
                    to={item.path}
                    className={cn(
                      'text-[var(--text-muted)] truncate max-w-[160px]',
                      'hover:text-[var(--text-primary)]',
                      'transition-colors duration-[120ms]',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4C8CE4]/40 rounded-sm'
                    )}
                  >
                    {item.label}
                  </Link>
                  <ChevronLeft
                    size={13}
                    className="text-[var(--text-disabled)] shrink-0"
                    aria-hidden="true"
                  />
                </>
              ) : (
                <>
                  <span className="text-[var(--text-muted)] truncate max-w-[160px]">
                    {item.label}
                  </span>
                  <ChevronLeft
                    size={13}
                    className="text-[var(--text-disabled)] shrink-0"
                    aria-hidden="true"
                  />
                </>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
