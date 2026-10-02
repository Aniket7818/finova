import { CATEGORY_CONFIG } from '../../constants';
import type { Category } from '../../types';
import { cn } from '../../utils';

interface CategoryBadgeProps {
  category: Category;
  size?: 'sm' | 'md';
}

export function CategoryBadge({ category, size = 'md' }: CategoryBadgeProps) {
  const cfg = CATEGORY_CONFIG[category];
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-medium whitespace-nowrap',
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs'
      )}
      style={{ backgroundColor: cfg.color + '20', color: cfg.color }}
    >
      <span>{cfg.icon}</span>
      {cfg.label}
    </span>
  );
}
