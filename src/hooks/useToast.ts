import { create } from 'zustand';
import type { ToastItem } from '../types';

interface ToastStore {
  toasts: ToastItem[];
  add: (toast: Omit<ToastItem, 'id'>) => void;
  remove: (id: string) => void;
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  add: (toast) => {
    const id = `t${Date.now()}`;
    set((s) => ({ toasts: [...s.toasts, { ...toast, id }] }));
    setTimeout(() => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })), 3500);
  },
  remove: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));

export function useToast() {
  const { add } = useToastStore();
  return {
    success: (message: string) => add({ type: 'success', message }),
    error:   (message: string) => add({ type: 'error',   message }),
    info:    (message: string) => add({ type: 'info',    message }),
    warning: (message: string) => add({ type: 'warning', message }),
  };
}
