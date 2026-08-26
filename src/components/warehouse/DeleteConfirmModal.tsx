import { AlertTriangle } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';

// ============================================================
// SIRIUS — Delete Confirm Modal
// ============================================================

interface DeleteConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  productName: string;
}

export function DeleteConfirmModal({
  open, onClose, onConfirm, productName,
}: DeleteConfirmModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="حذف المنتج"
      size="sm"
      footer={
        <>
          <Button variant="ghost" size="sm" onClick={onClose}>إلغاء</Button>
          <Button variant="destructive" size="sm" onClick={() => { onConfirm(); onClose(); }}>
            نعم، احذف المنتج
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-start gap-3 p-3 rounded-[var(--radius-md)] bg-[var(--status-warning-bg)] border border-[var(--status-warning-border)]">
          <AlertTriangle size={16} className="text-[var(--status-warning-text)] shrink-0 mt-0.5" aria-hidden="true" />
          <div>
            <p className="text-sm font-semibold text-[var(--status-warning-text)]">
              هل أنت متأكد من حذف هذا المنتج؟
            </p>
            <p className="text-xs text-[var(--status-warning-text)] mt-1 opacity-80">
              لن يعود المنتج متاحاً للمحلات في أي طلبات جديدة.
            </p>
          </div>
        </div>
        <p className="text-sm text-[var(--text-secondary)]">
          سيتم حذف{' '}
          <span className="font-semibold text-[var(--text-primary)]">{productName}</span>{' '}
          بشكل دائم. لا يمكن التراجع عن هذا الإجراء.
        </p>
      </div>
    </Modal>
  );
}
