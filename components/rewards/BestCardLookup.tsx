'use client';

import { useState } from 'react';

import { useBestCard, useCategories } from '@/lib/queries';

export function BestCardLookup() {
  const categories = useCategories();
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const bestCard = useBestCard(categoryId);

  return (
    <div className="rounded-xl border border-border p-4">
      <p className="text-sm font-medium mb-3">Which card right now?</p>

      <select
        className="w-full rounded-lg border border-border bg-transparent px-3 py-2 text-sm mb-3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        value={categoryId ?? ''}
        onChange={(e) => setCategoryId(e.target.value ? parseInt(e.target.value, 10) : null)}
      >
        <option value="">Choose a category</option>
        {categories.data?.map((c) => (
          <option key={c.category_id} value={c.category_id}>
            {c.name}
          </option>
        ))}
      </select>

      {categoryId !== null && bestCard.isLoading && <p className="text-sm text-muted">Checking...</p>}

      {bestCard.data && (
        <div className="space-y-1">
          {bestCard.data.options.length === 0 && (
            <p className="text-sm text-muted">No reward rates set up for this category yet.</p>
          )}
          {bestCard.data.options
            .slice()
            .sort((a, b) => b.multiplier - a.multiplier)
            .map((option) => (
              <div
                key={option.card_id}
                className={`flex items-center justify-between text-sm py-2 px-3 rounded-lg ${
                  bestCard.data!.best?.card_id === option.card_id ? 'bg-surface' : ''
                }`}
              >
                <span>{option.card_name}</span>
                <span
                  className={`font-mono tabular-nums ${option.capped_out ? 'text-muted line-through' : 'font-medium text-accent'}`}
                >
                  {option.multiplier}%{option.capped_out ? ' (capped out)' : ''}
                </span>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
