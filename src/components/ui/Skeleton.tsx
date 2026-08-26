import { cn } from '@/lib/utils';

// ============================================================
// SIRIUS — Skeleton Loading Component
// ============================================================

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
  width?: string | number;
  height?: string | number;
  lines?: number;
}

export function Skeleton({
  className,
  variant = 'rounded',
  width,
  height,
  lines,
}: SkeletonProps) {
  const style: React.CSSProperties = {
    ...(width !== undefined && { width: typeof width === 'number' ? `${width}px` : width }),
    ...(height !== undefined && { height: typeof height === 'number' ? `${height}px` : height }),
  };

  const baseClasses = cn(
    'bg-[var(--border-subtle)] animate-pulse',
    variant === 'circular' && 'rounded-full',
    variant === 'text' && 'rounded h-4',
    variant === 'rectangular' && 'rounded-none',
    variant === 'rounded' && 'rounded-[var(--radius-md)]',
    className
  );

  if (lines && lines > 1) {
    return (
      <div className="flex flex-col gap-2">
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            style={i === lines - 1 ? { ...style, width: '70%' } : style}
            className={baseClasses}
          />
        ))}
      </div>
    );
  }

  return <div style={style} className={baseClasses} />;
}

// Card skeleton preset
export function CardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('card p-4 flex flex-col gap-3', className)}>
      <div className="flex items-center gap-3">
        <Skeleton variant="circular" width={40} height={40} />
        <div className="flex-1">
          <Skeleton variant="text" className="mb-1.5" width="60%" />
          <Skeleton variant="text" height={12} width="40%" />
        </div>
      </div>
      <Skeleton variant="rounded" height={80} />
      <div className="flex gap-2">
        <Skeleton variant="rounded" height={28} className="flex-1" />
        <Skeleton variant="rounded" height={28} className="flex-1" />
      </div>
    </div>
  );
}
