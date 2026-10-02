import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { X } from 'lucide-react';
import type { Transaction, TransactionType } from '../../types';
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES, CATEGORY_CONFIG, PAYMENT_METHOD_CONFIG } from '../../constants';
import { useAppStore } from '../../store/useAppStore';
import { useToast } from '../../hooks/useToast';
import { cn } from '../../utils';
import { format } from 'date-fns';

const schema = z.object({
  title:         z.string().min(1, 'Title is required').max(80),
  amount:        z.number({ invalid_type_error: 'Enter a valid amount' }).positive('Amount must be positive'),
  type:          z.enum(['income', 'expense']),
  category:      z.string().min(1, 'Category is required'),
  date:          z.string().min(1, 'Date is required'),
  paymentMethod: z.string().min(1, 'Payment method is required'),
  notes:         z.string().max(200).optional(),
});

type FormData = z.infer<typeof schema>;

interface TransactionFormProps {
  transaction?: Transaction;
  defaultType?: TransactionType;
  onClose: () => void;
}

export function TransactionForm({ transaction, defaultType = 'expense', onClose }: TransactionFormProps) {
  const { addTransaction, updateTransaction } = useAppStore();
  const toast = useToast();
  const isEdit = !!transaction;

  const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      title:         transaction?.title ?? '',
      amount:        transaction?.amount ?? ('' as unknown as number),
      type:          transaction?.type ?? defaultType,
      category:      transaction?.category ?? '',
      date:          transaction?.date ?? format(new Date(), 'yyyy-MM-dd'),
      paymentMethod: transaction?.paymentMethod ?? '',
      notes:         transaction?.notes ?? '',
    },
  });

  const type = watch('type');
  const categories = type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  // Reset category when type changes (unless editing)
  useEffect(() => {
    if (!isEdit) setValue('category', '');
  }, [type, isEdit, setValue]);

  const onSubmit = (data: FormData) => {
    const payload = {
      title:         data.title,
      amount:        data.amount,
      type:          data.type,
      category:      data.category as Transaction['category'],
      date:          data.date,
      paymentMethod: data.paymentMethod as Transaction['paymentMethod'],
      notes:         data.notes,
    };

    if (isEdit) {
      updateTransaction(transaction!.id, payload);
      toast.success('Transaction updated successfully');
    } else {
      addTransaction(payload);
      toast.success('Transaction added successfully');
    }
    onClose();
  };

  const inputCls = 'w-full px-3 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition placeholder:text-slate-400';
  const errorCls = 'text-xs text-red-500 mt-1';

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Type selector */}
      <div className="flex rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700">
        {(['expense', 'income'] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setValue('type', t)}
            className={cn(
              'flex-1 py-2.5 text-sm font-medium transition-colors',
              type === t
                ? t === 'income'
                  ? 'bg-green-600 text-white'
                  : 'bg-red-500 text-white'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
            )}
          >
            {t === 'income' ? '📈 Income' : '📉 Expense'}
          </button>
        ))}
      </div>

      {/* Title */}
      <div>
        <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Title</label>
        <input {...register('title')} placeholder="e.g. Grocery Shopping" className={inputCls} />
        {errors.title && <p className={errorCls}>{errors.title.message}</p>}
      </div>

      {/* Amount */}
      <div>
        <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Amount (₹)</label>
        <input
          {...register('amount', { valueAsNumber: true })}
          type="number"
          step="0.01"
          min="0"
          placeholder="0.00"
          className={inputCls}
        />
        {errors.amount && <p className={errorCls}>{errors.amount.message}</p>}
      </div>

      {/* Category */}
      <div>
        <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Category</label>
        <select {...register('category')} className={inputCls}>
          <option value="">Select category…</option>
          {categories.map((c) => (
            <option key={c} value={c}>{CATEGORY_CONFIG[c].icon} {CATEGORY_CONFIG[c].label}</option>
          ))}
        </select>
        {errors.category && <p className={errorCls}>{errors.category.message}</p>}
      </div>

      {/* Date + Payment Method */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Date</label>
          <input {...register('date')} type="date" className={inputCls} />
          {errors.date && <p className={errorCls}>{errors.date.message}</p>}
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Payment Method</label>
          <select {...register('paymentMethod')} className={inputCls}>
            <option value="">Select…</option>
            {Object.entries(PAYMENT_METHOD_CONFIG).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>
          {errors.paymentMethod && <p className={errorCls}>{errors.paymentMethod.message}</p>}
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Notes (optional)</label>
        <textarea {...register('notes')} rows={2} placeholder="Additional details…" className={cn(inputCls, 'resize-none')} />
        {errors.notes && <p className={errorCls}>{errors.notes.message}</p>}
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium transition-colors disabled:opacity-50"
        >
          {isEdit ? 'Save Changes' : 'Add Transaction'}
        </button>
      </div>
    </form>
  );
}

interface TransactionModalProps {
  open: boolean;
  onClose: () => void;
  transaction?: Transaction;
  defaultType?: TransactionType;
}

export function TransactionModal({ open, onClose, transaction, defaultType }: TransactionModalProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-xl w-full max-w-md border border-slate-200 dark:border-slate-700 overflow-y-auto max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
            {transaction ? 'Edit Transaction' : 'Add Transaction'}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-6">
          <TransactionForm transaction={transaction} defaultType={defaultType} onClose={onClose} />
        </div>
      </div>
    </div>
  );
}
