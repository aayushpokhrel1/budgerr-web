'use client';

import { useState } from 'react';

import { BetForm } from '@/components/bets/BetForm';
import { BetRow } from '@/components/bets/BetRow';
import { BetStatus } from '@/lib/api';
import { useBets } from '@/lib/queries';

const statuses: (BetStatus | 'all')[] = ['all', 'pending', 'won', 'lost', 'push', 'cashed_out'];

export default function BetsPage() {
  const [filter, setFilter] = useState<BetStatus | 'all'>('all');
  const [showForm, setShowForm] = useState(false);
  const bets = useBets(filter === 'all' ? undefined : filter);

  return (
    <div className="max-w-2xl space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-medium">Bets</h1>
        <button
          className="text-sm px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900"
          onClick={() => setShowForm((v) => !v)}
        >
          {showForm ? 'Cancel' : '+ Log a bet'}
        </button>
      </div>

      {showForm && <BetForm onDone={() => setShowForm(false)} />}

      <div className="flex gap-2 flex-wrap">
        {statuses.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`text-xs px-3 py-1.5 rounded-lg border ${
              filter === s
                ? 'border-blue-600 bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                : 'border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="rounded-xl border border-gray-200 dark:border-gray-800 p-4">
        {bets.isLoading && <p className="text-sm text-gray-400">Loading...</p>}
        {bets.data?.length === 0 && <p className="text-sm text-gray-400">No bets found.</p>}
        {bets.data?.map((bet) => <BetRow key={bet.bet_id} bet={bet} />)}
      </div>
    </div>
  );
}
