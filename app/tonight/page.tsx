'use client';

import { useMemo } from 'react';

import { BudgetPeriodCard } from '@/components/budget/BudgetPeriodCard';
import { GameCard } from '@/components/tonight/GameCard';
import { ParlayCard } from '@/components/tonight/ParlayCard';
import { PlaystatEdge, PlaystatGamePrediction } from '@/lib/playstat';
import {
  currentMonth,
  useBudgetPeriods,
  useCategories,
  usePlaystatAllEdges,
  usePlaystatEdges,
  usePlaystatGamePredictions,
  usePlaystatParlays,
  usePlaystatSlate,
} from '@/lib/queries';

function slateHeading(date: string, isToday: boolean, count: number): string {
  if (isToday) return `Tonight's slate (${count})`;
  const day = new Date(`${date}T12:00:00`).toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
  return `Next slate — ${day} (${count})`;
}

export default function TonightPage() {
  const month = currentMonth();

  const categories = useCategories();
  const budgetPeriods = useBudgetPeriods(month);
  const slate = usePlaystatSlate();
  const edges = usePlaystatEdges(slate.data?.date);
  // Parlay recommendations may target a later date than the displayed slate,
  // so their line lookup uses the full current edge set, not the slate's date.
  const allEdges = usePlaystatAllEdges();
  const gamePredictions = usePlaystatGamePredictions(slate.data?.date);
  const parlays = usePlaystatParlays();

  const bettingCategory = categories.data?.find((c) => c.is_betting_category);
  const bettingPeriod = bettingCategory
    ? budgetPeriods.data?.find((p) => p.category_id === bettingCategory.category_id)
    : undefined;

  const edgesByGame = useMemo(() => {
    const map = new Map<number, PlaystatEdge[]>();
    for (const edge of edges.data ?? []) {
      const list = map.get(edge.game_id) ?? [];
      list.push(edge);
      map.set(edge.game_id, list);
    }
    return map;
  }, [edges.data]);

  const firstInningByGame = useMemo(() => {
    const map = new Map<number, PlaystatGamePrediction>();
    for (const pred of gamePredictions.data ?? []) {
      if (pred.market === 'first_inning_runs') map.set(pred.game_id, pred);
    }
    return map;
  }, [gamePredictions.data]);

  if (categories.isLoading || budgetPeriods.isLoading || slate.isLoading) {
    return <p className="text-sm text-muted">Loading...</p>;
  }

  const games = slate.data?.games ?? [];

  return (
    <div className="max-w-2xl space-y-4">
      <h1 className="text-2xl font-medium mb-2">Tonight</h1>

      {bettingCategory && bettingPeriod && (
        <BudgetPeriodCard category={bettingCategory} period={bettingPeriod} />
      )}

      <p className="text-sm font-medium text-muted">Recommended parlays</p>
      {(parlays.data?.length ?? 0) === 0 ? (
        <p className="text-sm text-muted">
          No parlay recommendations yet — the optimizer runs daily at 8:30am and needs a
          multi-game slate with lines (same-game legs are excluded).
        </p>
      ) : (
        <div className="space-y-3">
          {parlays.data?.map((parlay) => (
            <ParlayCard key={parlay.parlay_id} parlay={parlay} edges={allEdges.data ?? []} />
          ))}
        </div>
      )}

      <p className="text-sm font-medium text-muted">
        {slate.data ? slateHeading(slate.data.date, slate.data.isToday, games.length) : ''}
      </p>

      {games.length === 0 && <p className="text-sm text-muted">No games scheduled in the next week.</p>}

      <div className="space-y-3">
        {games.map((game) => (
          <GameCard
            key={game.game_id}
            game={game}
            edges={edgesByGame.get(game.game_id) ?? []}
            firstInning={firstInningByGame.get(game.game_id)}
          />
        ))}
      </div>
    </div>
  );
}
