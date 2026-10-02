import { useState } from 'react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts';
import { useAppStore } from '../store/useAppStore';
import {
  getMonthlyData, getTotalIncome, getTotalExpenses, getSavingsRate,
  getExpensesByCategory, getMonthKey, formatCurrency,
} from '../utils';
import { CATEGORY_CONFIG } from '../constants';
import { subMonths, format } from 'date-fns';

const COLORS = ['#7c3aed','#06b6d4','#f97316','#22c55e','#ef4444','#f59e0b','#ec4899','#a855f7','#64748b','#14b8a6'];

export function AnalyticsPage() {
  const { transactions, settings } = useAppStore();
  const [range, setRange] = useState<3 | 6 | 12>(6);
  const cur = settings.currency;

  const monthlyData = getMonthlyData(transactions, range);

  const now = new Date();
  const thisMonth = getMonthKey(now);
  const lastMonth = getMonthKey(subMonths(now, 1));

  const thisIncome = getTotalIncome(transactions, thisMonth);
  const thisExpenses = getTotalExpenses(transactions, thisMonth);
  const lastIncome = getTotalIncome(transactions, lastMonth);
  const lastExpenses = getTotalExpenses(transactions, lastMonth);
  const savingsRate = getSavingsRate(transactions, thisMonth);

  const expByCat = getExpensesByCategory(transactions, thisMonth);
  const pieData = Object.entries(expByCat)
    .map(([cat, amt]) => ({ name: CATEGORY_CONFIG[cat as keyof typeof CATEGORY_CONFIG]?.label ?? cat, value: amt }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);

  const totalExpThisMonth = Object.values(expByCat).reduce((s, v) => s + v, 0);

  const avgDailyExpense = thisExpenses / new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();

  // Month over month
  const momData = Array.from({ length: range }, (_, i) => {
    const date = subMonths(now, range - 1 - i);
    const mk = getMonthKey(date);
    return {
      month: format(date, 'MMM yy'),
      income: getTotalIncome(transactions, mk),
      expenses: getTotalExpenses(transactions, mk),
      savings: getTotalIncome(transactions, mk) - getTotalExpenses(transactions, mk),
    };
  });

  const cardCls = 'bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm';

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex-1">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Analytics</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Visual breakdown of your financial activity</p>
        </div>
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-xl p-1">
          {([3, 6, 12] as const).map((r) => (
            <button key={r} onClick={() => setRange(r)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${range === r ? 'bg-white dark:bg-slate-700 text-primary-600 dark:text-primary-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`}>
              {r}M
            </button>
          ))}
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Income this month', value: formatCurrency(thisIncome, cur), sub: `vs ${formatCurrency(lastIncome, cur)} last month`, color: 'text-green-600' },
          { label: 'Expenses this month', value: formatCurrency(thisExpenses, cur), sub: `vs ${formatCurrency(lastExpenses, cur)} last month`, color: 'text-red-500' },
          { label: 'Savings Rate', value: `${savingsRate.toFixed(1)}%`, sub: 'of monthly income', color: 'text-primary-600' },
          { label: 'Avg Daily Expense', value: formatCurrency(avgDailyExpense, cur), sub: 'this month', color: 'text-slate-700 dark:text-slate-300' },
        ].map((k) => (
          <div key={k.label} className={cardCls}>
            <p className={`text-xl font-bold ${k.color}`}>{k.value}</p>
            <p className="text-xs font-medium text-slate-700 dark:text-slate-300 mt-0.5">{k.label}</p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{k.sub}</p>
          </div>
        ))}
      </div>

      {/* Income vs Expenses Line */}
      <div className={cardCls}>
        <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-4">Income vs Expenses Trend ({range} months)</h3>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={monthlyData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-slate-700" />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`} />
            <Tooltip formatter={(v) => [formatCurrency(Number(v ?? 0), cur), '']} contentStyle={{ borderRadius: '12px', fontSize: '12px', border: '1px solid #e2e8f0' }} />
            <Line type="monotone" dataKey="income" stroke="#22c55e" strokeWidth={2.5} dot={{ r: 4 }} name="Income" />
            <Line type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={2.5} dot={{ r: 4 }} name="Expenses" />
            <Line type="monotone" dataKey="savings" stroke="#7c3aed" strokeWidth={2} dot={{ r: 3 }} strokeDasharray="5 5" name="Net Savings" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Bar + Pie Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Monthly Cash Flow Bar */}
        <div className={cardCls}>
          <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-4">Monthly Cash Flow</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={momData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-slate-700" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`} />
              <Tooltip formatter={(v) => [formatCurrency(Number(v ?? 0), cur), '']} contentStyle={{ borderRadius: '12px', fontSize: '12px' }} />
              <Bar dataKey="income" fill="#22c55e" name="Income" radius={[4, 4, 0, 0]} />
              <Bar dataKey="expenses" fill="#ef4444" name="Expenses" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Spending by Category Pie */}
        <div className={cardCls}>
          <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-4">Spending by Category (This Month)</h3>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" outerRadius={90} innerRadius={50} paddingAngle={3} dataKey="value">
                  {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v) => [formatCurrency(Number(v ?? 0), cur), '']} contentStyle={{ borderRadius: '12px', fontSize: '12px' }} />
                <Legend iconSize={8} iconType="circle" formatter={(v) => <span className="text-xs text-slate-600 dark:text-slate-300">{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[240px] text-slate-400 text-sm">No expense data this month</div>
          )}
        </div>
      </div>

      {/* Top Spending Categories Table */}
      <div className={cardCls}>
        <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-4">Top Spending Categories — {format(now, 'MMMM yyyy')}</h3>
        {pieData.length === 0 ? (
          <p className="text-sm text-slate-400 py-4 text-center">No spending data available</p>
        ) : (
          <div className="space-y-3">
            {pieData.map((item, i) => {
              const pct = totalExpThisMonth > 0 ? (item.value / totalExpThisMonth) * 100 : 0;
              return (
                <div key={item.name} className="flex items-center gap-3">
                  <span className="text-xs font-bold text-slate-400 w-4">{i + 1}</span>
                  <div className="flex-1">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-slate-700 dark:text-slate-300">{item.name}</span>
                      <span className="text-slate-500 dark:text-slate-400">{formatCurrency(item.value, cur)} · {pct.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5">
                      <div className="h-1.5 rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: COLORS[i % COLORS.length] }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
