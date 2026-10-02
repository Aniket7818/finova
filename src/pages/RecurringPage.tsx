import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, X, Pause, Play, Pencil, Trash2 } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { EmptyState } from '../components/ui/EmptyState';
import { CategoryBadge } from '../components/ui/CategoryBadge';
import { formatCurrency, formatDate } from '../utils';
import { EXPENSE_CATEGORIES, CATEGORY_CONFIG, PAYMENT_METHOD_CONFIG } from '../constants';
import { useToast } from '../hooks/useToast';
import type { RecurringPayment } from '../types';
import { cn } from '../utils';
import { format } from 'date-fns';

const schema = z.object({
  name:         z.string().min(1, 'Required').max(60),
  amount:       z.number({ invalid_type_error: 'Required' }).positive(),
  category:     z.string().min(1, 'Required'),
  billingCycle: z.enum(['daily','weekly','monthly','quarterly','yearly']),
  nextDueDate:  z.string().min(1, 'Required'),
  notes:        z.string().max(200).optional(),
});
type FormData = z.infer<typeof schema>;

export function RecurringPage() {
  const { recurringPayments, addRecurringPayment, updateRecurringPayment, deleteRecurringPayment, toggleRecurringStatus, settings } = useAppStore();
  const toast = useToast();
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<RecurringPayment | null>(null);
  const [deleteItem, setDeleteItem] = useState<RecurringPayment | null>(null);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', amount: '' as unknown as number, category: '', billingCycle: 'monthly', nextDueDate: format(new Date(), 'yyyy-MM-dd'), notes: '' },
  });

  const openEdit = (r: RecurringPayment) => {
    setEditItem(r);
    setValue('name', r.name);
    setValue('amount', r.amount);
    setValue('category', r.category);
    setValue('billingCycle', r.billingCycle);
    setValue('nextDueDate', r.nextDueDate);
    setValue('notes', r.notes ?? '');
    setShowForm(true);
  };

  const onSubmit = (data: FormData) => {
    const payload = {
      name:         data.name,
      amount:       data.amount,
      category:     data.category as RecurringPayment['category'],
      billingCycle: data.billingCycle,
      nextDueDate:  data.nextDueDate,
      status:       'active' as const,
      notes:        data.notes,
    };
    if (editItem) {
      updateRecurringPayment(editItem.id, payload);
      toast.success('Updated recurring payment');
    } else {
      addRecurringPayment(payload);
      toast.success('Added recurring payment');
    }
    reset(); setShowForm(false); setEditItem(null);
  };

  const handleDelete = () => {
    if (!deleteItem) return;
    deleteRecurringPayment(deleteItem.id);
    toast.success('Deleted recurring payment');
    setDeleteItem(null);
  };

  const active   = recurringPayments.filter((r) => r.status === 'active');
  const paused   = recurringPayments.filter((r) => r.status === 'paused');
  const totalMonthly = active.reduce((s, r) => {
    const mul = { monthly: 1, daily: 30, weekly: 4, quarterly: 1/3, yearly: 1/12 }[r.billingCycle] ?? 1;
    return s + r.amount * mul;
  }, 0);

  const cur = settings.currency;
  const inputCls = 'w-full px-3 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500 transition';

  const RCard = ({ r }: { r: RecurringPayment }) => (
    <div className={cn('bg-white dark:bg-slate-900 rounded-2xl border shadow-sm hover:shadow-md transition-shadow group p-4', r.status === 'paused' ? 'border-slate-200 dark:border-slate-700 opacity-70' : 'border-slate-200 dark:border-slate-700')}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style={{ backgroundColor: CATEGORY_CONFIG[r.category]?.color + '20' }}>
            {CATEGORY_CONFIG[r.category]?.icon}
          </div>
          <div>
            <p className="font-semibold text-slate-800 dark:text-slate-200">{r.name}</p>
            <CategoryBadge category={r.category} size="sm" />
          </div>
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => toggleRecurringStatus(r.id)} title={r.status === 'active' ? 'Pause' : 'Resume'} className="p-1.5 rounded-lg text-slate-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors">
            {r.status === 'active' ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          </button>
          <button onClick={() => openEdit(r)} className="p-1.5 rounded-lg text-slate-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"><Pencil className="w-3.5 h-3.5" /></button>
          <button onClick={() => setDeleteItem(r)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-lg font-bold text-slate-800 dark:text-slate-200">{formatCurrency(r.amount, cur)}</p>
          <p className="text-xs text-slate-400 capitalize">{r.billingCycle}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-500 dark:text-slate-400">Next due</p>
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{formatDate(r.nextDueDate, settings.dateFormat)}</p>
        </div>
      </div>
      {r.status === 'paused' && (
        <div className="mt-2 text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 rounded-lg px-2 py-1 text-center">Paused</div>
      )}
      {r.notes && <p className="text-xs text-slate-400 mt-2 truncate">{r.notes}</p>}
    </div>
  );

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex-1">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Recurring Payments</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">{active.length} active · {paused.length} paused</p>
        </div>
        <button onClick={() => { setEditItem(null); reset(); setShowForm(true); }} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-primary-600 text-white text-sm font-medium hover:bg-primary-700 transition-colors self-start sm:self-auto">
          <Plus className="w-4 h-4" /> Add Recurring
        </button>
      </div>

      {/* Total Monthly */}
      {active.length > 0 && (
        <div className="bg-primary-50 dark:bg-primary-900/10 rounded-2xl border border-primary-200 dark:border-primary-800 p-4">
          <p className="text-sm text-primary-700 dark:text-primary-300 font-medium">Total Monthly Recurring Cost</p>
          <p className="text-2xl font-bold text-primary-700 dark:text-primary-300">{formatCurrency(totalMonthly, cur)}</p>
          <p className="text-xs text-primary-600/70 dark:text-primary-400/70 mt-0.5">Based on {active.length} active subscriptions and payments</p>
        </div>
      )}

      {/* Disclaimer */}
      <p className="text-xs text-slate-400 dark:text-slate-500 italic bg-slate-100 dark:bg-slate-800 rounded-xl px-3 py-2">
        ⚠️ These are demo records only. No actual payments are initiated. Finova does not process any real transactions.
      </p>

      {/* Form */}
      {showForm && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-800 dark:text-slate-200">{editItem ? 'Edit' : 'Add'} Recurring Payment</h3>
            <button onClick={() => { setShowForm(false); setEditItem(null); reset(); }}><X className="w-4 h-4 text-slate-400" /></button>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Name</label>
              <input {...register('name')} placeholder="Netflix, Rent…" className={inputCls} />
              {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Amount (₹)</label>
              <input {...register('amount', { valueAsNumber: true })} type="number" min="0" className={inputCls} />
              {errors.amount && <p className="text-xs text-red-500 mt-1">{errors.amount.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Category</label>
              <select {...register('category')} className={inputCls}>
                <option value="">Select…</option>
                {EXPENSE_CATEGORIES.map((c) => <option key={c} value={c}>{CATEGORY_CONFIG[c].icon} {CATEGORY_CONFIG[c].label}</option>)}
              </select>
              {errors.category && <p className="text-xs text-red-500 mt-1">{errors.category.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Billing Cycle</label>
              <select {...register('billingCycle')} className={inputCls}>
                <option value="monthly">Monthly</option>
                <option value="weekly">Weekly</option>
                <option value="yearly">Yearly</option>
                <option value="quarterly">Quarterly</option>
                <option value="daily">Daily</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Next Due Date</label>
              <input {...register('nextDueDate')} type="date" className={inputCls} />
              {errors.nextDueDate && <p className="text-xs text-red-500 mt-1">{errors.nextDueDate.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Notes (optional)</label>
              <input {...register('notes')} placeholder="e.g. Premium plan" className={inputCls} />
            </div>
            <div className="sm:col-span-2 lg:col-span-3 flex gap-3">
              <button type="button" onClick={() => { setShowForm(false); setEditItem(null); reset(); }} className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">Cancel</button>
              <button type="submit" className="flex-1 py-2.5 rounded-xl bg-primary-600 text-white text-sm font-medium hover:bg-primary-700 transition-colors">{editItem ? 'Save Changes' : 'Add Payment'}</button>
            </div>
          </form>
        </div>
      )}

      {/* Cards */}
      {recurringPayments.length === 0 ? (
        <EmptyState icon="🔄" title="No recurring payments" description="Track subscriptions, rent, EMIs, and other recurring expenses." action={<button onClick={() => setShowForm(true)} className="px-4 py-2 rounded-xl bg-primary-600 text-white text-sm font-medium hover:bg-primary-700 transition-colors">Add First Recurring</button>} />
      ) : (
        <>
          {active.length > 0 && (
            <>
              <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400">Active ({active.length})</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {active.map((r) => <RCard key={r.id} r={r} />)}
              </div>
            </>
          )}
          {paused.length > 0 && (
            <>
              <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 mt-4">Paused ({paused.length})</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {paused.map((r) => <RCard key={r.id} r={r} />)}
              </div>
            </>
          )}
        </>
      )}

      <ConfirmDialog
        open={!!deleteItem}
        title="Delete Recurring Payment"
        message={`Delete "${deleteItem?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleteItem(null)}
      />
    </div>
  );
}
