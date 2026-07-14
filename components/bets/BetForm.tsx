'use client';

import { useState } from 'react';

import { BetLegInput, BetType } from '@/lib/api';
import { useCreateBet, usePlaystatEdges, usePlaystatSlate } from '@/lib/queries';
import { PlaystatEdge } from '@/lib/playstat';

interface LegDraft {
  player_name: string;
  stat_type: string;
  line_value: string;
  side: string;
  odds: string;
}

const emptyLeg: LegDraft = { player_name: '', stat_type: '', line_value: '', side: '', odds: '' };

export function BetForm({ onDone }: { onDone: () => void }) {
  const createBet = useCreateBet();
  const slate = usePlaystatSlate();
  const tonightsEdges = usePlaystatEdges(slate.data?.date);

  const [sportsbook, setSportsbook] = useState('');
  const [betType, setBetType] = useState<BetType>('single');
  const [stake, setStake] = useState('');
  const [potentialPayout, setPotentialPayout] = useState('');
  const [legs, setLegs] = useState<LegDraft[]>([]);
  const [error, setError] = useState<string | null>(null);

  const updateLeg = (index: number, field: keyof LegDraft, value: string) => {
    setLegs((prev) => prev.map((leg, i) => (i === index ? { ...leg, [field]: value } : leg)));
  };

  const addLegFromEdge = (edge: PlaystatEdge) => {
    setLegs((prev) => [
      ...prev,
      {
        player_name: edge.player_name,
        stat_type: edge.stat_type,
        line_value: String(edge.line_value),
        side: edge.side,
        odds: String(edge.odds),
      },
    ]);
  };

  const submit = () => {
    setError(null);
    const stakeNum = parseFloat(stake);
    const payoutNum = parseFloat(potentialPayout);
    if (!sportsbook || Number.isNaN(stakeNum) || Number.isNaN(payoutNum)) {
      setError('Sportsbook, stake, and potential payout are required.');
      return;
    }

    const legInputs: BetLegInput[] = legs.map((leg) => ({
      player_name: leg.player_name || undefined,
      stat_type: leg.stat_type || undefined,
      line_value: leg.line_value ? parseFloat(leg.line_value) : undefined,
      side: leg.side || undefined,
      odds: leg.odds ? parseInt(leg.odds, 10) : undefined,
    }));

    createBet.mutate(
      { sportsbook, bet_type: betType, stake: stakeNum, potential_payout: payoutNum, legs: legInputs },
      {
        onSuccess: onDone,
        onError: (err) => setError(String(err.message ?? err)),
      }
    );
  };

  return (
    <div className="rounded-xl border border-border p-4 space-y-3">
      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-muted mb-1">Sportsbook</label>
          <input
            className="w-full rounded-lg border border-border bg-transparent px-3 py-2 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            placeholder="DraftKings"
            value={sportsbook}
            onChange={(e) => setSportsbook(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-xs text-muted mb-1">Bet type</label>
          <select
            className="w-full rounded-lg border border-border bg-transparent px-3 py-2 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            value={betType}
            onChange={(e) => setBetType(e.target.value as BetType)}
          >
            <option value="single">single</option>
            <option value="parlay">parlay</option>
          </select>
        </div>
        <div>
          <label className="block text-xs text-muted mb-1">Stake ($)</label>
          <input
            className="w-full rounded-lg border border-border bg-transparent px-3 py-2 text-sm font-mono tabular-nums focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            placeholder="25"
            value={stake}
            onChange={(e) => setStake(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-xs text-muted mb-1">Potential payout ($)</label>
          <input
            className="w-full rounded-lg border border-border bg-transparent px-3 py-2 text-sm font-mono tabular-nums focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            placeholder="75"
            value={potentialPayout}
            onChange={(e) => setPotentialPayout(e.target.value)}
          />
        </div>
      </div>

      {tonightsEdges.data && tonightsEdges.data.length > 0 && (
        <div className="rounded-lg bg-surface p-3">
          <p className="text-xs text-muted mb-2">Tonight&apos;s edges (from playstat)</p>
          <div className="space-y-1">
            {tonightsEdges.data.map((edge) => (
              <div
                key={`${edge.player_id}-${edge.game_id}-${edge.stat_type}`}
                className="flex items-center justify-between text-sm"
              >
                <span>
                  {edge.player_name} {edge.side} {edge.line_value} {edge.stat_type}{' '}
                  <span className="text-muted font-mono tabular-nums">
                    ({edge.odds > 0 ? '+' : ''}
                    {edge.odds})
                  </span>
                </span>
                <button
                  className="text-xs text-accent hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent rounded"
                  onClick={() => addLegFromEdge(edge)}
                >
                  + Add to bet
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-muted">Legs</span>
          <button
            className="text-sm text-accent hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent rounded"
            onClick={() => setLegs((prev) => [...prev, { ...emptyLeg }])}
          >
            + Add leg
          </button>
        </div>

        {legs.map((leg, index) => (
          <div key={index} className="rounded-lg border border-border p-3 mb-2 space-y-2">
            <input
              className="w-full rounded-lg border border-border bg-transparent px-3 py-2 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
              placeholder="Player name"
              value={leg.player_name}
              onChange={(e) => updateLeg(index, 'player_name', e.target.value)}
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                className="rounded-lg border border-border bg-transparent px-3 py-2 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                placeholder="Stat (points)"
                value={leg.stat_type}
                onChange={(e) => updateLeg(index, 'stat_type', e.target.value)}
              />
              <input
                className="rounded-lg border border-border bg-transparent px-3 py-2 text-sm font-mono tabular-nums focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                placeholder="Line (27.5)"
                value={leg.line_value}
                onChange={(e) => updateLeg(index, 'line_value', e.target.value)}
              />
              <input
                className="rounded-lg border border-border bg-transparent px-3 py-2 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                placeholder="Side (over)"
                value={leg.side}
                onChange={(e) => updateLeg(index, 'side', e.target.value)}
              />
              <input
                className="rounded-lg border border-border bg-transparent px-3 py-2 text-sm font-mono tabular-nums focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                placeholder="Odds (-115)"
                value={leg.odds}
                onChange={(e) => updateLeg(index, 'odds', e.target.value)}
              />
            </div>
            <button
              className="text-xs text-red-600 dark:text-red-400 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent rounded"
              onClick={() => setLegs((prev) => prev.filter((_, i) => i !== index))}
            >
              Remove leg
            </button>
          </div>
        ))}
      </div>

      <button
        className="w-full rounded-lg bg-primary text-primary-ink text-sm font-medium py-2.5 disabled:opacity-50 transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        onClick={submit}
        disabled={createBet.isPending}
      >
        {createBet.isPending ? 'Logging...' : 'Log bet'}
      </button>
    </div>
  );
}
