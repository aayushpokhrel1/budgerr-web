import { PlaystatEdge, PlaystatGame, PlaystatGamePrediction } from '@/lib/playstat';

function statusLabel(status: string | null): string {
  if (!status || status === 'NS' || status === 'S') return 'Upcoming';
  if (status === 'FT' || status === 'AOT') return 'Final';
  return status;
}

export function GameCard({
  game,
  edges,
  firstInning,
}: {
  game: PlaystatGame;
  edges: PlaystatEdge[];
  firstInning?: PlaystatGamePrediction;
}) {
  const label = statusLabel(game.status);
  const isFinal = label === 'Final';

  return (
    <div className="rounded-xl border border-border p-4">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-medium truncate">
          {game.away_team_name} @ {game.home_team_name}
        </span>
        <span
          className={
            isFinal
              ? 'text-xs font-medium px-2 py-1 rounded bg-surface text-muted whitespace-nowrap'
              : 'text-xs font-medium px-2 py-1 rounded bg-surface text-accent whitespace-nowrap'
          }
        >
          {label}
        </span>
      </div>

      {firstInning && (
        <p className="mt-2 text-xs text-muted">
          1st inning under {firstInning.line_value} runs:{' '}
          <span className="font-medium text-emerald-600 dark:text-emerald-400 font-mono tabular-nums">
            {Math.round(firstInning.prob_under * 100)}%
          </span>
          {firstInning.book_under_odds != null && (
            <span className="font-mono tabular-nums">
              {' '}· book {firstInning.book_under_odds > 0 ? '+' : ''}
              {firstInning.book_under_odds} u{firstInning.book_line_value}
            </span>
          )}
        </p>
      )}

      {edges.length > 0 && (
        <div className="mt-2 space-y-1">
          {edges.map((edge) => (
            <p key={`${edge.player_id}-${edge.stat_type}`} className="text-xs text-muted truncate">
              {edge.player_name} {edge.side} {edge.line_value} {edge.stat_type}{' '}
              <span className="text-accent font-mono tabular-nums">
                ({edge.odds > 0 ? '+' : ''}
                {edge.odds})
              </span>
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
