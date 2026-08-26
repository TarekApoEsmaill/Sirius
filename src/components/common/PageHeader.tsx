import { cn } from '@/lib/utils';
import { Breadcrumbs } from './Breadcrumbs';
import type { BreadcrumbItem } from '@/types';

// ============================================================
// SIRIUS — Page Header Component
// ============================================================

interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
  primaryAction?: React.ReactNode;
  secondaryAction?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  description,
  breadcrumbs,
  primaryAction,
  secondaryAction,
  className,
}: PageHeaderProps) {
  return (
    <div className={cn('flex flex-col gap-2 mb-6', className)}>
      {/* Breadcrumbs */}
      {breadcrumbs && breadcrumbs.length > 0 && (
        <Breadcrumbs items={breadcrumbs} />
      )}

      {/* Title row */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex flex-col gap-0.5 min-w-0">
          <h1 className="text-h2 font-bold text-[var(--text-primary)] leading-tight">
            {title}
          </h1>
          {description && (
            <p className="text-sm text-[var(--text-muted)] mt-0.5">{description}</p>
          )}
        </div>

        {(primaryAction || secondaryAction) && (
          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            {secondaryAction}
            {primaryAction}
          </div>
        )}
      </div>
    </div>
  );
}
