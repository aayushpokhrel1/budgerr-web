import { BudgetPeriod, Category } from '@/lib/api';

export function CategoryTile({ category, period }: { category: Category; period: BudgetPeriod }) {
  return (
    <div className="rounded-lg bg-gray-50 dark:bg-gray-900 p-4">
      <p className="text-sm text-gray-500 mb-1">{category.name}</p>
      <p className="text-xl font-medium">
        ${period.spent.toFixed(0)}
        <span className="text-sm font-normal text-gray-500"> / ${period.limit.toFixed(0)}</span>
      </p>
    </div>
  );
}
