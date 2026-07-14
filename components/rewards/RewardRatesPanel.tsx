'use client';

import { useState } from 'react';

import { CapPeriod } from '@/lib/api';
import { useCategories, useCreateRewardRate, useRewardRates } from '@/lib/queries';

export function RewardRatesPanel({ cardId }: { cardId: number | null }) {
  const rates = useRewardRates(cardId);
  const categories = useCategories();
  const createRate = useCreateRewardRate();

  const [categoryId, setCategoryId] = useState('');
  const [multiplier, setMultiplier] = useState('');
  const [capAmount, setCapAmount] = useState('');
  const [capPeriod, setCapPeriod] = useState<CapPeriod | ''>('');
  const [effectiveStart, setEffectiveStart] = useState('');

  if (cardId === null) {
    return (
      <div className="rounded-xl border border-border p-4">
        <p className="text-sm text-muted">Select a card to manage its reward rates.</p>
      </div>
    );
  }

  const submit = () => {
    const catId = parseInt(categoryId, 10);
    const mult = parseFloat(multiplier);
    if (Number.isNaN(catId) || Number.isNaN(mult) || !effectiveStart) return;

    createRate.mutate(
      {
        cardId,
        rate: {
          category_id: catId,
          multiplier: mult,
          cap_amount: capAmount ? parseFloat(capAmount) : undefined,
          cap_period: capPeriod || undefined,
          effective_start: effectiveStart,
        },
      },
      {
        onSuccess: () => {
          setCategoryId('');
          setMultiplier('');
          setCapAmount('');
          setCapPeriod('');
          setEffectiveStart('');
        },
      }
    );
  };

  return (
    <div className="rounded-xl border border-border p-4">
      <p className="text-sm font-medium mb-3">Reward rates</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
        <select
          className="rounded-lg border border-border bg-transparent px-3 py-2 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
        >
          <option value="">Category</option>
          {categories.data?.map((c) => (
            <option key={c.category_id} value={c.category_id}>
              {c.name}
            </option>
          ))}
        </select>
        <input
          className="rounded-lg border border-border bg-transparent px-3 py-2 text-sm font-mono tabular-nums focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          placeholder="Multiplier % (5)"
          value={multiplier}
          onChange={(e) => setMultiplier(e.target.value)}
        />
        <input
          className="rounded-lg border border-border bg-transparent px-3 py-2 text-sm font-mono tabular-nums focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          placeholder="Cap amount (optional)"
          value={capAmount}
          onChange={(e) => setCapAmount(e.target.value)}
        />
        <select
          className="rounded-lg border border-border bg-transparent px-3 py-2 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          value={capPeriod}
          onChange={(e) => setCapPeriod(e.target.value as CapPeriod | '')}
        >
          <option value="">No cap period</option>
          <option value="quarterly">quarterly</option>
          <option value="annual">annual</option>
        </select>
        <input
          type="date"
          className="sm:col-span-2 rounded-lg border border-border bg-transparent px-3 py-2 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          value={effectiveStart}
          onChange={(e) => setEffectiveStart(e.target.value)}
        />
        <button
          className="sm:col-span-2 rounded-lg bg-primary text-primary-ink text-sm font-medium py-2 transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          onClick={submit}
          disabled={createRate.isPending}
        >
          {createRate.isPending ? 'Saving...' : 'Add rate'}
        </button>
      </div>

      {rates.isLoading && <p className="text-sm text-muted">Loading...</p>}
      {rates.data?.length === 0 && <p className="text-sm text-muted">No rates yet for this card.</p>}

      <div className="space-y-1">
        {rates.data?.map((rate) => {
          const category = categories.data?.find((c) => c.category_id === rate.category_id);
          return (
            <div
              key={rate.rate_id}
              className="flex items-center justify-between text-sm py-1.5 border-t border-border first:border-t-0"
            >
              <span>{category?.name ?? `Category ${rate.category_id}`}</span>
              <span className="text-muted font-mono tabular-nums">
                {rate.multiplier}%{rate.cap_amount ? ` · capped $${rate.cap_amount} / ${rate.cap_period}` : ''}
                {rate.effective_end ? ` · ends ${rate.effective_end}` : ''}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
