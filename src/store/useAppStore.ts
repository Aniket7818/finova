import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Transaction, Budget, SavingsGoal, RecurringPayment, AppNotification, UserSettings } from '../types';
import { SAMPLE_TRANSACTIONS, SAMPLE_BUDGETS, SAMPLE_SAVINGS_GOALS, SAMPLE_RECURRING_PAYMENTS, SAMPLE_NOTIFICATIONS } from '../data/sampleData';
import { DEFAULT_SETTINGS } from '../constants';

const genId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

interface AppStore {
  transactions: Transaction[];
  budgets: Budget[];
  savingsGoals: SavingsGoal[];
  recurringPayments: RecurringPayment[];
  notifications: AppNotification[];
  settings: UserSettings;
  addTransaction: (t: Omit<Transaction, 'id' | 'createdAt'>) => void;
  updateTransaction: (id: string, t: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  addBudget: (b: Omit<Budget, 'id' | 'createdAt'>) => void;
  updateBudget: (id: string, b: Partial<Budget>) => void;
  deleteBudget: (id: string) => void;
  addSavingsGoal: (g: Omit<SavingsGoal, 'id' | 'createdAt'>) => void;
  updateSavingsGoal: (id: string, g: Partial<SavingsGoal>) => void;
  deleteSavingsGoal: (id: string) => void;
  addToGoal: (id: string, amount: number) => void;
  addRecurringPayment: (r: Omit<RecurringPayment, 'id' | 'createdAt'>) => void;
  updateRecurringPayment: (id: string, r: Partial<RecurringPayment>) => void;
  deleteRecurringPayment: (id: string) => void;
  toggleRecurringStatus: (id: string) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  addNotification: (n: Omit<AppNotification, 'id' | 'createdAt'>) => void;
  updateSettings: (s: Partial<UserSettings>) => void;
  sidebarOpen: boolean;
  mobileNavOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  toggleMobileNav: () => void;
  setMobileNavOpen: (open: boolean) => void;
  resetToSampleData: () => void;
  exportData: () => object;
  importData: (data: Partial<Pick<AppStore, 'transactions' | 'budgets' | 'savingsGoals' | 'recurringPayments' | 'settings'>>) => void;
}

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      transactions: SAMPLE_TRANSACTIONS,
      budgets: SAMPLE_BUDGETS,
      savingsGoals: SAMPLE_SAVINGS_GOALS,
      recurringPayments: SAMPLE_RECURRING_PAYMENTS,
      notifications: SAMPLE_NOTIFICATIONS,
      settings: DEFAULT_SETTINGS,
      sidebarOpen: true,
      mobileNavOpen: false,

      addTransaction: (t) => set((s) => ({ transactions: [{ ...t, id: genId(), createdAt: new Date().toISOString() }, ...s.transactions] })),
      updateTransaction: (id, t) => set((s) => ({ transactions: s.transactions.map((x) => x.id === id ? { ...x, ...t } : x) })),
      deleteTransaction: (id) => set((s) => ({ transactions: s.transactions.filter((x) => x.id !== id) })),

      addBudget: (b) => set((s) => ({ budgets: [{ ...b, id: genId(), createdAt: new Date().toISOString() }, ...s.budgets] })),
      updateBudget: (id, b) => set((s) => ({ budgets: s.budgets.map((x) => x.id === id ? { ...x, ...b } : x) })),
      deleteBudget: (id) => set((s) => ({ budgets: s.budgets.filter((x) => x.id !== id) })),

      addSavingsGoal: (g) => set((s) => ({ savingsGoals: [{ ...g, id: genId(), createdAt: new Date().toISOString() }, ...s.savingsGoals] })),
      updateSavingsGoal: (id, g) => set((s) => ({ savingsGoals: s.savingsGoals.map((x) => x.id === id ? { ...x, ...g } : x) })),
      deleteSavingsGoal: (id) => set((s) => ({ savingsGoals: s.savingsGoals.filter((x) => x.id !== id) })),
      addToGoal: (id, amount) => set((s) => ({
        savingsGoals: s.savingsGoals.map((x) => {
          if (x.id !== id) return x;
          const newAmt = x.currentAmount + amount;
          return { ...x, currentAmount: newAmt, completed: newAmt >= x.targetAmount };
        }),
      })),

      addRecurringPayment: (r) => set((s) => ({ recurringPayments: [{ ...r, id: genId(), createdAt: new Date().toISOString() }, ...s.recurringPayments] })),
      updateRecurringPayment: (id, r) => set((s) => ({ recurringPayments: s.recurringPayments.map((x) => x.id === id ? { ...x, ...r } : x) })),
      deleteRecurringPayment: (id) => set((s) => ({ recurringPayments: s.recurringPayments.filter((x) => x.id !== id) })),
      toggleRecurringStatus: (id) => set((s) => ({ recurringPayments: s.recurringPayments.map((x) => x.id === id ? { ...x, status: x.status === 'active' ? 'paused' : 'active' } : x) })),

      markNotificationRead: (id) => set((s) => ({ notifications: s.notifications.map((x) => x.id === id ? { ...x, read: true } : x) })),
      markAllNotificationsRead: () => set((s) => ({ notifications: s.notifications.map((x) => ({ ...x, read: true })) })),
      addNotification: (n) => set((s) => ({ notifications: [{ ...n, id: genId(), createdAt: new Date().toISOString() }, ...s.notifications] })),

      updateSettings: (s) => set((st) => ({ settings: { ...st.settings, ...s } })),
      toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      toggleMobileNav: () => set((s) => ({ mobileNavOpen: !s.mobileNavOpen })),
      setMobileNavOpen: (open) => set({ mobileNavOpen: open }),

      resetToSampleData: () => set({
        transactions: SAMPLE_TRANSACTIONS,
        budgets: SAMPLE_BUDGETS,
        savingsGoals: SAMPLE_SAVINGS_GOALS,
        recurringPayments: SAMPLE_RECURRING_PAYMENTS,
        notifications: SAMPLE_NOTIFICATIONS,
        settings: DEFAULT_SETTINGS,
      }),

      exportData: () => {
        const s = get();
        return { transactions: s.transactions, budgets: s.budgets, savingsGoals: s.savingsGoals, recurringPayments: s.recurringPayments, settings: s.settings };
      },

      importData: (data) => set((s) => ({
        transactions: data.transactions ?? s.transactions,
        budgets: data.budgets ?? s.budgets,
        savingsGoals: data.savingsGoals ?? s.savingsGoals,
        recurringPayments: data.recurringPayments ?? s.recurringPayments,
        settings: data.settings ?? s.settings,
      })),
    }),
    {
      name: 'finova-app-data',
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        transactions: s.transactions,
        budgets: s.budgets,
        savingsGoals: s.savingsGoals,
        recurringPayments: s.recurringPayments,
        notifications: s.notifications,
        settings: s.settings,
      }),
    }
  )
);
