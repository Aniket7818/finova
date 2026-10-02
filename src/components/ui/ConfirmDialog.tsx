import { AlertTriangle } from 'lucide-react';
import { cn } from '../../utils';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  danger?: boolean;
}

export function ConfirmDialog({ open, title, message, confirmLabel = 'Confirm', cancelLabel = 'Cancel', onConfirm, onCancel, danger = true }: ConfirmDialogProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-6 w-full max-w-md border border-slate-200 dark:border-slate-700">
        <div className="flex items-center gap-3 mb-4">
          <div className={cn('p-2 rounded-xl', danger ? 'bg-red-100 dark:bg-red-900/30' : 'bg-amber-100 dark:bg-amber-900/30')}>
            <AlertTriangle className={cn('w-5 h-5', danger ? 'text-red-600' : 'text-amber-600')} />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{title}</h3>
        </div>
        <p className="text-slate-600 dark:text-slate-400 mb-6 text-sm leading-relaxed">{message}</p>
        <div className="flex gap-3 justify-end">
          <button onClick={onCancel} className="px-4 py-2 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={cn('px-4 py-2 rounded-xl text-sm font-medium text-white transition-colors', danger ? 'bg-red-600 hover:bg-red-700' : 'bg-primary-600 hover:bg-primary-700')}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
