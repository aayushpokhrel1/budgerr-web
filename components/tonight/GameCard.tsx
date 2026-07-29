import { PlaystatBuilderPlayerLeg, PlaystatBuilderTeamLeg, PlaystatGame } from '@/lib/playstat';
import { marketLabel, playerNameFromLabel } from '@/lib/builderParlays';

function statusLabel(status: string | null): string {
  if (!status || status === 'NS' || status === 'S') return 'Upcoming';
  if (status === 'FT' || status === 'AOT') return 'Final';
  return status;
}

export function GameCard({
  game,
  playerLegs,
  firstInningLeg,
}: {
  game: PlaystatGame;
  playerLegs: PlaystatBuilderPlayerLeg[];
  firstInningLeg?: PlaystatBuilderTeamLeg;
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

      {firstInningLeg && (
        <p className="mt-2 text-xs text-muted">
          {marketLabel(firstInningLeg.market)} {firstInningLeg.side} {firstInningLeg.line}:{' '}
          <span className="font-medium text-muted font-mono tabular-nums">
            {Math.round(firstInningLeg.market_prob * 100)}%
          </span>
          <span className="text-accent font-mono tabular-nums">
            {' '}({firstInningLeg.odds > 0 ? '+' : ''}
            {firstInningLeg.odds})
          </span>
        </p>
      )}

      {playerLegs.length > 0 && (
        <div className="mt-2 space-y-1">
          {playerLegs.map((leg) => (
            <p
              key={`${leg.player_id}-${leg.stat_type}-${leg.side}-${leg.line}`}
              className="text-xs text-muted truncate"
            >
              {playerNameFromLabel(leg)} {leg.side} {leg.line} {leg.stat_type}{' '}
              <span className="text-accent font-mono tabular-nums">
                ({leg.odds > 0 ? '+' : ''}
                {leg.odds})
              </span>
            </p>
          ))}
        </div>
      )}
    </div>
  );
}
