import type { ReactNode } from 'react';
import { cn } from '../../utils';

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center py-16 text-center px-4', className)}>
      <div className="text-5xl mb-4 opacity-60">{icon}</div>
      <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">{title}</h3>
      {description && <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mb-4">{description}</p>}
      {action}
    </div>
  );
}
