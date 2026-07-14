'use client';

import { useState } from 'react';

import {
  BetAnalyticsCalibrationBucket,
  BetAnalyticsGroup,
  BetAnalyticsScope,
  BetAnalyticsStatGroup,
} from '@/lib/api';
import { useBetAnalytics } from '@/lib/queries';

function fmtMoney(value: number): string {
  const sign = value < 0 ? '-' : '';
  return `${sign}$${Math.abs(value).toFixed(2)}`;
}

function fmtPct(value: number | null, digits = 1): string {
  if (value === null || value === undefined) return '—';
  return `${(value * 100).toFixed(digits)}%`;
}

function netProfitClass(value: number): string {
  if (value > 0) return 'text-green-700 dark:text-green-400';
  if (value < 0) return 'text-red-700 dark:text-red-400';
  return 'text-muted';
}

function GroupTable({ title, rows, emptyLabel }: { title: string; rows: BetAnalyticsGroup[]; emptyLabel: string }) {
  return (
    <div className="rounded-xl border border-border p-4 space-y-3">
      <h2 className="text-base font-medium">{title}</h2>
      {rows.length === 0 ? (
        <p className="text-sm text-muted">{emptyLabel}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-muted border-b border-border">
                <th className="py-2 pr-3 font-medium capitalize">{title.replace('By ', '')}</th>
                <th className="py-2 pr-3 font-medium text-right">Settled</th>
                <th className="py-2 pr-3 font-medium text-right">W-L-P</th>
                <th className="py-2 pr-3 font-medium text-right">Staked</th>
                <th className="py-2 pr-3 font-medium text-right">Net</th>
                <th className="py-2 font-medium text-right">ROI</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.key} className="border-b border-border last:border-b-0">
                  <td className="py-2 pr-3 capitalize">{row.key}</td>
                  <td className="py-2 pr-3 text-right font-mono tabular-nums">{row.settled}</td>
                  <td className="py-2 pr-3 text-right font-mono tabular-nums">
                    {row.wins}-{row.losses}-{row.pushes}
                  </td>
                  <td className="py-2 pr-3 text-right font-mono tabular-nums">{fmtMoney(row.total_staked)}</td>
                  <td className={`py-2 pr-3 text-right font-mono tabular-nums ${netProfitClass(row.net_profit)}`}>
                    {fmtMoney(row.net_profit)}
                  </td>
                  <td className="py-2 text-right font-mono tabular-nums">{fmtPct(row.roi, 2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function StatTypeTable({ rows }: { rows: BetAnalyticsStatGroup[] }) {
  return (
    <div className="rounded-xl border border-border p-4 space-y-3">
      <h2 className="text-base font-medium">By stat type</h2>
      {rows.length === 0 ? (
        <p className="text-sm text-muted">No settled legs yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-muted border-b border-border">
                <th className="py-2 pr-3 font-medium capitalize">Stat</th>
                <th className="py-2 pr-3 font-medium text-right">Legs</th>
                <th className="py-2 pr-3 font-medium text-right">W-L-P</th>
                <th className="py-2 font-medium text-right">Hit rate</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.key} className="border-b border-border last:border-b-0">
                  <td className="py-2 pr-3 capitalize">{row.key}</td>
                  <td className="py-2 pr-3 text-right font-mono tabular-nums">{row.legs}</td>
                  <td className="py-2 pr-3 text-right font-mono tabular-nums">
                    {row.won}-{row.lost}-{row.pushed}
                  </td>
                  <td className="py-2 text-right font-mono tabular-nums">{fmtPct(row.hit_rate)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function CalibrationBar({ label, value }: { label: string; value: number | null }) {
  const pct = value === null ? 0 : Math.max(0, Math.min(1, value)) * 100;
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-muted w-16 shrink-0">{label}</span>
      <div className="flex-1 h-2 rounded-full bg-surface overflow-hidden">
        <div
          className={label === 'Predicted' ? 'h-full bg-accent' : 'h-full bg-primary'}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs font-mono tabular-nums w-12 text-right shrink-0">{fmtPct(value)}</span>
    </div>
  );
}

function CalibrationBucketRow({ bucket }: { bucket: BetAnalyticsCalibrationBucket }) {
  return (
    <div className="py-3 border-t border-border first:border-t-0 space-y-1.5">
      <div className="flex items-center justify-between text-xs text-muted">
        <span className="font-mono tabular-nums">
          {fmtPct(bucket.lo, 0)}–{fmtPct(bucket.hi, 0)}
        </span>
        <span className="font-mono tabular-nums">{bucket.legs} legs</span>
      </div>
      <CalibrationBar label="Predicted" value={bucket.predicted} />
      <CalibrationBar label="Actual" value={bucket.actual} />
    </div>
  );
}

const scopes: BetAnalyticsScope[] = ['real', 'paper'];

export default function AnalyticsPage() {
  const [scope, setScope] = useState<BetAnalyticsScope>('real');
  const analytics = useBetAnalytics(scope);

  const overall = analytics.data?.overall;
  const hasSettled = (overall?.settled ?? 0) > 0;

  return (
    <div className="max-w-3xl space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-medium">Analytics</h1>
        <div className="inline-flex rounded-lg border border-border p-0.5">
          {scopes.map((s) => (
            <button
              key={s}
              onClick={() => setScope(s)}
              className={`text-xs px-3 py-1.5 rounded-md capitalize transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
                scope === s ? 'bg-primary text-primary-ink font-medium' : 'text-muted hover:text-foreground'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {analytics.isLoading && <p className="text-sm text-muted">Loading...</p>}

      {analytics.data && !hasSettled && (
        <div className="rounded-xl border border-border p-4">
          <p className="text-sm text-muted">No settled bets yet — analytics appear once bets settle.</p>
        </div>
      )}

      {analytics.data && hasSettled && overall && (
        <>
          <div className="rounded-xl border border-border p-4">
            <h2 className="text-base font-medium mb-3">Overall</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-muted">Settled</p>
                <p className="text-lg font-mono tabular-nums">{overall.settled}</p>
              </div>
              <div>
                <p className="text-xs text-muted">Record (W-L-P)</p>
                <p className="text-lg font-mono tabular-nums">
                  {overall.wins}-{overall.losses}-{overall.pushes}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted">Total staked</p>
                <p className="text-lg font-mono tabular-nums">{fmtMoney(overall.total_staked)}</p>
              </div>
              <div>
                <p className="text-xs text-muted">Net profit</p>
                <p className={`text-lg font-mono tabular-nums ${netProfitClass(overall.net_profit)}`}>
                  {fmtMoney(overall.net_profit)}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted">ROI</p>
                <p className="text-lg font-mono tabular-nums">{fmtPct(overall.roi, 2)}</p>
              </div>
            </div>
          </div>

          <GroupTable title="By sportsbook" rows={analytics.data.by_sportsbook} emptyLabel="No settled bets yet." />
          <GroupTable title="By bet type" rows={analytics.data.by_bet_type} emptyLabel="No settled bets yet." />
          <StatTypeTable rows={analytics.data.by_stat_type} />

          <div className="rounded-xl border border-border p-4 space-y-3">
            <h2 className="text-base font-medium">Calibration</h2>
            {analytics.data.calibration.legs === 0 ? (
              <p className="text-sm text-muted">No settled legs with a modeled probability yet.</p>
            ) : (
              <>
                <div className="space-y-1.5 pb-3 border-b border-border">
                  <p className="text-xs text-muted">
                    Overall ({analytics.data.calibration.legs} legs)
                  </p>
                  <CalibrationBar label="Predicted" value={analytics.data.calibration.overall_predicted} />
                  <CalibrationBar label="Actual" value={analytics.data.calibration.overall_actual} />
                </div>
                {analytics.data.calibration.buckets.map((bucket, i) => (
                  <CalibrationBucketRow key={`${bucket.lo}-${bucket.hi}-${i}`} bucket={bucket} />
                ))}
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}
