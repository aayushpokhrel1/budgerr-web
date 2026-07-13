'use client';

import { useMemo } from 'react';

import { BudgetPeriodCard } from '@/components/budget/BudgetPeriodCard';
import { GameCard } from '@/components/tonight/GameCard';
import { PlaystatEdge } from '@/lib/playstat';
import {
  currentMonth,
  useBudgetPeriods,
  useCategories,
  usePlaystatTonightsEdges,
  usePlaystatTonightsGames,
} from '@/lib/queries';

export default function TonightPage() {
  const month = currentMonth();

  const categories = useCategories();
  const budgetPeriods = useBudgetPeriods(month);
  const games = usePlaystatTonightsGames();
  const edges = usePlaystatTonightsEdges();

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

  if (categories.isLoading || budgetPeriods.isLoading || games.isLoading) {
    return <p className="text-sm text-gray-400">Loading...</p>;
  }

  return (
    <div className="max-w-2xl space-y-4">
      <h1 className="text-2xl font-medium mb-2">Tonight</h1>

      {bettingCategory && bettingPeriod && (
        <BudgetPeriodCard category={bettingCategory} period={bettingPeriod} />
      )}

      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
        Tonight&apos;s slate{games.data ? ` (${games.data.length})` : ''}
      </p>

      {games.data?.length === 0 && (
        <p className="text-sm text-gray-400">No games tonight.</p>
      )}

      <div className="space-y-3">
        {games.data?.map((game) => (
          <GameCard key={game.game_id} game={game} edges={edgesByGame.get(game.game_id) ?? []} />
        ))}
      </div>
    </div>
  );
}
