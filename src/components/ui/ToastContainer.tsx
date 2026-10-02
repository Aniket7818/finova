import { X, CheckCircle, AlertTriangle, Info, XCircle } from 'lucide-react';
import { useToastStore } from '../../hooks/useToast';
import { cn } from '../../utils';

const icons = {
  success: <CheckCircle className="w-5 h-5 text-green-500" />,
  error:   <XCircle className="w-5 h-5 text-red-500" />,
  warning: <AlertTriangle className="w-5 h-5 text-amber-500" />,
  info:    <Info className="w-5 h-5 text-blue-500" />,
};

const colors = {
  success: 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950',
  error:   'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950',
  warning: 'border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950',
  info:    'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950',
};

export function ToastContainer() {
  const { toasts, remove } = useToastStore();
  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={cn(
            'flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg max-w-sm pointer-events-auto',
            'animate-in slide-in-from-right-5 duration-300',
            colors[t.type]
          )}
        >
          {icons[t.type]}
          <p className="text-sm font-medium text-slate-800 dark:text-slate-100 flex-1">{t.message}</p>
          <button onClick={() => remove(t.id)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}
