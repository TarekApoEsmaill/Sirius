import { Check, Clock, X, Package, Truck, Star, ClipboardList } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { ORDER_STATUS_LABELS, ORDER_STATUS_BADGE } from '@/types/store';
import type { OrderStatus, TimelineEvent } from '@/types/store';
import { formatArabicDateTime } from '@/lib/business';

// ============================================================
// SIRIUS — Order Status Badge
// ============================================================

interface OrderStatusBadgeProps {
  status: OrderStatus;
  size?: 'sm' | 'md';
  showIcon?: boolean;
  className?: string;
}

const statusIcons: Record<OrderStatus, React.ReactNode> = {
  pending:    <Clock size={11} aria-hidden="true" />,
  accepted:   <Check size={11} aria-hidden="true" />,
  rejected:   <X size={11} aria-hidden="true" />,
  processing: <Package size={11} aria-hidden="true" />,
  ready:      <Package size={11} aria-hidden="true" />,
  shipped:    <Truck size={11} aria-hidden="true" />,
  completed:  <Star size={11} aria-hidden="true" />,
};

export function OrderStatusBadge({
  status, size = 'md', showIcon = true, className,
}: OrderStatusBadgeProps) {
  return (
    <Badge variant={ORDER_STATUS_BADGE[status]} size={size} className={cn('gap-1', className)}>
      {showIcon && <span aria-hidden="true">{statusIcons[status]}</span>}
      <span>{ORDER_STATUS_LABELS[status]}</span>
    </Badge>
  );
}

// ============================================================
// SIRIUS — Order Timeline
//
// When real timeline events are provided (Order.timeline), it
// renders them with actor labels and timestamps.
// Falls back to the visual status-derived view for legacy/empty timelines.
// ============================================================

// Static step definitions for the fallback visual view
const STEP_KEYS: OrderStatus[] = ['pending', 'accepted', 'processing', 'ready', 'shipped', 'completed'];

const STEP_LABELS: Record<OrderStatus, string> = {
  pending:    'تم إرسال الطلب',
  accepted:   'تمت الموافقة',
  rejected:   'تم الرفض',
  processing: 'قيد التجهيز',
  ready:      'جاهز للإرسال',
  shipped:    'تم الإرسال',
  completed:  'مكتمل',
};

const STEP_ICONS: Record<OrderStatus, React.ReactNode> = {
  pending:    <ClipboardList size={14} />,
  accepted:   <Check size={14} />,
  rejected:   <X size={14} />,
  processing: <Package size={14} />,
  ready:      <Package size={14} />,
  shipped:    <Truck size={14} />,
  completed:  <Star size={14} />,
};

type StepState = 'completed' | 'active' | 'upcoming';

function getStepState(stepKey: OrderStatus, currentStatus: OrderStatus): StepState {
  if (currentStatus === 'rejected') return stepKey === 'pending' ? 'completed' : 'upcoming';
  const idx     = STEP_KEYS.indexOf(stepKey);
  const current = STEP_KEYS.indexOf(currentStatus);
  if (idx < current) return 'completed';
  if (idx === current) return 'active';
  return 'upcoming';
}

interface OrderTimelineProps {
  status: OrderStatus;
  /** Real persisted events from Order.timeline */
  timeline?: TimelineEvent[];
  className?: string;
}

