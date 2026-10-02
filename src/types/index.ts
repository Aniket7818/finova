export type TransactionType = 'income' | 'expense';

export type PaymentMethod =
  | 'cash'
  | 'credit_card'
  | 'debit_card'
  | 'upi'
  | 'bank_transfer'
  | 'net_banking';

export type Category =
  | 'salary'
  | 'freelance'
  | 'investment'
  | 'business'
  | 'other_income'
  | 'groceries'
  | 'food_dining'
  | 'transport'
  | 'shopping'
  | 'utilities'
  | 'entertainment'
  | 'health'
  | 'education'
  | 'subscriptions'
  | 'rent'
  | 'insurance'
  | 'other_expense';

export interface Transaction {
  id: string;
  title: string;
  amount: number;
  type: TransactionType;
  category: Category;
  date: string;
  paymentMethod: PaymentMethod;
  notes?: string;
  createdAt: string;
}

export interface Budget {
  id: string;
  category: Category;
  amount: number;
  month: string;
  createdAt: string;
}

export interface SavingsGoal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  icon: string;
  color: string;
  completed: boolean;
  createdAt: string;
}

export type BillingCycle = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
export type RecurringStatus = 'active' | 'paused';

export interface RecurringPayment {
  id: string;
  name: string;
  amount: number;
  category: Category;
  billingCycle: BillingCycle;
  nextDueDate: string;
  status: RecurringStatus;
  notes?: string;
  createdAt: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  read: boolean;
  createdAt: string;
}

export interface UserSettings {
  name: string;
  email: string;
  currency: string;
  dateFormat: string;
  theme: 'light' | 'dark' | 'system';
  notifications: {
    budgetAlerts: boolean;
    goalReminders: boolean;
    recurringReminders: boolean;
  };
}

export interface ToastItem {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}
