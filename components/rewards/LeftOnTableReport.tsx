'use client';

import { useState } from 'react';

import { currentMonth, monthRange, useLeftOnTable } from '@/lib/queries';

export function LeftOnTableReport() {
  const [start, defaultEnd] = monthRange(currentMonth());
  const [startDate, setStartDate] = useState(start);
  const [endDate, setEndDate] = useState(defaultEnd);
  const [queryRange, setQueryRange] = useState<[string, string] | null>(null);

  const report = useLeftOnTable(queryRange?.[0] ?? start, queryRange?.[1] ?? defaultEnd);

  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-800 p-4">
      <p className="text-sm font-medium mb-3">Rewards left on the table</p>

      <div className="flex items-center gap-2 mb-3">
        <input
          type="date"
          className="rounded-lg border border-gray-200 dark:border-gray-800 bg-transparent px-3 py-2 text-sm"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
        <span className="text-sm text-gray-400">to</span>
        <input
          type="date"
          className="rounded-lg border border-gray-200 dark:border-gray-800 bg-transparent px-3 py-2 text-sm"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />
        <button
          className="text-sm px-3 py-2 rounded-lg bg-blue-600 text-white"
          onClick={() => setQueryRange([startDate, endDate])}
        >
          Calculate
        </button>
      </div>

      {report.isLoading && <p className="text-sm text-gray-400">Calculating...</p>}

      {report.data && (
        <>
          <p className="text-xl font-medium mb-2">${report.data.total_gap_dollars.toFixed(2)}</p>
          <div className="space-y-1">
            {report.data.by_month.map((m) => (
              <div key={m.month} className="flex items-center justify-between text-sm">
                <span className="text-gray-500">{m.month}</span>
                <span>
                  ${m.gap_dollars.toFixed(2)} ({m.transaction_count} txns)
                </span>
              </div>
            ))}
            {report.data.by_month.length === 0 && (
              <p className="text-sm text-gray-400">No gap found for this range.</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
