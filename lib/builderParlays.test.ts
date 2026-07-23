import { describe, expect, it } from 'vitest';

import {
  builderConstructionToBetInput,
  hasTeamLeg,
  legDisplay,
  playerNameFromLabel,
  selectLatestRun,
} from './builderParlays';
import { builderTeamConstruction } from './__fixtures__/builderTeamConstruction';
import { PlaystatBuilderConstruction } from './playstat';

const GAMES = new Map([
  [100823110, { game_id: 100823110, sport: 'MLB', date: '2026-07-22', home_team_id: 1, home_team_name: 'Red Sox', away_team_id: 2, away_team_name: 'Yankees', status: null }],
  [100824083, { game_id: 100824083, sport: 'MLB', date: '2026-07-22', home_team_id: 3, home_team_name: 'Royals', away_team_id: 4, away_team_name: 'Guardians', status: null }],
]);

function playerConstruction(id: number, date: string, jointProb: number): PlaystatBuilderConstruction {
  return {
    parlay_id: id,
    created_at: `${date} 13:02:10.000000-04:00`,
    target_payout: 2.0,
    joint_prob: jointProb,
    combined_odds: 2.01,
    n_legs: 1,
    legs: [
      { kind: 'player', game_id: 100823110, label: "Ke'Bryan Hayes runs under 0.5", side: 'under', line: 0.5, odds: -147, market_prob: 0.66, model_prob: 0.69, player_id: 100663647, stat_type: 'runs', market: null },
    ],
  };
}

describe('playerNameFromLabel', () => {
  it('strips the "{stat} {side} {line}" suffix', () => {
    expect(playerNameFromLabel({ label: "Ke'Bryan Hayes runs under 0.5", stat_type: 'runs', side: 'under', line: 0.5 })).toBe("Ke'Bryan Hayes");
  });
  it('falls back to the raw label when the suffix does not match', () => {
    expect(playerNameFromLabel({ label: 'Weird Label', stat_type: 'runs', side: 'under', line: 0.5 })).toBe('Weird Label');
  });
});

describe('selectLatestRun', () => {
  it('keeps only the most-recent date and sorts by joint_prob desc, capped at n', () => {
    const older = playerConstruction(1, '2026-07-21', 0.9);
    const newA = playerConstruction(2, '2026-07-22', 0.5);
    const newB = playerConstruction(3, '2026-07-22', 0.8);
    const result = selectLatestRun([older, newA, newB], 4);
    expect(result.map((c) => c.parlay_id)).toEqual([3, 2]);
  });
  it('returns [] for empty input', () => {
    expect(selectLatestRun([], 4)).toEqual([]);
  });
  it('caps the latest run at n, keeping the top-n by joint_prob', () => {
    const cs = [0.5, 0.9, 0.7, 0.6, 0.8].map((p, i) => playerConstruction(10 + i, '2026-07-22', p));
    const result = selectLatestRun(cs, 4);
    expect(result.length).toBe(4);
    expect(result.map((c) => c.joint_prob)).toEqual([0.9, 0.8, 0.7, 0.6]);
  });
});

describe('legDisplay', () => {
  it('renders a team leg with the resolved matchup and market label', () => {
    expect(legDisplay(builderTeamConstruction.legs[0], GAMES)).toBe('Yankees @ Red Sox — NRFI under 0.5');
  });
  it('renders a team leg without matchup when the game is missing', () => {
    expect(legDisplay(builderTeamConstruction.legs[0], new Map())).toBe('NRFI under 0.5');
  });
  it('renders a player leg as "{name} {side} {stat}"', () => {
    expect(legDisplay(playerConstruction(1, '2026-07-22', 0.8).legs[0], GAMES)).toBe("Ke'Bryan Hayes under runs");
  });
});

describe('builderConstructionToBetInput', () => {
  it('maps a player leg to a settleable BetLegInput and sets placed_at from the game date', () => {
    const bet = builderConstructionToBetInput(playerConstruction(1, '2026-07-22', 0.8), GAMES, 10);
    expect(bet.legs).toEqual([{ player_name: "Ke'Bryan Hayes", stat_type: 'runs', line_value: 0.5, side: 'under', odds: -147 }]);
    expect(bet.placed_at).toBe('2026-07-22T12:00:00Z');
    expect(bet.potential_payout).toBeCloseTo(20.1);
    expect(bet.is_paper).toBe(true);
  });
  it('maps team legs with market in stat_type and matchup in player_name (log-only, no game_id/market)', () => {
    const bet = builderConstructionToBetInput(builderTeamConstruction, GAMES, 10);
    expect(bet.bet_type).toBe('parlay');
    const legs = bet.legs!;
    expect(legs[0]).toEqual({ player_name: 'Yankees @ Red Sox · NRFI', stat_type: 'first_inning_runs', line_value: 0.5, side: 'under', odds: -120 });
    expect(legs[1].stat_type).toBe('f5_runs');
    expect(legs[0]).not.toHaveProperty('game_id');
    expect(bet.placed_at).toBe('2026-07-22T12:00:00Z');
    expect(bet.potential_payout).toBeCloseTo(14.2);
    expect(hasTeamLeg(builderTeamConstruction)).toBe(true);
  });
});

describe('hasTeamLeg', () => {
  it('is false for an all-player construction', () => {
    expect(hasTeamLeg(playerConstruction(1, '2026-07-22', 0.8))).toBe(false);
  });
});
