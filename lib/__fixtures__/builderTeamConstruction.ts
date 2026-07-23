import { PlaystatBuilderConstruction } from '../playstat';

/** Synthetic construction with team (NRFI/F5) legs. Real /parlay-builder/saved
 *  data is 100% player props today — team lines price near coin-flip and rarely
 *  clear Playstat's favorite floor — so this fixture exercises the team branch in
 *  unit tests and via the ?demo=builder-team dev path. */
export const builderTeamConstruction: PlaystatBuilderConstruction = {
  parlay_id: 999001,
  created_at: '2026-07-22 13:02:10.000000-04:00',
  target_payout: 1.4,
  joint_prob: 0.62,
  combined_odds: 1.42,
  n_legs: 2,
  legs: [
    {
      kind: 'team',
      game_id: 100823110,
      label: 'first_inning_runs under 0.5',
      side: 'under',
      line: 0.5,
      odds: -120,
      market_prob: 0.58,
      model_prob: null,
      player_id: null,
      stat_type: null,
      market: 'first_inning_runs',
    },
    {
      kind: 'team',
      game_id: 100824083,
      label: 'f5_runs under 4.5',
      side: 'under',
      line: 4.5,
      odds: -110,
      market_prob: 0.55,
      model_prob: null,
      player_id: null,
      stat_type: null,
      market: 'f5_runs',
    },
  ],
};
