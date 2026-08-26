import { cn } from '@/lib/utils';
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';

// ============================================================
// SIRIUS — Table Foundation
// ============================================================

interface Column<T> {
  key: keyof T | string;
  header: string;
  sortable?: boolean;
  width?: string;
  align?: 'start' | 'center' | 'end';
  render?: (value: unknown, row: T) => React.ReactNode;
}

type SortDirection = 'asc' | 'desc' | null;

interface TableProps<T extends Record<string, unknown>> {
  columns: Column<T>[];
  data: T[];
  sortKey?: string;
  sortDirection?: SortDirection;
  onSort?: (key: string) => void;
  loading?: boolean;
  emptyMessage?: string;
  className?: string;
  rowKey?: keyof T;
}

const alignClasses = {
  start:  'text-start',
  center: 'text-center',
  end:    'text-end',
};

export function Table<T extends Record<string, unknown>>({
  columns,
  data,
  sortKey,
  sortDirection,
  onSort,
  loading = false,
  emptyMessage = 'لا توجد بيانات',
  className,
  rowKey,
}: TableProps<T>) {
  return (
    <div
      className={cn(
        'w-full overflow-x-auto rounded-[var(--radius-lg)]',
        'border border-[var(--border-subtle)]',
        className
      )}
    >
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="bg-[var(--bg-surface-2)] border-b border-[var(--border-subtle)]">
            {columns.map((col) => (
              <th
                key={String(col.key)}
                scope="col"
                style={col.width ? { width: col.width } : undefined}
                className={cn(
                  'px-4 py-3 text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide',
                  alignClasses[col.align ?? 'start'],
                  col.sortable && 'cursor-pointer select-none hover:text-[var(--text-primary)] transition-colors',
                  'whitespace-nowrap'
                )}
                onClick={col.sortable && onSort ? () => onSort(String(col.key)) : undefined}
                aria-sort={
                  sortKey === String(col.key)
                    ? sortDirection === 'asc'
                      ? 'ascending'
                      : sortDirection === 'desc'
                      ? 'descending'
                      : 'none'
                    : undefined
                }
              >
                <span className="inline-flex items-center gap-1">
                  {col.header}
                  {col.sortable && (
                    <span aria-hidden="true" className="text-[var(--text-disabled)]">
                      {sortKey === String(col.key) ? (
                        sortDirection === 'asc' ? (
                          <ChevronUp size={12} />
                        ) : sortDirection === 'desc' ? (
                          <ChevronDown size={12} />
                        ) : (
                          <ChevronsUpDown size={12} />
                        )
                      ) : (
                        <ChevronsUpDown size={12} />
                      )}
                    </span>
                  )}
                </span>
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <tr key={i} className="border-b border-[var(--border-subtle)]">
                {columns.map((col) => (
                  <td key={String(col.key)} className="px-4 py-3">
                    <div className="h-4 bg-[var(--border-subtle)] rounded animate-pulse" />
                  </td>
                ))}
              </tr>
            ))
          ) : data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-4 py-12 text-center text-[var(--text-muted)]"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => (
              <tr
                key={rowKey ? String(row[rowKey]) : rowIndex}
                className={cn(
                  'border-b border-[var(--border-subtle)] last:border-b-0',
                  'bg-[var(--bg-surface)]',
                  'hover:bg-[var(--bg-surface-2)] transition-colors duration-[120ms]'
                )}
              >
                {columns.map((col) => {
                  const value = row[col.key as keyof T];
                  return (
                    <td
                      key={String(col.key)}
                      className={cn(
                        'px-4 py-3 text-[var(--text-primary)]',
                        alignClasses[col.align ?? 'start']
                      )}
                    >
                      {col.render ? col.render(value as unknown, row) : String(value ?? '')}
                    </td>
                  );
                })}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
