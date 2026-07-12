import { BudgetPeriod, Category } from '@/lib/api';

function statusStyles(pct: number) {
  if (pct >= 100) {
    return {
      badge: 'bg-red-50 text-red-800 dark:bg-red-950 dark:text-red-200',
      bar: 'bg-red-500',
    };
  }
  if (pct >= 80) {
    return {
      badge: 'bg-amber-50 text-amber-800 dark:bg-amber-950 dark:text-amber-200',
      bar: 'bg-amber-500',
    };
  }
  return {
    badge: 'bg-green-50 text-green-800 dark:bg-green-950 dark:text-green-200',
    bar: 'bg-green-500',
  };
}

export function BudgetPeriodCard({ category, period }: { category: Category; period: BudgetPeriod }) {
  const pct = period.limit > 0 ? (period.spent / period.limit) * 100 : 0;
  const styles = statusStyles(pct);

  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-800 p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium">{category.name}</span>
        <span className={`text-xs font-medium px-2 py-1 rounded ${styles.badge}`}>
          {Math.round(pct)}% used
        </span>
      </div>
      <div className="flex items-baseline gap-1 mb-2">
        <span className="text-2xl font-medium">${period.spent.toFixed(0)}</span>
        <span className="text-sm text-gray-500">
          {' '}
          of ${period.limit.toFixed(0)} spent · ${period.remaining.toFixed(0)} left
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
        <div
          className={`h-full rounded-full ${styles.bar}`}
          style={{ width: `${Math.min(100, Math.max(0, pct))}%` }}
        />
      </div>
    </div>
  );
}
