import { cn } from '../../utils';

interface BudgetProgressProps {
  label: string;
  icon: string;
  spent: number;
  budget: number;
  currency: string;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function BudgetProgress({ label, icon, spent, budget, currency, onEdit, onDelete }: BudgetProgressProps) {
  const pct = Math.min((spent / budget) * 100, 100);
  const isOver = spent > budget;
  const isNear = pct >= 80 && !isOver;
  const sym = currency === 'INR' ? '₹' : currency;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 shadow-sm hover:shadow-md transition-shadow group">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">{icon}</span>
          <span className="font-medium text-slate-800 dark:text-slate-200 text-sm">{label}</span>
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {onEdit && (
            <button onClick={onEdit} className="p-1 text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 text-xs rounded">
              Edit
            </button>
          )}
          {onDelete && (
            <button onClick={onDelete} className="p-1 text-slate-400 hover:text-red-500 text-xs rounded">
              Delete
            </button>
          )}
        </div>
      </div>
      <div className="flex items-end justify-between mb-2">
        <span className={cn('text-sm font-semibold', isOver ? 'text-red-600' : isNear ? 'text-amber-600' : 'text-slate-700 dark:text-slate-300')}>
          {sym}{spent.toLocaleString('en-IN')}
          <span className="text-xs font-normal text-slate-400 ml-1">/ {sym}{budget.toLocaleString('en-IN')}</span>
        </span>
        <span className={cn('text-xs font-medium', isOver ? 'text-red-600' : isNear ? 'text-amber-600' : 'text-slate-500')}>
          {pct.toFixed(0)}%
        </span>
      </div>
      <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
        <div
          className={cn('h-2 rounded-full transition-all duration-500', isOver ? 'bg-red-500' : isNear ? 'bg-amber-500' : 'bg-primary-500')}
          style={{ width: `${pct}%` }}
        />
      </div>
      {isOver && (
        <p className="text-xs text-red-500 mt-1.5">Over budget by {sym}{(spent - budget).toLocaleString('en-IN')}</p>
      )}
      {isNear && !isOver && (
        <p className="text-xs text-amber-500 mt-1.5">Almost at limit — {sym}{(budget - spent).toLocaleString('en-IN')} left</p>
      )}
    </div>
  );
}
