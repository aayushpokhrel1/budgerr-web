'use client';

import { useState } from 'react';

import { Bet, BetStatus } from '@/lib/api';
import { useSettleBet } from '@/lib/queries';

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
  return {
    text: `${bet.status}${bet.net_result != null ? ` $${bet.net_result.toFixed(0)}` : ''}`,
    className: 'bg-surface text-muted',
    mono: true,
  };
}

function SettleControls({ betId }: { betId: number }) {
  const settleBet = useSettleBet();
  const [status, setStatus] = useState<BetStatus>('won');
  const [netResult, setNetResult] = useState('');

  const submit = () => {
    const value = parseFloat(netResult);
    if (Number.isNaN(value)) return;
    settleBet.mutate({ betId, status, netResult: value });
  };

  return (
    <div className="flex items-center gap-2 mt-2">
      <select
        className="rounded-lg border border-border bg-transparent px-2 py-1.5 text-xs focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        value={status}
        onChange={(e) => setStatus(e.target.value as BetStatus)}
      >
        <option value="won">won</option>
        <option value="lost">lost</option>
        <option value="push">push</option>
        <option value="cashed_out">cashed out</option>
      </select>
      <input
        className="w-24 rounded-lg border border-border bg-transparent px-2 py-1.5 text-xs font-mono tabular-nums focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        placeholder="net $"
        value={netResult}
        onChange={(e) => setNetResult(e.target.value)}
      />
      <button
        className="text-xs px-3 py-1.5 rounded-lg bg-primary text-primary-ink disabled:opacity-50 transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        onClick={submit}
        disabled={settleBet.isPending}
      >
        Settle
      </button>
    </div>
  );
}

export function BetRow({ bet }: { bet: Bet }) {
  const badge = statusBadge(bet);
  const summary = legsSummary(bet);

  return (
    <div className="py-3 border-t border-border first:border-t-0">
      <div className="flex items-center justify-between">
        <div className="min-w-0">
          <p className="text-sm capitalize">
            {bet.sportsbook} {bet.bet_type} —{' '}
            <span className="font-mono tabular-nums">
              ${bet.stake.toFixed(0)} to win ${(bet.potential_payout - bet.stake).toFixed(0)}
            </span>
          </p>
          {summary && <p className="text-xs text-muted truncate">{summary}</p>}
        </div>
        <span
          className={`text-xs px-2 py-1 rounded whitespace-nowrap ${badge.className} ${badge.mono ? 'font-mono tabular-nums' : ''}`}
        >
          {badge.text}
        </span>
      </div>
      {bet.status === 'pending' && <SettleControls betId={bet.bet_id} />}
    </div>
  );
}
