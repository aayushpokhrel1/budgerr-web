'use client';

import { useEffect, useMemo, useState } from 'react';

import { BudgetPeriodCard } from '@/components/budget/BudgetPeriodCard';
import { GameCard } from '@/components/tonight/GameCard';
import { BuilderParlayCard } from '@/components/tonight/BuilderParlayCard';
import { PlaystatGame } from '@/lib/playstat';
import {
  firstInningLegByGame,
  hasTeamLeg,
  isRunFullyPast,
  playerLegKeys,
  playerLegsByGame,
  runDate,
  selectLatestRun,
} from '@/lib/builderParlays';
import {
  currentMonth,
  useBudgetPeriods,
  useCategories,
  usePlaystatBuilderParlays,
  usePlaystatGames,
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

  const bettingCategory = categories.data?.find((c) => c.is_betting_category);
  const bettingPeriod = bettingCategory
    ? budgetPeriods.data?.find((p) => p.category_id === bettingCategory.category_id)
    : undefined;

  const builderParlays = usePlaystatBuilderParlays(); // ?tier=all combined feed

  // tier=all constructions are never mixed — partition cleanly by hasTeamLeg.
  const playerCons = useMemo(
    () => (builderParlays.data ?? []).filter((c) => !hasTeamLeg(c)),
    [builderParlays.data]
  );
  const teamCons = useMemo(
    () => (builderParlays.data ?? []).filter((c) => hasTeamLeg(c)),
    [builderParlays.data]
  );

  const latestRun = useMemo(() => selectLatestRun(playerCons, 4), [playerCons]);
  const latestTeamRun = useMemo(() => selectLatestRun(teamCons, 4), [teamCons]);

  // Each section resolves games from its OWN run's date (player run and team run
  // are typically different days), so matchups + settlement dates are correct.
  const builderGames = usePlaystatGames(runDate(latestRun));
  const builderGamesById = useMemo(() => {
    const map = new Map<number, PlaystatGame>();
    for (const game of builderGames.data ?? []) map.set(game.game_id, game);
    return map;
  }, [builderGames.data]);

  const teamGames = usePlaystatGames(runDate(latestTeamRun));
  const teamGamesById = useMemo(() => {
    const map = new Map<number, PlaystatGame>();
    for (const game of teamGames.data ?? []) map.set(game.game_id, game);
    return map;
  }, [teamGames.data]);

  // Dev-only: `?demo=builder-team` reveals the real latest team run even when it
  // is fully past, so the real team card can be driven in the browser.
  const [revealTeam, setRevealTeam] = useState(false);
  useEffect(() => {
    if (
      process.env.NODE_ENV !== 'production' &&
      new URLSearchParams(window.location.search).get('demo') === 'builder-team'
    ) {
      setRevealTeam(true);
    }
  }, []);

  const builderConstructions = useMemo(() => {
    if (latestRun.length === 0) return [];
    if (!builderGames.data) return []; // wait for the run's games before deciding
    if (isRunFullyPast(latestRun, builderGamesById)) return []; // hide a stale past run
    return latestRun;
  }, [latestRun, builderGames.data, builderGamesById]);

  // Slate cards are fed by the builder feed (frozen /edges + /game-predictions retired).
  // Suppress player legs already shown in the rendered low-risk section.
  const shownKeys = useMemo(() => playerLegKeys(builderConstructions), [builderConstructions]);
  const slatePlayerLegsByGame = useMemo(
    () => playerLegsByGame(playerCons, shownKeys),
    [playerCons, shownKeys]
  );
  const slateFirstInningByGame = useMemo(
    () => firstInningLegByGame(teamCons),
    [teamCons]
  );

  const teamConstructions = useMemo(() => {
    if (latestTeamRun.length === 0) return [];
    if (!teamGames.data) return [];
    if (!revealTeam && isRunFullyPast(latestTeamRun, teamGamesById)) return [];
    return latestTeamRun;
  }, [latestTeamRun, teamGames.data, teamGamesById, revealTeam]);

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

      <p className="text-sm font-medium text-muted">Low-risk builder parlays</p>
      {builderConstructions.length === 0 ? (
        <p className="text-sm text-muted">
          No builder parlays yet — Playstat precomputes the low-risk parlay each evening.
        </p>
      ) : (
        <div className="space-y-3">
          {builderConstructions.map((construction) => (
            <BuilderParlayCard
              key={construction.parlay_id}
              construction={construction}
              gamesById={builderGamesById}
              remainingBudget={bettingPeriod?.remaining}
            />
          ))}
        </div>
      )}

      <div>
        <p className="text-sm font-medium text-muted">
          Team markets (NRFI/F5) — higher variance
        </p>
        <p className="text-xs text-muted">
          ~30–50% to hit · logs as paper, won&apos;t auto-settle.
        </p>
      </div>
      {teamConstructions.length === 0 ? (
        <p className="text-sm text-muted">
          No team-market parlays in tonight&apos;s build — the team tier is often empty.
        </p>
      ) : (
        <div className="space-y-3">
          {teamConstructions.map((construction) => (
            <BuilderParlayCard
              key={construction.parlay_id}
              construction={construction}
              gamesById={teamGamesById}
              remainingBudget={bettingPeriod?.remaining}
              variant="variance"
            />
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
            playerLegs={slatePlayerLegsByGame.get(game.game_id) ?? []}
            firstInningLeg={slateFirstInningByGame.get(game.game_id)}
          />
        ))}
      </div>
    </div>
  );
}
