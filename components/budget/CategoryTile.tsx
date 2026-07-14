import { BudgetPeriod, Category } from '@/lib/api';

export function CategoryTile({ category, period }: { category: Category; period: BudgetPeriod }) {
  return (
    <div className="rounded-lg bg-surface p-4">
      <p className="text-sm text-muted mb-1">{category.name}</p>
      <p className="text-xl font-medium font-mono tabular-nums">
        ${period.spent.toFixed(0)}
        <span className="text-sm font-normal text-muted"> / ${period.limit.toFixed(0)}</span>
      </p>
    </div>
  );
}
