import { useState, useRef, useCallback } from 'react';
import { cn } from '@/lib/utils';

// ============================================================
// SIRIUS — Tooltip Component
// ============================================================

type TooltipPlacement = 'top' | 'bottom' | 'start' | 'end';

interface TooltipProps {
  content: string;
  placement?: TooltipPlacement;
  children: React.ReactElement;
  delay?: number;
}

const placementClasses: Record<TooltipPlacement, string> = {
  top:    'bottom-full mb-1.5 left-1/2 -translate-x-1/2',
  bottom: 'top-full mt-1.5 left-1/2 -translate-x-1/2',
  start:  'end-full me-1.5 top-1/2 -translate-y-1/2',
  end:    'start-full ms-1.5 top-1/2 -translate-y-1/2',
};

export function Tooltip({
  content,
  placement = 'top',
  children,
  delay = 400,
}: TooltipProps) {
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const show = useCallback(() => {
    timerRef.current = setTimeout(() => setVisible(true), delay);
  }, [delay]);

  const hide = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setVisible(false);
  }, []);

  return (
    <div className="relative inline-flex">
      <div
        onMouseEnter={show}
        onMouseLeave={hide}
        onFocus={show}
        onBlur={hide}
      >
        {children}
      </div>

      {visible && (
        <div
          role="tooltip"
          className={cn(
            'absolute z-[var(--z-tooltip)] pointer-events-none',
            'bg-[var(--neutral-900,#0F172A)] text-white text-xs',
            'px-2.5 py-1.5 rounded-[var(--radius-sm)] whitespace-nowrap',
            'shadow-[var(--shadow-3)]',
            'animate-in fade-in-0 zoom-in-95 duration-100',
            placementClasses[placement]
          )}
          style={{ zIndex: 600 }}
        >
          {content}
        </div>
      )}
    </div>
  );
}
