import { ExpiringRatesResponse } from '@/lib/api';

export function ExpiringRatesBanner({ data }: { data: ExpiringRatesResponse }) {
  if (data.expiring.length === 0) return null;

  return (
    <div className="rounded-lg border border-amber-300 bg-amber-50 dark:border-amber-800 dark:bg-amber-950 p-4">
      <p className="text-sm font-medium text-amber-900 dark:text-amber-200 mb-2">
        Rotating categories ending soon
      </p>
      <ul className="space-y-1">
        {data.expiring.map((rate) => (
          <li key={rate.rate_id} className="text-sm text-amber-800 dark:text-amber-300">
            {rate.card_name}: {rate.multiplier}x {rate.category_name} ends {rate.effective_end} (
            {rate.days_left <= 0 ? 'ended' : `${rate.days_left}d`})
          </li>
        ))}
      </ul>
    </div>
  );
}
