import { cn } from '@/lib/utils';
import { ContentContainer } from '@/components/layout/AppShell';
import { PageHeader } from '@/components/common/PageHeader';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import type { BreadcrumbItem } from '@/types';

// ============================================================
// SIRIUS — Placeholder Page Shell
// Used for routes not yet implemented — realistic, not "coming soon"
// ============================================================

interface PlaceholderPageProps {
  title: string;
  description: string;
  breadcrumbs?: BreadcrumbItem[];
  icon: React.ReactNode;
  badge?: string;
  primaryAction?: React.ReactNode;
  features?: { icon: React.ReactNode; label: string; description: string }[];
  className?: string;
}

export function PlaceholderPage({
  title,
  description,
  breadcrumbs,
  icon,
  badge,
  primaryAction,
  features = [],
  className,
}: PlaceholderPageProps) {
  return (
    <ContentContainer className={className}>
      <PageHeader
        title={title}
        description={description}
        breadcrumbs={breadcrumbs}
        primaryAction={primaryAction}
      />

      {/* Main placeholder card */}
      <Card padding="lg" className="mb-6">
        <div className="flex flex-col items-center text-center py-8 gap-4">
          <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-[#4C8CE4]/10 text-[#4C8CE4]">
            {icon}
          </div>

          <div>
            <div className="flex items-center justify-center gap-2 mb-1.5">
              <h2 className="text-h3 font-bold text-[var(--text-primary)]">{title}</h2>
              {badge && <Badge variant="brand" size="sm">{badge}</Badge>}
            </div>
            <p className="text-sm text-[var(--text-muted)] max-w-md mx-auto leading-relaxed">
              {description}
            </p>
          </div>

          {primaryAction && (
            <div className="mt-2">{primaryAction}</div>
          )}
        </div>

        {/* Feature preview grid */}
        {features.length > 0 && (
          <>
            <div className="h-px bg-[var(--border-subtle)] my-6" />
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {features.map((f, i) => (
                <div
                  key={i}
                  className={cn(
                    'flex items-start gap-3 p-4 rounded-[var(--radius-md)]',
                    'bg-[var(--bg-surface-2)] border border-[var(--border-subtle)]'
                  )}
                >
                  <div className="shrink-0 flex items-center justify-center w-8 h-8 rounded-[var(--radius-md)] bg-[#4C8CE4]/10 text-[#4C8CE4]">
                    {f.icon}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[var(--text-primary)]">{f.label}</p>
                    <p className="text-xs text-[var(--text-muted)] mt-0.5 leading-relaxed">{f.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </Card>
    </ContentContainer>
  );
}
