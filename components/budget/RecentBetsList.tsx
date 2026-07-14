import Link from 'next/link';

import { Bet } from '@/lib/api';

function legsSummary(bet: Bet): string | null {
  if (bet.legs.length === 0) return null;
  return bet.legs
    .map((leg) => [leg.player_name, leg.side, leg.line_value, leg.stat_type].filter(Boolean).join(' '))
    .join(', ');
}

function statusBadge(bet: Bet) {
  if (bet.status === 'pending') {
    return { text: 'Pending', className: 'bg-surface text-muted', mono: false };
  }
  if (bet.status === 'won') {
    return {
      text: `Won +$${(bet.net_result ?? 0).toFixed(0)}`,
      className: 'bg-green-50 text-green-800 dark:bg-green-950 dark:text-green-200',
      mono: true,
    };
  }
  if (bet.status === 'lost') {
    return {
      text: `Lost $${Math.abs(bet.net_result ?? 0).toFixed(0)}`,
      className: 'bg-red-50 text-red-800 dark:bg-red-950 dark:text-red-200',
      mono: true,
    };
  }
  return { text: bet.status, className: 'bg-surface text-muted', mono: false };
}

export function RecentBetsList({ bets }: { bets: Bet[] }) {
  return (
    <div className="rounded-xl border border-border p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium">Recent bets</span>
        <Link
          href="/bets"
          className="text-sm text-accent hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent rounded"
        >
          View all
        </Link>
      </div>

      {bets.length === 0 && <p className="text-sm text-muted">No bets logged yet.</p>}

      {bets.slice(0, 5).map((bet) => {
        const badge = statusBadge(bet);
        const summary = legsSummary(bet);
        return (
          <div
            key={bet.bet_id}
            className="flex items-center justify-between py-2 border-t border-border first:border-t-0"
          >
            <div className="pr-2 min-w-0">
              <p className="text-sm capitalize truncate">
                {bet.sportsbook} {bet.bet_type}
              </p>
              {summary && <p className="text-xs text-muted truncate">{summary}</p>}
            </div>
            <span
              className={`text-xs px-2 py-1 rounded whitespace-nowrap ${badge.className} ${badge.mono ? 'font-mono tabular-nums' : ''}`}
            >
              {badge.text}
            </span>
          </div>
        );
      })}
    </div>
  );
}
