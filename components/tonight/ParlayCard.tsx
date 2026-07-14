import { PlaystatParlayRecommendation } from '@/lib/playstat';

export function ParlayCard({ parlay }: { parlay: PlaystatParlayRecommendation }) {
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
    </div>
  );
}
