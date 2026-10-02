import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, X, CheckCircle, Pencil, Trash2 } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { EmptyState } from '../components/ui/EmptyState';
import { formatCurrency, formatDate, getDaysLeft } from '../utils';
import { useToast } from '../hooks/useToast';
import type { SavingsGoal } from '../types';
import { cn } from '../utils';
import { format } from 'date-fns';

const ICONS = ['🏠', '💻', '✈️', '🚗', '🎓', '💍', '🏖️', '📱', '🎮', '🛡️', '💰', '🌟'];
const COLORS = ['#7c3aed', '#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#06b6d4', '#ec4899', '#a855f7', '#64748b', '#14b8a6'];

const schema = z.object({
  title:         z.string().min(1, 'Required').max(60),
  targetAmount:  z.number({ invalid_type_error: 'Required' }).positive(),
  currentAmount: z.number({ invalid_type_error: 'Required' }).min(0),
  targetDate:    z.string().min(1, 'Required'),
  icon:          z.string().min(1),
  color:         z.string().min(1),
});
type FormData = z.infer<typeof schema>;

const addSchema = z.object({ amount: z.number({ invalid_type_error: 'Required' }).positive() });
type AddForm = z.infer<typeof addSchema>;

export function GoalsPage() {
  const { savingsGoals, addSavingsGoal, updateSavingsGoal, deleteSavingsGoal, addToGoal, settings } = useAppStore();
  const toast = useToast();
  const [showForm, setShowForm] = useState(false);
  const [editGoal, setEditGoal] = useState<SavingsGoal | null>(null);
  const [deleteGoal, setDeleteGoal] = useState<SavingsGoal | null>(null);
  const [addMoneyGoal, setAddMoneyGoal] = useState<SavingsGoal | null>(null);

  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { title: '', targetAmount: '' as unknown as number, currentAmount: 0, targetDate: '', icon: '🏠', color: '#7c3aed' },
  });

  const { register: regAdd, handleSubmit: handleAdd, reset: resetAdd, formState: { errors: errAdd } } = useForm<AddForm>({
    resolver: zodResolver(addSchema),
    defaultValues: { amount: '' as unknown as number },
  });

  const selectedIcon = watch('icon');
  const selectedColor = watch('color');

  const openEdit = (g: SavingsGoal) => {
    setEditGoal(g);
    setValue('title', g.title);
    setValue('targetAmount', g.targetAmount);
    setValue('currentAmount', g.currentAmount);
    setValue('targetDate', g.targetDate);
    setValue('icon', g.icon);
    setValue('color', g.color);
    setShowForm(true);
  };

  const onSubmit = (data: FormData) => {
    if (editGoal) {
      updateSavingsGoal(editGoal.id, { ...data, completed: data.currentAmount >= data.targetAmount });
      toast.success('Goal updated');
    } else {
      addSavingsGoal({ ...data, completed: data.currentAmount >= data.targetAmount });
      toast.success('Goal created');
    }
    reset(); setShowForm(false); setEditGoal(null);
  };

  const onAddMoney = (data: AddForm) => {
    if (!addMoneyGoal) return;
    addToGoal(addMoneyGoal.id, data.amount);
    toast.success(`Added ${formatCurrency(data.amount, settings.currency)} to ${addMoneyGoal.title}`);
    resetAdd(); setAddMoneyGoal(null);
  };

  const handleDelete = () => {
    if (!deleteGoal) return;
    deleteSavingsGoal(deleteGoal.id);
    toast.success('Goal deleted');
    setDeleteGoal(null);
  };

  const cur = settings.currency;
  const active = savingsGoals.filter((g) => !g.completed);
  const completed = savingsGoals.filter((g) => g.completed);
  const inputCls = 'w-full px-3 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500 transition';

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex-1">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Savings Goals</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">{active.length} active · {completed.length} completed</p>
        </div>
        <button onClick={() => { setEditGoal(null); reset(); setShowForm(true); }} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-primary-600 text-white text-sm font-medium hover:bg-primary-700 transition-colors self-start sm:self-auto">
          <Plus className="w-4 h-4" /> New Goal
        </button>
      </div>

      {/* Goal Form */}
      {showForm && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-800 dark:text-slate-200">{editGoal ? 'Edit Goal' : 'New Savings Goal'}</h3>
            <button onClick={() => { setShowForm(false); setEditGoal(null); reset(); }}><X className="w-4 h-4 text-slate-400" /></button>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Goal Title</label>
                <input {...register('title')} placeholder="e.g. Europe Vacation" className={inputCls} />
                {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title.message}</p>}
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Target Date</label>
                <input {...register('targetDate')} type="date" className={inputCls} />
                {errors.targetDate && <p className="text-xs text-red-500 mt-1">{errors.targetDate.message}</p>}
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Target Amount (₹)</label>
                <input {...register('targetAmount', { valueAsNumber: true })} type="number" min="0" className={inputCls} />
                {errors.targetAmount && <p className="text-xs text-red-500 mt-1">{errors.targetAmount.message}</p>}
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Already Saved (₹)</label>
                <input {...register('currentAmount', { valueAsNumber: true })} type="number" min="0" className={inputCls} />
              </div>
            </div>
            {/* Icon & Color */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-2">Icon</label>
                <div className="flex flex-wrap gap-2">
                  {ICONS.map((ic) => (
                    <button key={ic} type="button" onClick={() => setValue('icon', ic)}
                      className={cn('w-9 h-9 rounded-xl text-xl flex items-center justify-center border-2 transition-all', selectedIcon === ic ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' : 'border-slate-200 dark:border-slate-700 hover:border-slate-300')}>
                      {ic}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-2">Color</label>
                <div className="flex flex-wrap gap-2">
                  {COLORS.map((c) => (
                    <button key={c} type="button" onClick={() => setValue('color', c)}
                      className={cn('w-7 h-7 rounded-full border-2 transition-all', selectedColor === c ? 'border-white scale-110 shadow-md' : 'border-transparent')}
                      style={{ backgroundColor: c }} />
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-3 pt-1">
              <button type="button" onClick={() => { setShowForm(false); setEditGoal(null); reset(); }} className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">Cancel</button>
              <button type="submit" className="flex-1 py-2.5 rounded-xl bg-primary-600 text-white text-sm font-medium hover:bg-primary-700 transition-colors">{editGoal ? 'Save Changes' : 'Create Goal'}</button>
            </div>
          </form>
        </div>
      )}

      {/* Add Money Modal */}
      {addMoneyGoal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setAddMoneyGoal(null)} />
          <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-6 w-full max-w-sm border border-slate-200 dark:border-slate-700">
            <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-1">Add Money to Goal</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">{addMoneyGoal.title}</p>
            <form onSubmit={handleAdd(onAddMoney)} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Amount (₹)</label>
                <input {...regAdd('amount', { valueAsNumber: true })} type="number" min="0" placeholder="0" className={inputCls} autoFocus />
                {errAdd.amount && <p className="text-xs text-red-500 mt-1">{errAdd.amount.message}</p>}
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setAddMoneyGoal(null)} className="flex-1 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">Cancel</button>
                <button type="submit" className="flex-1 py-2.5 rounded-xl bg-primary-600 text-white text-sm font-medium hover:bg-primary-700 transition-colors">Add Money</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Active Goals */}
      {active.length === 0 && completed.length === 0 ? (
        <EmptyState
          icon="🎯"
          title="No savings goals yet"
          description="Set a goal and start saving towards it today."
          action={<button onClick={() => setShowForm(true)} className="px-4 py-2 rounded-xl bg-primary-600 text-white text-sm font-medium hover:bg-primary-700 transition-colors">Create First Goal</button>}
        />
      ) : (
        <>
          {active.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {active.map((g) => {
                const pct = Math.min((g.currentAmount / g.targetAmount) * 100, 100);
                const daysLeft = getDaysLeft(g.targetDate);
                return (
                  <div key={g.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm hover:shadow-md transition-shadow group">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl" style={{ backgroundColor: g.color + '20' }}>{g.icon}</div>
                        <div>
                          <p className="font-semibold text-slate-800 dark:text-slate-200">{g.title}</p>
                          <p className="text-xs text-slate-400">{daysLeft > 0 ? `${daysLeft} days left` : 'Past due date'}</p>
                        </div>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => openEdit(g)} className="p-1.5 rounded-lg text-slate-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"><Pencil className="w-3.5 h-3.5" /></button>
                        <button onClick={() => setDeleteGoal(g)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </div>
                    <div className="mb-3">
                      <div className="flex justify-between text-sm mb-1.5">
                        <span className="font-semibold text-slate-700 dark:text-slate-300">{formatCurrency(g.currentAmount, cur)}</span>
                        <span className="text-slate-400 dark:text-slate-500">of {formatCurrency(g.targetAmount, cur)}</span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2.5">
                        <div className="h-2.5 rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: g.color }} />
                      </div>
                      <div className="flex justify-between text-xs text-slate-400 mt-1.5">
                        <span>{pct.toFixed(0)}% reached</span>
                        <span>{formatCurrency(g.targetAmount - g.currentAmount, cur)} to go</span>
                      </div>
                    </div>
                    <button
                      onClick={() => setAddMoneyGoal(g)}
                      className="w-full py-2 rounded-xl border border-dashed text-sm font-medium transition-colors hover:bg-slate-50 dark:hover:bg-slate-800"
                      style={{ borderColor: g.color + '60', color: g.color }}
                    >
                      + Add Money
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {completed.length > 0 && (
            <>
              <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-500" /> Completed Goals ({completed.length})
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {completed.map((g) => (
                  <div key={g.id} className="bg-green-50 dark:bg-green-900/10 rounded-2xl border border-green-200 dark:border-green-800 p-5 shadow-sm opacity-80">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl bg-green-100 dark:bg-green-800/40">{g.icon}</div>
                      <div>
                        <p className="font-semibold text-slate-800 dark:text-slate-200">{g.title}</p>
                        <p className="text-xs text-green-600 dark:text-green-400 font-medium">✓ Goal Completed!</p>
                      </div>
                      <button onClick={() => setDeleteGoal(g)} className="ml-auto p-1 text-slate-400 hover:text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                    <p className="text-sm font-bold text-green-700 dark:text-green-400">{formatCurrency(g.targetAmount, cur)}</p>
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      )}

      <ConfirmDialog
        open={!!deleteGoal}
        title="Delete Goal"
        message={`Delete "${deleteGoal?.title}"? This cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleteGoal(null)}
      />
    </div>
  );
}
