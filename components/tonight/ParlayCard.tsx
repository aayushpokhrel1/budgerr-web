'use client';

import { useState } from 'react';

import { BetLegInput } from '@/lib/api';
import { PlaystatEdge, PlaystatParlayRecommendation } from '@/lib/playstat';
import { useCreateBet } from '@/lib/queries';

const DEFAULT_STAKE = 10;

export function ParlayCard({
  parlay,
  edges,
}: {
  parlay: PlaystatParlayRecommendation;
  edges: PlaystatEdge[];
}) {
  const createBet = useCreateBet();
  const [stake, setStake] = useState(String(DEFAULT_STAKE));
  const [logged, setLogged] = useState(false);

  const stakeNum = parseFloat(stake);
  const stakeValid = !Number.isNaN(stakeNum) && stakeNum > 0;

  const logAsPaperBet = () => {
    if (!stakeValid) return;

    // Parlay recommendations don't carry the prop line, but the matching edge
    // (same player/stat/side) does — without it a leg can never auto-settle.
    const legs: BetLegInput[] = parlay.legs.map((leg) => {
      const edge = edges.find(
        (e) =>
          e.player_id === leg.player_id && e.stat_type === leg.stat_type && e.side === leg.side
      );
      return {
        player_name: leg.player_name ?? undefined,
        stat_type: leg.stat_type,
        line_value: edge?.line_value,
        side: leg.side,
        odds: leg.odds,
        model_prob: leg.model_prob,
      };
    });

    createBet.mutate(
      {
        sportsbook: 'paper',
        bet_type: parlay.legs.length > 1 ? 'parlay' : 'single',
        stake: stakeNum,
        potential_payout: stakeNum * parlay.combined_odds,
        is_paper: true,
        legs,
      },
      { onSuccess: () => setLogged(true) }
    );
  };

  return (
    <div className="rounded-xl border border-emerald-200 dark:border-emerald-900 p-4">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-medium font-mono tabular-nums">
          {parlay.legs.length}-leg parlay · {parlay.combined_odds.toFixed(2)}x
        </span>
        <span className="text-xs font-medium px-2 py-1 rounded bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 whitespace-nowrap font-mono tabular-nums">
          {Math.round(parlay.joint_prob * 100)}% to hit
        </span>
      </div>
      <div className="mt-2 space-y-1">
        {parlay.legs.map((leg) => (
          <p key={`${leg.player_id}-${leg.stat_type}`} className="text-xs text-muted truncate">
            {leg.player_name ?? `#${leg.player_id}`} {leg.side} {leg.stat_type}{' '}
            <span className="text-accent font-mono tabular-nums">
              ({leg.odds > 0 ? '+' : ''}
              {leg.odds})
            </span>
          </p>
        ))}
      </div>

      <div className="mt-3 flex items-center gap-2">
        {logged ? (
          <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
            Logged as paper ✓
          </span>
        ) : (
          <>
            <span className="text-xs text-muted">$</span>
            <input
              className="w-16 rounded-lg border border-border bg-transparent px-2 py-1 text-xs font-mono tabular-nums focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              value={stake}
              onChange={(e) => setStake(e.target.value)}
              disabled={createBet.isPending}
              aria-label="Hypothetical stake"
            />
            <button
              className="text-xs px-3 py-1.5 rounded-lg border border-border hover:bg-surface transition-colors duration-150 disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              onClick={logAsPaperBet}
              disabled={createBet.isPending || !stakeValid}
            >
              {createBet.isPending ? 'Logging...' : 'Log as paper bet'}
            </button>
          </>
        )}
      </div>
      {createBet.isError && (
        <p className="mt-1 text-xs text-red-600 dark:text-red-400">
          {String(createBet.error?.message ?? createBet.error)}
        </p>
      )}
    </div>
  );
}
