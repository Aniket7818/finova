import { useState } from 'react';
import { Printer, Download } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { CategoryBadge } from '../components/ui/CategoryBadge';
import {
  formatCurrency, formatDate, getTotalIncome, getTotalExpenses,
  getSavingsRate, getExpensesByCategory, getMonthlyData,
  generateCSV, downloadFile,
} from '../utils';
import { CATEGORY_CONFIG } from '../constants';
import { subMonths, format, addMonths } from 'date-fns';
import { getMonthKey } from '../utils';
import { cn } from '../utils';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from 'recharts';

export function ReportsPage() {
  const { transactions, settings } = useAppStore();
  const [selectedMonth, setSelectedMonth] = useState(new Date());

  const monthKey = getMonthKey(selectedMonth);
  const cur = settings.currency;

  const income   = getTotalIncome(transactions, monthKey);
  const expenses = getTotalExpenses(transactions, monthKey);
  const savings  = income - expenses;
  const rate     = getSavingsRate(transactions, monthKey);

  const expByCat = getExpensesByCategory(transactions, monthKey);
  const catBreakdown = Object.entries(expByCat)
    .map(([cat, amount]) => ({ cat, amount, label: CATEGORY_CONFIG[cat as keyof typeof CATEGORY_CONFIG]?.label ?? cat }))
    .sort((a, b) => b.amount - a.amount);

  const monthTxns = transactions
    .filter((t) => t.date.startsWith(monthKey))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const chartData = getMonthlyData(transactions, 6);

  const handleExportCSV = () => {
    downloadFile(generateCSV(monthTxns), `finova-report-${monthKey}.csv`);
  };

  const handleExportSummary = () => {
    const lines = [
      `Finova Financial Report - ${format(selectedMonth, 'MMMM yyyy')}`,
      '',
      `Income:   ${formatCurrency(income, cur)}`,
      `Expenses: ${formatCurrency(expenses, cur)}`,
      `Net:      ${formatCurrency(savings, cur)}`,
      `Savings Rate: ${rate.toFixed(1)}%`,
      '',
      'Category Breakdown:',
      ...catBreakdown.map((c) => `  ${c.label}: ${formatCurrency(c.amount, cur)}`),
    ];
    downloadFile(lines.join('\n'), `finova-summary-${monthKey}.txt`, 'text/plain');
  };

  const inputCls = 'px-3 py-2 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500 transition';

  return (
    <div className="space-y-5">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 no-print">
        <div className="flex-1">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Reports</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Monthly financial summary and detailed breakdown</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <input
            type="month"
            value={monthKey}
            onChange={(e) => setSelectedMonth(new Date(e.target.value + '-01'))}
            className={inputCls}
          />
          <button onClick={() => window.print()} className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
            <Printer className="w-3.5 h-3.5" /> Print
          </button>
          <button onClick={handleExportCSV} className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
            <Download className="w-3.5 h-3.5" /> Export CSV
          </button>
          <button onClick={handleExportSummary} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-primary-600 text-white text-sm font-medium hover:bg-primary-700 transition-colors">
            <Download className="w-3.5 h-3.5" /> Summary
          </button>
        </div>
      </div>

      {/* Print header */}
      <div className="hidden print:block text-center mb-4">
        <h1 className="text-2xl font-bold">Finova Financial Report</h1>
        <p className="text-lg">{format(selectedMonth, 'MMMM yyyy')}</p>
        <p className="text-sm text-gray-500">Generated on {format(new Date(), 'dd MMM yyyy')}</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Income',    value: formatCurrency(income,   cur), color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800' },
          { label: 'Total Expenses',  value: formatCurrency(expenses,  cur), color: 'text-red-500',   bg: 'bg-red-50   dark:bg-red-900/10   border-red-200   dark:border-red-800'   },
          { label: 'Net Savings',     value: formatCurrency(savings,   cur), color: savings >= 0 ? 'text-primary-600' : 'text-red-600', bg: 'bg-primary-50 dark:bg-primary-900/10 border-primary-200 dark:border-primary-800' },
          { label: 'Savings Rate',    value: `${rate.toFixed(1)}%`,          color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800' },
        ].map((s) => (
          <div key={s.label} className={cn('rounded-2xl border p-5', s.bg)}>
            <p className={cn('text-2xl font-bold', s.color)}>{s.value}</p>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Category Breakdown */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm">
          <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-4">Category Breakdown</h3>
          {catBreakdown.length === 0 ? (
            <p className="text-sm text-slate-400 py-4 text-center">No expenses this month</p>
          ) : (
            <div className="space-y-3">
              {catBreakdown.map((c) => {
                const pct = expenses > 0 ? (c.amount / expenses) * 100 : 0;
                return (
                  <div key={c.cat} className="flex items-center gap-3">
                    <span className="text-base">{CATEGORY_CONFIG[c.cat as keyof typeof CATEGORY_CONFIG]?.icon}</span>
                    <div className="flex-1">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium text-slate-700 dark:text-slate-300">{c.label}</span>
                        <span className="text-slate-500">{formatCurrency(c.amount, cur)}</span>
                      </div>
                      <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5">
                        <div className="h-1.5 rounded-full bg-primary-500 transition-all" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                    <span className="text-xs text-slate-400 w-10 text-right">{pct.toFixed(0)}%</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 6-month bar chart */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm no-print">
          <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-4">6-Month Trend</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`} />
              <Tooltip formatter={(v) => [formatCurrency(Number(v ?? 0), cur), '']} contentStyle={{ borderRadius: '12px', fontSize: '12px' }} />
              <Bar dataKey="income" fill="#22c55e" name="Income" radius={[3,3,0,0]} />
              <Bar dataKey="expenses" fill="#ef4444" name="Expenses" radius={[3,3,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Transaction List */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-800">
          <h3 className="font-semibold text-slate-800 dark:text-slate-200">
            All Transactions — {format(selectedMonth, 'MMMM yyyy')} ({monthTxns.length})
          </h3>
        </div>
        {monthTxns.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-10">No transactions this month</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                  {['Date','Title','Category','Amount','Method'].map((h) => (
                    <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {monthTxns.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="px-5 py-3 text-slate-500 dark:text-slate-400 whitespace-nowrap">{formatDate(t.date, settings.dateFormat)}</td>
                    <td className="px-5 py-3 font-medium text-slate-800 dark:text-slate-200">{t.title}</td>
                    <td className="px-5 py-3"><CategoryBadge category={t.category} size="sm" /></td>
                    <td className={cn('px-5 py-3 font-semibold whitespace-nowrap', t.type === 'income' ? 'text-green-600' : 'text-red-500')}>
                      {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount, cur)}
                    </td>
                    <td className="px-5 py-3 text-slate-500 dark:text-slate-400 capitalize">{t.paymentMethod.replace('_',' ')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
