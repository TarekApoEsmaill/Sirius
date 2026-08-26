// ============================================================
// SIRIUS — Utility Helpers
// ============================================================

/**
 * Merge class names, filtering falsy values.
 * Lightweight replacement for clsx/cn without extra deps.
 */
export function cn(...classes: (string | undefined | null | false | 0)[]): string {
  return classes.filter(Boolean).join(' ');
}

/**
 * Format a number as Arabic locale currency (SAR).
 */
export function formatCurrency(amount: number, currency = 'SAR'): string {
  return new Intl.NumberFormat('ar-SA', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Format a number with Arabic locale.
 */
export function formatNumber(n: number): string {
  return new Intl.NumberFormat('ar-SA').format(n);
}

/**
 * Format date for Arabic locale.
 */
export function formatDate(date: Date | string, options?: Intl.DateTimeFormatOptions): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('ar-SA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options,
  }).format(d);
}

/**
 * Truncate text at a given character limit.
 */
export function truncate(text: string, limit: number): string {
  if (text.length <= limit) return text;
  return text.slice(0, limit).trimEnd() + '…';
}

/**
 * Generate a simple unique ID (not for security use).
 */
export function uid(prefix = 'sirius'): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}
