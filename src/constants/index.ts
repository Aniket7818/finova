import type { Category, PaymentMethod } from '../types';

export const AGENCY_URL = 'https://infinvotech.com';

export const CATEGORY_CONFIG: Record<
  Category,
  { label: string; icon: string; color: string; type: 'income' | 'expense' | 'both' }
> = {
  salary:       { label: 'Salary',        icon: '💼', color: '#22c55e', type: 'income' },
  freelance:    { label: 'Freelance',     icon: '💻', color: '#06b6d4', type: 'income' },
  investment:   { label: 'Investment',    icon: '📈', color: '#f59e0b', type: 'both'   },
  business:     { label: 'Business',      icon: '🏢', color: '#8b5cf6', type: 'income' },
  other_income: { label: 'Other Income',  icon: '💰', color: '#10b981', type: 'income' },
  groceries:    { label: 'Groceries',     icon: '🛒', color: '#f97316', type: 'expense' },
  food_dining:  { label: 'Food & Dining', icon: '🍔', color: '#ef4444', type: 'expense' },
  transport:    { label: 'Transport',     icon: '🚗', color: '#3b82f6', type: 'expense' },
  shopping:     { label: 'Shopping',      icon: '🛍️', color: '#ec4899', type: 'expense' },
  utilities:    { label: 'Utilities',     icon: '⚡', color: '#eab308', type: 'expense' },
  entertainment:{ label: 'Entertainment', icon: '🎬', color: '#a855f7', type: 'expense' },
  health:       { label: 'Health',        icon: '🏥', color: '#14b8a6', type: 'expense' },
  education:    { label: 'Education',     icon: '📚', color: '#6366f1', type: 'expense' },
  subscriptions:{ label: 'Subscriptions', icon: '📱', color: '#f43f5e', type: 'expense' },
  rent:         { label: 'Rent',          icon: '🏠', color: '#64748b', type: 'expense' },
  insurance:    { label: 'Insurance',     icon: '🛡️', color: '#0ea5e9', type: 'expense' },
  other_expense:{ label: 'Other',         icon: '💸', color: '#94a3b8', type: 'expense' },
};

export const PAYMENT_METHOD_CONFIG: Record<PaymentMethod, { label: string }> = {
  cash:          { label: 'Cash'          },
  credit_card:   { label: 'Credit Card'   },
  debit_card:    { label: 'Debit Card'    },
  upi:           { label: 'UPI'           },
  bank_transfer: { label: 'Bank Transfer' },
  net_banking:   { label: 'Net Banking'   },
};

export const INCOME_CATEGORIES: Category[] = [
  'salary', 'freelance', 'investment', 'business', 'other_income',
];
export const EXPENSE_CATEGORIES: Category[] = [
  'groceries', 'food_dining', 'transport', 'shopping', 'utilities',
  'entertainment', 'health', 'education', 'subscriptions', 'rent', 'insurance', 'other_expense',
];

export const CURRENCY_SYMBOLS: Record<string, string> = {
  INR: '₹', USD: '$', EUR: '€', GBP: '£',
};

export const DEFAULT_SETTINGS = {
  name: 'Alex Johnson',
  email: 'alex.johnson@example.com',
  currency: 'INR',
  dateFormat: 'dd MMM yyyy',
  theme: 'system' as const,
  notifications: { budgetAlerts: true, goalReminders: true, recurringReminders: true },
};
