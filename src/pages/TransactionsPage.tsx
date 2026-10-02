import { useState, useMemo } from 'react';
import { Download, Filter } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { TransactionModal } from '../components/transactions/TransactionModal';
import { CategoryBadge } from '../components/ui/CategoryBadge';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { SearchInput } from '../components/ui/SearchInput';
import { EmptyState } from '../components/ui/EmptyState';
import { formatCurrency, formatDate, generateCSV, downloadFile } from '../utils';
import { CATEGORY_CONFIG, INCOME_CATEGORIES, EXPENSE_CATEGORIES, PAYMENT_METHOD_CONFIG } from '../constants';
import { useToast } from '../hooks/useToast';
import type { Transaction } from '../types';
import { cn } from '../utils';

const PAGE_SIZE = 15;

export function TransactionsPage() {
  const { transactions, deleteTransaction, settings } = useAppStore();
  const toast = useToast();

  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [sortBy, setSortBy] = useState<'date_desc' | 'date_asc' | 'amount_desc' | 'amount_asc'>('date_desc');
  const [page, setPage] = useState(1);
  const [editTx, setEditTx] = useState<Transaction | null>(null);
  const [deleteTx, setDeleteTx] = useState<Transaction | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const allCategories = [...INCOME_CATEGORIES, ...EXPENSE_CATEGORIES];

  const filtered = useMemo(() => {
    let list = [...transactions];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((t) => t.title.toLowerCase().includes(q) || t.notes?.toLowerCase().includes(q));
    }
    if (typeFilter !== 'all') list = list.filter((t) => t.type === typeFilter);
    if (categoryFilter) list = list.filter((t) => t.category === categoryFilter);

    list.sort((a, b) => {
      if (sortBy === 'date_desc') return new Date(b.date).getTime() - new Date(a.date).getTime();
      if (sortBy === 'date_asc')  return new Date(a.date).getTime() - new Date(b.date).getTime();
      if (sortBy === 'amount_desc') return b.amount - a.amount;
      return a.amount - b.amount;
    });
    return list;
  }, [transactions, search, typeFilter, categoryFilter, sortBy]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleDelete = () => {
    if (!deleteTx) return;
    deleteTransaction(deleteTx.id);
    toast.success('Transaction deleted');
    setDeleteTx(null);
  };

  const handleExport = () => {
    downloadFile(generateCSV(filtered), `finova-transactions-${new Date().toISOString().slice(0, 10)}.csv`);
    toast.success(`Exported ${filtered.length} transactions`);
  };

  const cur = settings.currency;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex-1">
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Transactions</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">{filtered.length} of {transactions.length} transactions</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowFilters((p) => !p)} className={cn('flex items-center gap-1.5 px-3 py-2 rounded-xl border text-sm font-medium transition-colors', showFilters ? 'bg-primary-50 border-primary-200 text-primary-700 dark:bg-primary-900/20 dark:border-primary-700 dark:text-primary-400' : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800')}>
            <Filter className="w-3.5 h-3.5" /> Filters
          </button>
          <button onClick={handleExport} className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
            <Download className="w-3.5 h-3.5" /> Export CSV
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className={cn('bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 p-4 space-y-3', !showFilters && 'hidden')}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search transactions…" />
          <select value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value as typeof typeFilter); setPage(1); }} className="px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500">
            <option value="all">All Types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </select>
          <select value={categoryFilter} onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }} className="px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500">
            <option value="">All Categories</option>
            {allCategories.map((c) => <option key={c} value={c}>{CATEGORY_CONFIG[c].icon} {CATEGORY_CONFIG[c].label}</option>)}
          </select>
          <select value={sortBy} onChange={(e) => { setSortBy(e.target.value as typeof sortBy); setPage(1); }} className="px-3 py-2 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500">
            <option value="date_desc">Newest First</option>
            <option value="date_asc">Oldest First</option>
            <option value="amount_desc">Highest Amount</option>
            <option value="amount_asc">Lowest Amount</option>
          </select>
        </div>
      </div>

      {/* Always-visible search */}
      {!showFilters && (
        <SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search transactions…" className="max-w-sm" />
      )}

      {/* Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        {paginated.length === 0 ? (
          <EmptyState icon="🔍" title="No transactions found" description="Try adjusting your search or filters." />
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                    <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Transaction</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Category</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Date</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Method</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Amount</th>
                    <th className="text-right px-5 py-3 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {paginated.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full flex items-center justify-center text-base shrink-0" style={{ backgroundColor: CATEGORY_CONFIG[t.category]?.color + '20' }}>
                            {CATEGORY_CONFIG[t.category]?.icon}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-slate-800 dark:text-slate-200 truncate">{t.title}</p>
                            {t.notes && <p className="text-xs text-slate-400 truncate">{t.notes}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5"><CategoryBadge category={t.category} size="sm" /></td>
                      <td className="px-4 py-3.5 text-slate-600 dark:text-slate-400 whitespace-nowrap">{formatDate(t.date, settings.dateFormat)}</td>
                      <td className="px-4 py-3.5 text-slate-500 dark:text-slate-400">{PAYMENT_METHOD_CONFIG[t.paymentMethod]?.label}</td>
                      <td className={cn('px-4 py-3.5 text-right font-semibold whitespace-nowrap', t.type === 'income' ? 'text-green-600' : 'text-red-500')}>
                        {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount, cur)}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <button onClick={() => setEditTx(t)} className="text-xs text-primary-600 dark:text-primary-400 hover:underline mr-3">Edit</button>
                        <button onClick={() => setDeleteTx(t)} className="text-xs text-red-500 hover:underline">Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-800">
              {paginated.map((t) => (
                <div key={t.id} className="px-4 py-3.5 flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-lg shrink-0" style={{ backgroundColor: CATEGORY_CONFIG[t.category]?.color + '20' }}>
                    {CATEGORY_CONFIG[t.category]?.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-medium text-slate-800 dark:text-slate-200 text-sm truncate">{t.title}</p>
                      <span className={cn('text-sm font-bold shrink-0', t.type === 'income' ? 'text-green-600' : 'text-red-500')}>
                        {t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount, cur)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <CategoryBadge category={t.category} size="sm" />
                      <span className="text-xs text-slate-400">{formatDate(t.date, settings.dateFormat)}</span>
                    </div>
                    <div className="flex gap-3 mt-2">
                      <button onClick={() => setEditTx(t)} className="text-xs text-primary-600 dark:text-primary-400">Edit</button>
                      <button onClick={() => setDeleteTx(t)} className="text-xs text-red-500">Delete</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100 dark:border-slate-800">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Page {page} of {totalPages} · {filtered.length} transactions
                </p>
                <div className="flex gap-1">
                  <button disabled={page === 1} onClick={() => setPage(page - 1)} className="px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">Prev</button>
                  <button disabled={page === totalPages} onClick={() => setPage(page + 1)} className="px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">Next</button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <TransactionModal open={!!editTx} transaction={editTx ?? undefined} onClose={() => setEditTx(null)} />
      <ConfirmDialog
        open={!!deleteTx}
        title="Delete Transaction"
        message={`Are you sure you want to delete "${deleteTx?.title}"? This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTx(null)}
      />
    </div>
  );
}
