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
    return { text: 'Pending', className: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300' };
  }
  if (bet.status === 'won') {
    return {
      text: `Won +$${(bet.net_result ?? 0).toFixed(0)}`,
      className: 'bg-green-50 text-green-800 dark:bg-green-950 dark:text-green-200',
    };
  }
  if (bet.status === 'lost') {
    return {
      text: `Lost $${Math.abs(bet.net_result ?? 0).toFixed(0)}`,
      className: 'bg-red-50 text-red-800 dark:bg-red-950 dark:text-red-200',
    };
  }
  return { text: bet.status, className: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300' };
}

export function RecentBetsList({ bets }: { bets: Bet[] }) {
  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-800 p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium">Recent bets</span>
        <Link
          href="/bets"
          className="text-sm px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900"
        >
          View all
        </Link>
      </div>

      {bets.length === 0 && <p className="text-sm text-gray-400">No bets logged yet.</p>}

      {bets.slice(0, 5).map((bet) => {
        const badge = statusBadge(bet);
        const summary = legsSummary(bet);
        return (
          <div
            key={bet.bet_id}
            className="flex items-center justify-between py-2 border-t border-gray-100 dark:border-gray-800 first:border-t-0"
          >
            <div className="pr-2 min-w-0">
              <p className="text-sm capitalize truncate">
                {bet.sportsbook} {bet.bet_type}
              </p>
              {summary && <p className="text-xs text-gray-400 truncate">{summary}</p>}
            </div>
            <span className={`text-xs px-2 py-1 rounded whitespace-nowrap ${badge.className}`}>
              {badge.text}
            </span>
          </div>
        );
      })}
    </div>
  );
}
