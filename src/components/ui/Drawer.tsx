import { useEffect, useCallback } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { IconButton } from './Button';

// ============================================================
// SIRIUS — Drawer Component
// ============================================================

type DrawerSide = 'start' | 'end';
type DrawerSize = 'sm' | 'md' | 'lg';

interface DrawerProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  side?: DrawerSide;
  size?: DrawerSize;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

const sizeClasses: Record<DrawerSize, string> = {
  sm: 'w-72',
  md: 'w-96',
  lg: 'w-[480px]',
};

export function Drawer({
  open,
  onClose,
  title,
  side = 'end',
  size = 'md',
  children,
  footer,
  className,
}: DrawerProps) {
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
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [open, handleKeyDown]);

  const slideVariants = {
    hidden: { x: side === 'end' ? '100%' : '-100%' },
    visible: { x: 0 },
  };

  return (
    <AnimatePresence>
      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={title}
          style={{ zIndex: 400 }}
          className="fixed inset-0 flex"
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
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={slideVariants}
            transition={{ duration: 0.28, ease: [0, 0, 0.2, 1] }}
            className={cn(
              'absolute inset-y-0 flex flex-col',
              'bg-[var(--bg-surface)] border-[var(--border-default)]',
              'shadow-[var(--shadow-modal)]',
              side === 'end'
                ? 'end-0 border-s rounded-s-[var(--radius-xl)]'
                : 'start-0 border-e rounded-e-[var(--radius-xl)]',
              sizeClasses[size],
              'max-w-full',
              className
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 pb-4 shrink-0 border-b border-[var(--border-subtle)]">
              {title ? (
                <h2 className="text-h4 font-semibold text-[var(--text-primary)]">{title}</h2>
              ) : (
                <div />
              )}
              <IconButton
                aria-label="إغلاق"
                variant="ghost"
                size="sm"
                onClick={onClose}
              >
                <X size={16} aria-hidden="true" />
              </IconButton>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-5">
              {children}
            </div>

            {/* Footer */}
            {footer && (
              <div className="shrink-0 p-5 pt-4 border-t border-[var(--border-subtle)] flex items-center gap-3 justify-end">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
