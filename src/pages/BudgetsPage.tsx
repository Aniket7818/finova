import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { format, addMonths, subMonths, parseISO } from 'date-fns';
import { useAppStore } from '../store/useAppStore';
import { BudgetProgress } from '../components/ui/BudgetProgress';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { EmptyState } from '../components/ui/EmptyState';
import { formatCurrency, getExpensesByCategory, getMonthKey } from '../utils';
import { EXPENSE_CATEGORIES, CATEGORY_CONFIG } from '../constants';
import { useToast } from '../hooks/useToast';
import type { Budget } from '../types';
import { cn } from '../utils';

const schema = z.object({
  category: z.string().min(1, 'Required'),
  amount: z.number({ invalid_type_error: 'Enter a valid amount' }).positive('Must be positive'),
});
type FormData = z.infer<typeof schema>;

export function BudgetsPage() {
  const { budgets, transactions, addBudget, updateBudget, deleteBudget, settings } = useAppStore();
  const toast = useToast();
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [showForm, setShowForm] = useState(false);
  const [editBudget, setEditBudget] = useState<Budget | null>(null);
  const [deleteBudgetItem, setDeleteBudgetItem] = useState<Budget | null>(null);

  const monthKey = getMonthKey(selectedMonth);
  const monthBudgets = budgets.filter((b) => b.month === monthKey);
  const expByCat = getExpensesByCategory(transactions, monthKey);

  const totalBudgeted = monthBudgets.reduce((s, b) => s + b.amount, 0);
  const totalSpent = monthBudgets.reduce((s, b) => s + (expByCat[b.category] ?? 0), 0);

  const usedCategories = monthBudgets.map((b) => b.category);
  const availableCategories = EXPENSE_CATEGORIES.filter((c) => !usedCategories.includes(c));

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { category: '', amount: '' as unknown as number },
  });

  const openEdit = (b: Budget) => {
    setEditBudget(b);
    setValue('category', b.category);
    setValue('amount', b.amount);
    setShowForm(true);
  };

  const onSubmit = (data: FormData) => {
    if (editBudget) {
      updateBudget(editBudget.id, { amount: data.amount });
      toast.success('Budget updated');
    } else {
      const existing = budgets.find((b) => b.month === monthKey && b.category === data.category);
      if (existing) { toast.error('Budget for this category already exists'); return; }
      addBudget({ category: data.category as Budget['category'], amount: data.amount, month: monthKey });
      toast.success('Budget created');
    }
    reset(); setShowForm(false); setEditBudget(null);
  };

  const handleDelete = () => {
    if (!deleteBudgetItem) return;
    deleteBudget(deleteBudgetItem.id);
    toast.success('Budget deleted');
    setDeleteBudgetItem(null);
  };

  const cur = settings.currency;
  const inputCls = 'w-full px-3 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500 transition';

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex-1">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Budgets</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Set and track spending limits by category</p>
        </div>
        <button onClick={() => { setEditBudget(null); reset(); setShowForm(true); }} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-primary-600 text-white text-sm font-medium hover:bg-primary-700 transition-colors self-start sm:self-auto">
          <Plus className="w-4 h-4" /> New Budget
        </button>
      </div>

      {/* Month Navigator */}
      <div className="flex items-center gap-3">
        <button onClick={() => setSelectedMonth((m) => subMonths(m, 1))} className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
          <ChevronLeft className="w-4 h-4 text-slate-500" />
        </button>
        <span className="font-semibold text-slate-800 dark:text-slate-200 min-w-[120px] text-center">{format(selectedMonth, 'MMMM yyyy')}</span>
        <button onClick={() => setSelectedMonth((m) => addMonths(m, 1))} className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
          <ChevronRight className="w-4 h-4 text-slate-500" />
        </button>
      </div>

      {/* Summary */}
      {monthBudgets.length > 0 && (
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Total Budgeted', value: formatCurrency(totalBudgeted, cur), color: 'text-slate-800 dark:text-slate-200' },
            { label: 'Total Spent',    value: formatCurrency(totalSpent, cur),    color: totalSpent > totalBudgeted ? 'text-red-600' : 'text-slate-800 dark:text-slate-200' },
            { label: 'Remaining',      value: formatCurrency(Math.max(0, totalBudgeted - totalSpent), cur), color: 'text-green-600' },
          ].map((s) => (
            <div key={s.label} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 shadow-sm text-center">
              <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Form */}
      {showForm && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-800 dark:text-slate-200">{editBudget ? 'Edit Budget' : 'New Budget'}</h3>
            <button onClick={() => { setShowForm(false); setEditBudget(null); reset(); }} className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
              <X className="w-4 h-4" />
            </button>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Category</label>
              <select {...register('category')} disabled={!!editBudget} className={cn(inputCls, editBudget && 'opacity-60')}>
                <option value="">Select…</option>
                {(editBudget ? EXPENSE_CATEGORIES : availableCategories).map((c) => (
                  <option key={c} value={c}>{CATEGORY_CONFIG[c].icon} {CATEGORY_CONFIG[c].label}</option>
                ))}
              </select>
              {errors.category && <p className="text-xs text-red-500 mt-1">{errors.category.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Budget Amount (₹)</label>
              <input {...register('amount', { valueAsNumber: true })} type="number" min="0" placeholder="0" className={inputCls} />
              {errors.amount && <p className="text-xs text-red-500 mt-1">{errors.amount.message}</p>}
            </div>
            <div className="flex items-end gap-2">
              <button type="submit" className="flex-1 py-2.5 rounded-xl bg-primary-600 text-white text-sm font-medium hover:bg-primary-700 transition-colors">
                {editBudget ? 'Save' : 'Create'}
              </button>
              <button type="button" onClick={() => { setShowForm(false); setEditBudget(null); reset(); }} className="py-2.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Budget Cards */}
      {monthBudgets.length === 0 ? (
        <EmptyState
          icon="💰"
          title="No budgets for this month"
          description="Create category budgets to track and control your spending."
          action={
            <button onClick={() => setShowForm(true)} className="px-4 py-2 rounded-xl bg-primary-600 text-white text-sm font-medium hover:bg-primary-700 transition-colors">
              Create First Budget
            </button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {monthBudgets.map((b) => (
            <BudgetProgress
              key={b.id}
              label={CATEGORY_CONFIG[b.category]?.label ?? b.category}
              icon={CATEGORY_CONFIG[b.category]?.icon ?? '💸'}
              spent={expByCat[b.category] ?? 0}
              budget={b.amount}
              currency={cur}
              onEdit={() => openEdit(b)}
              onDelete={() => setDeleteBudgetItem(b)}
            />
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!deleteBudgetItem}
        title="Delete Budget"
        message={`Delete the ${CATEGORY_CONFIG[deleteBudgetItem?.category as keyof typeof CATEGORY_CONFIG]?.label ?? ''} budget?`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleteBudgetItem(null)}
      />
    </div>
  );
}
