import { createContext, useCallback, useContext, useState } from 'react';
import { X, CheckCircle2, AlertTriangle, XCircle, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { StatusType } from '@/types';

// ============================================================
// SIRIUS — Toast System
// ============================================================

interface ToastItem {
  id: string;
  type: StatusType;
  title: string;
  description?: string;
  duration?: number;
}

interface ToastContextValue {
  toasts: ToastItem[];
  toast: (item: Omit<ToastItem, 'id'>) => void;
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (item: Omit<ToastItem, 'id'>) => {
      const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      setToasts((prev) => [...prev, { ...item, id }]);

      const duration = item.duration ?? 4000;
      if (duration > 0) {
        setTimeout(() => dismiss(id), duration);
      }
    },
    [dismiss]
  );

  return (
    <ToastContext.Provider value={{ toasts, toast, dismiss }}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside ToastProvider');
  return ctx;
}

// Icons per type
const typeIcons: Record<StatusType, React.ReactNode> = {
  success: <CheckCircle2 size={16} aria-hidden="true" />,
  warning: <AlertTriangle size={16} aria-hidden="true" />,
  error:   <XCircle size={16} aria-hidden="true" />,
  info:    <Info size={16} aria-hidden="true" />,
  neutral: <Info size={16} aria-hidden="true" />,
};

const typeClasses: Record<StatusType, string> = {
  success: 'border-[var(--status-success-border)] bg-[var(--status-success-bg)] text-[var(--status-success-text)]',
  warning: 'border-[var(--status-warning-border)] bg-[var(--status-warning-bg)] text-[var(--status-warning-text)]',
  error:   'border-[var(--status-error-border)] bg-[var(--status-error-bg)] text-[var(--status-error-text)]',
  info:    'border-[var(--status-info-border)] bg-[var(--status-info-bg)] text-[var(--status-info-text)]',
  neutral: 'border-[var(--status-neutral-border)] bg-[var(--status-neutral-bg)] text-[var(--status-neutral-text)]',
};

interface ToastContainerProps {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}

function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  return (
    <div
      aria-live="polite"
      aria-label="إشعارات"
      style={{ zIndex: 500 }}
      className="fixed bottom-4 start-4 flex flex-col gap-2 max-w-sm w-full pointer-events-none"
    >
      <AnimatePresence mode="sync">
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.2, ease: [0, 0, 0.2, 1] }}
            className={cn(
              'pointer-events-auto flex items-start gap-3 p-3.5',
              'border rounded-[var(--radius-md)]',
              'shadow-[var(--shadow-2)]',
              typeClasses[t.type]
            )}
            role="alert"
          >
            <span className="shrink-0 mt-0.5">{typeIcons[t.type]}</span>

            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold">{t.title}</p>
              {t.description && (
                <p className="text-xs mt-0.5 opacity-80">{t.description}</p>
              )}
            </div>

            <button
              onClick={() => onDismiss(t.id)}
              aria-label="إغلاق الإشعار"
              className="shrink-0 opacity-60 hover:opacity-100 transition-opacity mt-0.5"
            >
              <X size={14} aria-hidden="true" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
