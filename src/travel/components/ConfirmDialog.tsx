import { motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";

type ConfirmDialogProps = {
  title: string;
  body: string;
  confirmText?: string;
  onCancel: () => void;
  onConfirm: () => void;
};

export function ConfirmDialog({ title, body, confirmText = "确认删除", onCancel, onConfirm }: ConfirmDialogProps) {
  return (
    <div className="modal-layer" role="dialog" aria-modal="true">
      <motion.div className="confirm-dialog" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}>
        <div className="confirm-icon">
          <AlertTriangle size={22} />
        </div>
        <h3>{title}</h3>
        <p>{body}</p>
        <div className="dialog-actions">
          <button type="button" className="ghost-btn" onClick={onCancel}>
            取消
          </button>
          <button type="button" className="danger-btn" onClick={onConfirm}>
            {confirmText}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
