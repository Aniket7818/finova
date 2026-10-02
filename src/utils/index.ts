import { format, parseISO, subMonths } from 'date-fns';
import type { Transaction, Category } from '../types';
import { CURRENCY_SYMBOLS } from '../constants';

export function cn(...classes: (string | undefined | null | false | boolean)[]): string {
  return classes.filter(Boolean).join(' ');
}

export function formatCurrency(amount: number, currency = 'INR'): string {
  const symbol = CURRENCY_SYMBOLS[currency] ?? currency;
  return `${symbol}${amount.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
}

export function formatDate(dateStr: string, fmt = 'dd MMM yyyy'): string {
  try { return format(parseISO(dateStr), fmt); } catch { return dateStr; }
}

export function getMonthKey(date: Date): string {
  return format(date, 'yyyy-MM');
}

export function getTotalIncome(transactions: Transaction[], month?: string): number {
  return transactions
    .filter((t) => t.type === 'income' && (!month || t.date.startsWith(month)))
    .reduce((s, t) => s + t.amount, 0);
}

export function getTotalExpenses(transactions: Transaction[], month?: string): number {
  return transactions
    .filter((t) => t.type === 'expense' && (!month || t.date.startsWith(month)))
    .reduce((s, t) => s + t.amount, 0);
}

export function getSavingsRate(transactions: Transaction[], month?: string): number {
  const income = getTotalIncome(transactions, month);
  const expenses = getTotalExpenses(transactions, month);
  if (income === 0) return 0;
  return Math.max(0, ((income - expenses) / income) * 100);
}

export function getExpensesByCategory(transactions: Transaction[], month?: string): Partial<Record<Category, number>> {
  const result: Partial<Record<Category, number>> = {};
  transactions
    .filter((t) => t.type === 'expense' && (!month || t.date.startsWith(month)))
    .forEach((t) => { result[t.category] = (result[t.category] ?? 0) + t.amount; });
  return result;
}

export function getMonthlyData(transactions: Transaction[], months = 6) {
  return Array.from({ length: months }, (_, i) => {
    const date = subMonths(new Date(), months - 1 - i);
    const monthKey = getMonthKey(date);
    const income = getTotalIncome(transactions, monthKey);
    const expenses = getTotalExpenses(transactions, monthKey);
    return { month: format(date, 'MMM yy'), monthKey, income, expenses, savings: income - expenses };
  });
}

export function getPctChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

export function getDaysLeft(targetDate: string): number {
  return Math.ceil((parseISO(targetDate).getTime() - Date.now()) / 86400000);
}

export function getGreeting(name: string): string {
  const h = new Date().getHours();
  const greeting = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
  return `${greeting}, ${name.split(' ')[0]} 👋`;
}

export function generateCSV(transactions: Transaction[]): string {
  const header = 'Title,Amount,Type,Category,Date,Payment Method,Notes';
  const rows = transactions.map((t) =>
    [`"${t.title}"`, t.amount, t.type, t.category, t.date, t.paymentMethod, `"${t.notes ?? ''}"`].join(',')
  );
  return [header, ...rows].join('\n');
}

export function downloadFile(content: string, filename: string, type = 'text/csv'): void {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click();
  document.body.removeChild(a); URL.revokeObjectURL(url);
}
