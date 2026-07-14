import { RecurringChargesResponse } from '@/lib/api';

export function RecurringChargesCard({ data }: { data: RecurringChargesResponse }) {
  return (
    <div className="rounded-lg bg-surface p-4">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-medium">Recurring charges</p>
        {data.recurring.length > 0 && (
          <span className="text-sm font-mono tabular-nums text-muted">
            ≈ ${data.monthly_total.toFixed(2)}/mo
          </span>
        )}
      </div>

      {data.recurring.length === 0 ? (
        <p className="text-sm text-muted">No recurring charges detected yet.</p>
      ) : (
        <ul className="space-y-2">
          {data.recurring.map((charge) => (
            <li
              key={charge.merchant_name}
              className={`flex items-center justify-between text-sm ${
                charge.active ? '' : 'opacity-50'
              }`}
            >
              <span>
                {charge.merchant_name}
                {!charge.active && <span className="text-xs text-muted ml-2">inactive</span>}
              </span>
              <span className="font-mono tabular-nums text-muted">
                ${charge.last_amount.toFixed(2)} · every ~{Math.round(charge.median_interval_days)}d
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
