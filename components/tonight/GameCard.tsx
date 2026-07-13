import { PlaystatEdge, PlaystatGame } from '@/lib/playstat';

function statusLabel(status: string | null): string {
  if (!status || status === 'NS') return 'Upcoming';
  if (status === 'FT' || status === 'AOT') return 'Final';
  return status;
}

export function GameCard({ game, edges }: { game: PlaystatGame; edges: PlaystatEdge[] }) {
  const label = statusLabel(game.status);
  const isFinal = label === 'Final';

  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-800 p-4">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-medium truncate">
          {game.away_team_name} @ {game.home_team_name}
        </span>
        <span
          className={
            isFinal
              ? 'text-xs font-medium px-2 py-1 rounded bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 whitespace-nowrap'
              : 'text-xs font-medium px-2 py-1 rounded bg-gray-100 dark:bg-gray-800 text-blue-600 dark:text-blue-400 whitespace-nowrap'
          }
        >
          {label}
        </span>
      </div>

      {edges.length > 0 && (
        <div className="mt-2 space-y-1">
          {edges.map((edge) => (
            <p key={`${edge.player_id}-${edge.stat_type}`} className="text-xs text-gray-500 dark:text-gray-400 truncate">
              {edge.player_name} {edge.side} {edge.line_value} {edge.stat_type}{' '}
              <span className="text-blue-600 dark:text-blue-400">
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
