import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '../../utils';

interface StatCardProps {
  title: string;
  value: string;
  change?: number;
  changeLabel?: string;
  icon: React.ReactNode;
  iconBg?: string;
  trend?: 'up' | 'down' | 'neutral';
}

export function StatCard({ title, value, change, changeLabel, icon, iconBg = 'bg-primary-100 dark:bg-primary-900/30', trend }: StatCardProps) {
  const isPositive = change !== undefined && change > 0;
  const isNegative = change !== undefined && change < 0;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className={cn('p-2.5 rounded-xl', iconBg)}>
          {icon}
        </div>
        {change !== undefined && (
          <div className={cn(
            'flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full',
            isPositive ? 'text-green-700 bg-green-100 dark:text-green-400 dark:bg-green-900/30' :
            isNegative ? 'text-red-700 bg-red-100 dark:text-red-400 dark:bg-red-900/30' :
            'text-slate-500 bg-slate-100 dark:text-slate-400 dark:bg-slate-800'
          )}>
            {trend === 'up' || isPositive ? <TrendingUp className="w-3 h-3" /> :
             trend === 'down' || isNegative ? <TrendingDown className="w-3 h-3" /> :
             <Minus className="w-3 h-3" />}
            {Math.abs(change).toFixed(1)}%
          </div>
        )}
      </div>
      <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-0.5">{value}</p>
      <p className="text-sm text-slate-500 dark:text-slate-400">{title}</p>
      {changeLabel && <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{changeLabel}</p>}
    </div>
  );
}
