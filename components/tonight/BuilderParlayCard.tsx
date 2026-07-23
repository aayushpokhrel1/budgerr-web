'use client';

import { useState } from 'react';

import { quarterKelly } from '@/lib/kelly';
import { PlaystatBuilderConstruction, PlaystatGame } from '@/lib/playstat';
import { builderConstructionToBetInput, hasTeamLeg, legDisplay } from '@/lib/builderParlays';
import { useCreateBet } from '@/lib/queries';

const DEFAULT_STAKE = 10;

export function BuilderParlayCard({
  construction,
  gamesById,
  remainingBudget,
}: {
  construction: PlaystatBuilderConstruction;
  gamesById: Map<number, PlaystatGame>;
  remainingBudget?: number;
}) {
  const createBet = useCreateBet();
  const [stake, setStake] = useState(String(DEFAULT_STAKE));
  const [logged, setLogged] = useState(false);

  const kelly =
    remainingBudget !== undefined
      ? quarterKelly(construction.combined_odds, construction.joint_prob, remainingBudget)
      : null;
  const showKelly = kelly !== null && kelly.f > 0 && (remainingBudget ?? 0) > 0;

  const stakeNum = parseFloat(stake);
  const stakeValid = !Number.isNaN(stakeNum) && stakeNum > 0;
  const teamNote = hasTeamLeg(construction);

  const logAsPaperBet = () => {
    if (!stakeValid) return;
    createBet.mutate(builderConstructionToBetInput(construction, gamesById, stakeNum), {
      onSuccess: () => setLogged(true),
    });
  };

  return (
    <div className="rounded-xl border border-emerald-200 dark:border-emerald-900 p-4">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-medium font-mono tabular-nums">
          {construction.n_legs}-leg · {construction.combined_odds.toFixed(2)}x
        </span>
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium px-2 py-1 rounded bg-surface text-muted whitespace-nowrap font-mono tabular-nums">
            {construction.target_payout.toFixed(1)}x
          </span>
          <span className="text-xs font-medium px-2 py-1 rounded bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 whitespace-nowrap font-mono tabular-nums">
            {Math.round(construction.joint_prob * 100)}% to hit
          </span>
        </div>
      </div>
      <div className="mt-2 space-y-1">
        {construction.legs.map((leg, i) => (
          <p key={i} className="text-xs text-muted truncate">
            {legDisplay(leg, gamesById)}{' '}
            <span className="text-accent font-mono tabular-nums">
              ({leg.odds > 0 ? '+' : ''}
              {leg.odds})
            </span>
          </p>
        ))}
      </div>

      {teamNote && (
        <p className="mt-2 text-xs text-muted italic">Team markets log but don&apos;t auto-settle yet.</p>
      )}

      {showKelly && kelly && (
        <p className="mt-2 text-xs text-muted">
          ¼-Kelly: ${kelly.suggested.toFixed(2)} of ${(remainingBudget ?? 0).toFixed(2)} left
        </p>
      )}

      <div className="mt-3 flex items-center gap-2">
        {logged ? (
          <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Logged as paper ✓</span>
        ) : (
          <>
            <span className="text-xs text-muted">$</span>
            <input
              className="w-16 rounded-lg border border-border bg-transparent px-2 py-1 text-xs font-mono tabular-nums focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              value={stake}
              onChange={(e) => setStake(e.target.value)}
              disabled={createBet.isPending}
              aria-label="Hypothetical stake"
              placeholder={showKelly && kelly ? kelly.suggested.toFixed(2) : undefined}
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
