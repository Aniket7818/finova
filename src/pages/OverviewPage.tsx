import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Wallet, TrendingUp, TrendingDown, PiggyBank, Plus, Target, RefreshCw, ArrowRight } from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import { useAppStore } from '../store/useAppStore';
import { StatCard } from '../components/ui/StatCard';
import { CategoryBadge } from '../components/ui/CategoryBadge';
import { BudgetProgress } from '../components/ui/BudgetProgress';
import { TransactionModal } from '../components/transactions/TransactionModal';
import {
  formatCurrency, formatDate, getGreeting, getMonthKey, getTotalIncome,
  getTotalExpenses, getSavingsRate, getExpensesByCategory, getMonthlyData, getPctChange,
} from '../utils';
import { CATEGORY_CONFIG } from '../constants';
import { subMonths, format } from 'date-fns';
import { cn } from '../utils';

const CHART_COLORS = ['#7c3aed', '#06b6d4', '#f97316', '#22c55e', '#ef4444', '#f59e0b', '#ec4899', '#a855f7'];

export function OverviewPage() {
  const { transactions, budgets, savingsGoals, recurringPayments, settings } = useAppStore();
  const [addOpen, setAddOpen] = useState(false);
  const [addType, setAddType] = useState<'income' | 'expense'>('expense');

  const now = new Date();
  const thisMonth = getMonthKey(now);
  const lastMonth = getMonthKey(subMonths(now, 1));

  // KPIs
  const totalIncome    = getTotalIncome(transactions, thisMonth);
  const totalExpenses  = getTotalExpenses(transactions, thisMonth);
  const balance        = totalIncome - totalExpenses;
  const savingsRate    = getSavingsRate(transactions, thisMonth);

  const prevIncome    = getTotalIncome(transactions, lastMonth);
  const prevExpenses  = getTotalExpenses(transactions, lastMonth);
  const prevBalance   = prevIncome - prevExpenses;
  const prevSavings   = getSavingsRate(transactions, lastMonth);

  // Chart data
  const monthlyData = getMonthlyData(transactions, 6);
  const expByCat = getExpensesByCategory(transactions, thisMonth);
  const pieData = Object.entries(expByCat)
    .map(([cat, amount]) => ({ name: CATEGORY_CONFIG[cat as keyof typeof CATEGORY_CONFIG]?.label ?? cat, value: amount, cat }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 7);

  // Recent transactions
  const recent = [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 6);

  // Active budgets for this month
  const monthBudgets = budgets.filter((b) => b.month === thisMonth);

  // Upcoming recurring
  const upcoming = [...recurringPayments]
    .filter((r) => r.status === 'active')
    .sort((a, b) => new Date(a.nextDueDate).getTime() - new Date(b.nextDueDate).getTime())
    .slice(0, 3);

  // Active goals
  const activeGoals = savingsGoals.filter((g) => !g.completed).slice(0, 3);

  const cur = settings.currency;

  const openAdd = (type: 'income' | 'expense') => { setAddType(type); setAddOpen(true); };

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">{getGreeting(settings.name)}</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Here's your financial snapshot for {format(now, 'MMMM yyyy')}</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => openAdd('income')} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition-colors">
            <Plus className="w-3.5 h-3.5" /> Income
          </button>
          <button onClick={() => openAdd('expense')} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-500 text-white text-sm font-medium hover:bg-red-600 transition-colors">
            <Plus className="w-3.5 h-3.5" /> Expense
          </button>
          <Link to="/budgets" className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-primary-600 text-white text-sm font-medium hover:bg-primary-700 transition-colors">
            <PiggyBank className="w-3.5 h-3.5" /> Budget
          </Link>
          <Link to="/goals" className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <Target className="w-3.5 h-3.5" /> Goal
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Balance"
          value={formatCurrency(balance, cur)}
          change={getPctChange(balance, prevBalance)}
          changeLabel="vs last month"
          icon={<Wallet className="w-5 h-5 text-primary-600 dark:text-primary-400" />}
          iconBg="bg-primary-50 dark:bg-primary-900/20"
        />
        <StatCard
          title="Monthly Income"
          value={formatCurrency(totalIncome, cur)}
          change={getPctChange(totalIncome, prevIncome)}
          changeLabel="vs last month"
          icon={<TrendingUp className="w-5 h-5 text-green-600 dark:text-green-400" />}
          iconBg="bg-green-50 dark:bg-green-900/20"
          trend="up"
        />
        <StatCard
          title="Monthly Expenses"
          value={formatCurrency(totalExpenses, cur)}
          change={getPctChange(totalExpenses, prevExpenses)}
          changeLabel="vs last month"
          icon={<TrendingDown className="w-5 h-5 text-red-500 dark:text-red-400" />}
          iconBg="bg-red-50 dark:bg-red-900/20"
          trend="down"
        />
        <StatCard
          title="Savings Rate"
          value={`${savingsRate.toFixed(1)}%`}
          change={getPctChange(savingsRate, prevSavings)}
          changeLabel="vs last month"
          icon={<PiggyBank className="w-5 h-5 text-amber-600 dark:text-amber-400" />}
          iconBg="bg-amber-50 dark:bg-amber-900/20"
          trend="up"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Income vs Expenses Line Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm">
          <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-4">Income vs Expenses</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={monthlyData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-slate-700" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`} />
              <Tooltip
              formatter={(value) => [formatCurrency(Number(value ?? 0), cur), '']}
                contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
              />
              <Line type="monotone" dataKey="income" stroke="#22c55e" strokeWidth={2.5} dot={{ r: 4 }} name="Income" />
              <Line type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={2.5} dot={{ r: 4 }} name="Expenses" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Expense Donut */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-5 shadow-sm">
          <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-4">Spending by Category</h3>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={3} dataKey="value">
                  {pieData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v) => formatCurrency(Number(v ?? 0), cur)} contentStyle={{ borderRadius: '12px', fontSize: '12px' }} />
                <Legend iconSize={8} iconType="circle" formatter={(v) => <span className="text-xs text-slate-600 dark:text-slate-300">{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[220px] text-slate-400 text-sm">No expense data</div>
          )}
        </div>
      </div>

      {/* Recent Transactions + Budget Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent Transactions */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
            <h3 className="font-semibold text-slate-800 dark:text-slate-200">Recent Transactions</h3>
            <Link to="/transactions" className="flex items-center gap-1 text-xs text-primary-600 dark:text-primary-400 hover:underline font-medium">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {recent.map((t) => (
              <div key={t.id} className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-lg shrink-0" style={{ backgroundColor: CATEGORY_CONFIG[t.category]?.color + '20' }}>
                  {CATEGORY_CONFIG[t.category]?.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">{t.title}</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500">{formatDate(t.date, settings.dateFormat)}</p>
                </div>
                <CategoryBadge category={t.category} size="sm" />
                <span className={cn('text-sm font-semibold ml-2 shrink-0', t.type === 'income' ? 'text-green-600' : 'text-red-500')}>
                  {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount, cur)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* Budget Snapshot */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-semibold text-slate-800 dark:text-slate-200">Budgets</h3>
              <Link to="/budgets" className="text-xs text-primary-600 dark:text-primary-400 hover:underline font-medium">View all</Link>
            </div>
            <div className="p-4 space-y-3">
              {monthBudgets.slice(0, 3).map((b) => {
                const spent = expByCat[b.category] ?? 0;
                return (
                  <BudgetProgress
                    key={b.id}
                    label={CATEGORY_CONFIG[b.category]?.label}
                    icon={CATEGORY_CONFIG[b.category]?.icon}
                    spent={spent}
                    budget={b.amount}
                    currency={cur}
                  />
                );
              })}
              {monthBudgets.length === 0 && (
                <Link to="/budgets" className="block text-center text-sm text-primary-600 hover:underline py-3">+ Create a budget</Link>
              )}
            </div>
          </div>

          {/* Upcoming Recurring */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-semibold text-slate-800 dark:text-slate-200">Upcoming</h3>
              <Link to="/recurring" className="text-xs text-primary-600 dark:text-primary-400 hover:underline font-medium">View all</Link>
            </div>
            <div className="p-4 space-y-2">
              {upcoming.map((r) => (
                <div key={r.id} className="flex items-center justify-between py-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{CATEGORY_CONFIG[r.category]?.icon}</span>
                    <div>
                      <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{r.name}</p>
                      <p className="text-xs text-slate-400">{formatDate(r.nextDueDate, settings.dateFormat)}</p>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">{formatCurrency(r.amount, cur)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Savings Goals */}
      {activeGoals.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-800">
            <h3 className="font-semibold text-slate-800 dark:text-slate-200">Savings Goals</h3>
            <Link to="/goals" className="flex items-center gap-1 text-xs text-primary-600 dark:text-primary-400 hover:underline font-medium">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeGoals.map((g) => {
              const pct = Math.min((g.currentAmount / g.targetAmount) * 100, 100);
              return (
                <div key={g.id} className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-2xl">{g.icon}</span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-800 dark:text-slate-200 truncate">{g.title}</p>
                      <p className="text-xs text-slate-400">{pct.toFixed(0)}% of {formatCurrency(g.targetAmount, cur)}</p>
                    </div>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
                    <div className="h-2 rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: g.color }} />
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                    {formatCurrency(g.currentAmount, cur)} saved · {formatCurrency(g.targetAmount - g.currentAmount, cur)} to go
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <TransactionModal open={addOpen} onClose={() => setAddOpen(false)} defaultType={addType} />
    </div>
  );
}
