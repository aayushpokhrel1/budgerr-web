import { MonthlyNetResult } from '@/lib/api';

export function TrendStats({ month }: { month: MonthlyNetResult | undefined }) {
  const profit = month?.bet_net_profit ?? 0;
  const cashFlow = month?.bank_net_cash_outflow ?? 0;

  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="rounded-lg bg-surface p-4">
        <p className="text-sm text-muted mb-1">Net bet profit</p>
        <p
          className={`text-xl font-medium font-mono tabular-nums ${profit >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}
        >
          {profit >= 0 ? '+' : ''}
          ${profit.toFixed(0)}
        </p>
      </div>
      <div className="rounded-lg bg-surface p-4">
        <p className="text-sm text-muted mb-1">Bank cash flow</p>
        <p className="text-xl font-medium font-mono tabular-nums">${cashFlow.toFixed(0)}</p>
      </div>
    </div>
  );
}
