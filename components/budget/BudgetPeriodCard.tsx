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
    <div className="rounded-xl bg-surface p-5">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium">{category.name}</span>
        <span className={`text-xs font-medium px-2 py-1 rounded ${styles.badge}`}>
          {Math.round(pct)}% used
        </span>
      </div>
      <div className="flex items-baseline gap-2 mb-3">
        <span className="text-3xl font-semibold text-primary font-mono tabular-nums">
          ${period.remaining.toFixed(0)}
        </span>
        <span className="text-sm text-muted">left this month</span>
      </div>
      <div className="h-1.5 rounded-full bg-border overflow-hidden mb-2 motion-reduce:transition-none">
        <div
          className={`h-full rounded-full ${styles.bar} transition-[width] duration-200 ease-out motion-reduce:transition-none`}
          style={{ width: `${Math.min(100, Math.max(0, pct))}%` }}
        />
      </div>
      <p className="text-xs text-muted font-mono tabular-nums">
        ${period.spent.toFixed(0)} of ${period.limit.toFixed(0)} spent
      </p>
    </div>
  );
}