export function OrderTimeline({ status, timeline, className }: OrderTimelineProps) {
  const isRejected = status === 'rejected';

  // ── Rich mode: real timeline events exist ─────────────────
  if (timeline && timeline.length > 0) {
    return (
      <div className={cn('flex flex-col gap-0', className)} role="list" aria-label="سجل الطلب">
        {isRejected && (
          <div className="flex items-center gap-3 p-3 mb-3 rounded-[var(--radius-md)] bg-[var(--status-error-bg)] border border-[var(--status-error-border)]">
            <X size={16} className="text-[var(--status-error-text)] shrink-0" aria-hidden="true" />
            <p className="text-sm font-medium text-[var(--status-error-text)]">تم رفض هذا الطلب</p>
          </div>
        )}

        {timeline.map((event, idx) => {
          const isLast    = idx === timeline.length - 1;
          const isCurrent = isLast;
          // Add a subtle divider before the current (last) step when there are past steps
          const showDivider = isLast && timeline.length > 1;
          return (
            <div key={event.id} role="listitem">
              {showDivider && (
                <div className="flex items-center gap-2 my-2 pe-2" aria-hidden="true">
                  <div className="flex-1 h-px bg-[var(--border-subtle)]" />
                  <span className="text-[0.6rem] text-[var(--text-disabled)] uppercase tracking-widest font-medium">الآن</span>
                  <div className="flex-1 h-px bg-[var(--border-subtle)]" />
                </div>
              )}
              <div className="flex gap-3">
                {/* Dot + connector */}
                <div className="flex flex-col items-center">
                  <motion.div
                    initial={false}
                    animate={{
                      backgroundColor: event.status === 'rejected' ? '#EF4444' : '#4C8CE4',
                      scale: isCurrent ? 1.15 : 1,
                    }}
                    transition={{ duration: 0.25 }}
                    className={cn(
                      'flex items-center justify-center w-7 h-7 rounded-full shrink-0 z-10 text-white',
                      isCurrent && 'ring-4 ring-[#4C8CE4]/20',
                      event.status === 'rejected' && isCurrent && 'ring-red-400/20'
                    )}
                    aria-hidden="true"
                  >
                    {event.status === 'rejected'
                      ? <X size={13} />
                      : isLast
                      ? STEP_ICONS[event.status]
                      : <Check size={13} />}
                  </motion.div>
                  {!isLast && (
                    <div className="w-0.5 flex-1 my-1 rounded-full min-h-[1.5rem] bg-[#4C8CE4]/40" aria-hidden="true" />
                  )}
                </div>

                {/* Event content */}
                <div className={cn('pb-4 pt-0.5 flex-1 min-w-0', isLast && 'pb-0')}>
                  <p className={cn('text-sm font-semibold leading-tight', isCurrent ? 'text-[#4C8CE4]' : 'text-[var(--text-secondary)]')}>
                    {event.label}
                  </p>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">{formatArabicDateTime(event.timestamp)}</p>
                  <p className="text-xs text-[var(--text-disabled)] mt-0.5">{event.actorLabel}</p>
                  {event.note && (
                    <p className="text-xs text-[var(--text-muted)] mt-1 italic">"{event.note}"</p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // ── Fallback mode: derive visually from current status ─────
  return (
    <div className={cn('flex flex-col gap-0', className)} role="list" aria-label="مراحل الطلب">
      {isRejected && (
        <div className="flex items-center gap-3 p-3 mb-3 rounded-[var(--radius-md)] bg-[var(--status-error-bg)] border border-[var(--status-error-border)]">
          <X size={16} className="text-[var(--status-error-text)] shrink-0" aria-hidden="true" />
          <p className="text-sm font-medium text-[var(--status-error-text)]">تم رفض هذا الطلب</p>
        </div>
      )}

      {STEP_KEYS.map((key, idx) => {
        const state  = getStepState(key, status);
        const isLast = idx === STEP_KEYS.length - 1;
        return (
          <div key={key} role="listitem" className="flex gap-3">
            <div className="flex flex-col items-center">
              <motion.div
                initial={false}
                animate={{
                  backgroundColor: state !== 'upcoming' ? '#4C8CE4' : 'var(--border-default)',
                  scale: state === 'active' ? 1.15 : 1,
                }}
                transition={{ duration: 0.25 }}
                className={cn(
                  'flex items-center justify-center w-7 h-7 rounded-full shrink-0 z-10',
                  state !== 'upcoming' && 'text-white',
                  state === 'active' && 'ring-4 ring-[#4C8CE4]/20',
                  state === 'upcoming' && 'bg-[var(--bg-surface-3)] text-[var(--text-disabled)] border border-[var(--border-default)]'
                )}
                aria-hidden="true"
              >
                {state === 'completed' ? <Check size={13} /> : <span>{STEP_ICONS[key]}</span>}
              </motion.div>
              {!isLast && (
                <div className={cn('w-0.5 flex-1 my-1 rounded-full min-h-[1.5rem]', state === 'completed' ? 'bg-[#4C8CE4]/40' : 'bg-[var(--border-subtle)]')} aria-hidden="true" />
              )}
            </div>
            <div className={cn('pb-4 pt-1 flex-1 min-w-0', isLast && 'pb-0')}>
              <p className={cn('text-sm font-medium leading-tight',
                state === 'active'    && 'text-[#4C8CE4] font-semibold',
                state === 'completed' && 'text-[var(--text-secondary)]',
                state === 'upcoming'  && 'text-[var(--text-disabled)]'
              )}>
                {STEP_LABELS[key]}
              </p>
              {state === 'active' && (
                <p className="text-xs text-[var(--text-muted)] mt-0.5">الحالة الحالية</p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
