import { useEffect, useCallback, useRef } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { IconButton } from './Button';

// ============================================================
// SIRIUS — Modal / Dialog Component
// ============================================================

type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  size?: ModalSize;
  children: React.ReactNode;
  footer?: React.ReactNode;
  hideClose?: boolean;
  className?: string;
}

const sizeClasses: Record<ModalSize, string> = {
  sm:   'max-w-sm',
  md:   'max-w-lg',
  lg:   'max-w-2xl',
  xl:   'max-w-4xl',
  full: 'max-w-[calc(100vw-2rem)]',
};

export function Modal({
  open,
  onClose,
  title,
  description,
  size = 'md',
  children,
  footer,
  hideClose = false,
  className,
}: ModalProps) {
  const firstFocusRef = useRef<HTMLButtonElement>(null);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    },
    [onClose]
  );

  useEffect(() => {
    if (!open) return;
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    // Focus the close button after open
    setTimeout(() => firstFocusRef.current?.focus(), 50);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [open, handleKeyDown]);

  return (
    <AnimatePresence>
      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={title}
          style={{ zIndex: 400 }}
          className="fixed inset-0 flex items-center justify-center p-4"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-[var(--bg-overlay)]"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.22, ease: [0, 0, 0.2, 1] }}
            className={cn(
              'relative w-full',
              'bg-[var(--bg-surface)] border border-[var(--border-default)]',
              'rounded-[var(--radius-xl)] shadow-[var(--shadow-modal)]',
              'max-h-[90vh] flex flex-col',
              sizeClasses[size],
              className
            )}
          >
            {/* Header */}
            {(title || !hideClose) && (
              <div className="flex items-start justify-between gap-4 p-6 pb-4 shrink-0">
                <div className="flex flex-col gap-1">
                  {title && (
                    <h2 className="text-h4 font-semibold text-[var(--text-primary)]">
                      {title}
                    </h2>
                  )}
                  {description && (
                    <p className="text-sm text-[var(--text-muted)]">{description}</p>
                  )}
                </div>
                {!hideClose && (
                  <IconButton
                    ref={firstFocusRef}
                    aria-label="إغلاق"
                    variant="ghost"
                    size="sm"
                    onClick={onClose}
                    className="shrink-0 -mt-1 -me-1"
                  >
                    <X size={16} aria-hidden="true" />
                  </IconButton>
                )}
              </div>
            )}

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-6 pb-6">
              {children}
            </div>

            {/* Footer */}
            {footer && (
              <div className="shrink-0 px-6 py-4 border-t border-[var(--border-subtle)] flex items-center justify-end gap-3">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
