import { describe, expect, it } from 'vitest';

import {
  builderConstructionToBetInput,
  distinctPlayerLegs,
  firstInningLegByGame,
  hasTeamLeg,
  isRunFullyPast,
  legDisplay,
  playerLegIdentity,
  playerLegKeys,
  playerLegsByGame,
  playerNameFromLabel,
  runDate,
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
  it('renders a player leg as "{name} {side} {line} {stat}"', () => {
    expect(legDisplay(playerConstruction(1, '2026-07-22', 0.8).legs[0], GAMES)).toBe("Ke'Bryan Hayes under 0.5 runs");
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

describe('runDate', () => {
  it('returns the created_at date of the first construction', () => {
    expect(runDate([playerConstruction(1, '2026-07-22', 0.8)])).toBe('2026-07-22');
  });
  it('returns undefined for empty input', () => {
    expect(runDate([])).toBeUndefined();
  });
});

describe('isRunFullyPast', () => {
  const gameWith = (id: number, status: string | null) => ({
    game_id: id, sport: 'MLB', date: '2026-07-22',
    home_team_id: 1, home_team_name: 'H', away_team_id: 2, away_team_name: 'A', status,
  });
  it('is true when all resolvable games are final (FT)', () => {
    const c = playerConstruction(1, '2026-07-22', 0.8); // leg game_id 100823110
    expect(isRunFullyPast([c], new Map([[100823110, gameWith(100823110, 'FT')]]))).toBe(true);
  });
  it('is false when any game is still upcoming (S)', () => {
    const c = playerConstruction(1, '2026-07-22', 0.8);
    expect(isRunFullyPast([c], new Map([[100823110, gameWith(100823110, 'S')]]))).toBe(false);
  });
  it('is false when no games resolve (cannot tell)', () => {
    expect(isRunFullyPast([playerConstruction(1, '2026-07-22', 0.8)], new Map())).toBe(false);
  });
});

function playerCon(id: number, date: string, jp: number): PlaystatBuilderConstruction {
  return {
    parlay_id: id, created_at: `${date} 09:00:00-04:00`, target_payout: 1.4,
    joint_prob: jp, combined_odds: 1.4, n_legs: 1,
    legs: [{ kind: 'player', game_id: 1, label: 'A runs over 0.5', side: 'over', line: 0.5,
      odds: -120, market_prob: 0.9, model_prob: null, player_id: 7, stat_type: 'runs', market: null }],
  };
}
function teamCon(id: number, date: string, jp: number): PlaystatBuilderConstruction {
  return {
    parlay_id: id, created_at: `${date} 09:00:00-04:00`, target_payout: 2.0,
    joint_prob: jp, combined_odds: 2.7, n_legs: 1,
    legs: [{ kind: 'team', game_id: 2, label: 'first_inning_runs under 0.5', side: 'under', line: 0.5,
      odds: -150, market_prob: 0.57, model_prob: null, player_id: null, stat_type: null, market: 'first_inning_runs' }],
  };
}

describe('tier=all client-side partition', () => {
  const feed = [
    playerCon(181, '2026-07-28', 0.92), playerCon(182, '2026-07-28', 0.90),
    teamCon(166, '2026-07-26', 0.32), teamCon(161, '2026-07-26', 0.31),
  ];

  it('splits the feed into player-only and team-only partitions', () => {
    const player = feed.filter((c) => !hasTeamLeg(c));
    const team = feed.filter((c) => hasTeamLeg(c));
    expect(player.map((c) => c.parlay_id)).toEqual([181, 182]);
    expect(team.map((c) => c.parlay_id)).toEqual([166, 161]);
  });

  it('selectLatestRun on each partition picks that partition\'s own latest run', () => {
    const player = feed.filter((c) => !hasTeamLeg(c));
    const team = feed.filter((c) => hasTeamLeg(c));
    expect(selectLatestRun(player, 4).map((c) => c.parlay_id)).toEqual([181, 182]);
    expect(selectLatestRun(team, 4).map((c) => c.parlay_id)).toEqual([166, 161]);
  });
});

function pLeg(game_id: number, player_id: number, stat: string, side: string, line: number) {
  return { kind: 'player' as const, game_id, player_id, stat_type: stat, market: null,
    label: `P${player_id} ${stat} ${side} ${line}`, side, line, odds: -120,
    market_prob: 0.9, model_prob: null };
}
function tLeg(game_id: number, market: 'first_inning_runs' | 'f5_runs', side: string, line: number) {
  return { kind: 'team' as const, game_id, player_id: null, stat_type: null, market,
    label: `${market} ${side} ${line}`, side, line, odds: -150, market_prob: 0.57, model_prob: null };
}
function con(id: number, date: string, jp: number, legs: any[]): PlaystatBuilderConstruction {
  return { parlay_id: id, created_at: `${date} 09:00:00-04:00`, target_payout: 1.4,
    joint_prob: jp, combined_odds: 1.4, n_legs: legs.length, legs };
}

describe('builder slate/quick-entry helpers', () => {
  const players = [
    con(1, '2026-07-28', 0.92, [pLeg(10, 100, 'runs', 'over', 0.5), pLeg(20, 200, 'hits', 'over', 0.5)]),
    con(2, '2026-07-28', 0.90, [pLeg(10, 100, 'runs', 'over', 0.5), pLeg(30, 300, 'rbis', 'over', 0.5)]),
    con(9, '2026-07-27', 0.99, [pLeg(40, 400, 'runs', 'over', 0.5)]), // older run, must be excluded
  ];
  const teams = [
    con(50, '2026-07-26', 0.32, [tLeg(70, 'first_inning_runs', 'under', 0.5), tLeg(80, 'f5_runs', 'under', 1.5)]),
  ];

  it('playerLegIdentity is player_id|stat|side|line', () => {
    expect(playerLegIdentity(pLeg(10, 100, 'runs', 'over', 0.5) as any)).toBe('100|runs|over|0.5');
  });

  it('playerLegKeys collects player-leg identities across constructions', () => {
    expect(playerLegKeys([players[0]])).toEqual(new Set(['100|runs|over|0.5', '200|hits|over|0.5']));
  });

  it('distinctPlayerLegs dedupes the latest run and excludes older runs', () => {
    const legs = distinctPlayerLegs(players);
    expect(legs.map((l) => l.player_id)).toEqual([100, 200, 300]); // 100 deduped; 400 (older run) gone
  });

  it('playerLegsByGame groups by game_id and honors excludeKeys', () => {
    const all = playerLegsByGame(players);
    expect([...all.keys()].sort((a, b) => a - b)).toEqual([10, 20, 30]);
    const excluded = playerLegsByGame(players, new Set(['100|runs|over|0.5']));
    expect([...excluded.keys()].sort((a, b) => a - b)).toEqual([20, 30]); // game 10 suppressed
  });

  it('firstInningLegByGame keeps only first_inning_runs legs, one per game', () => {
    const map = firstInningLegByGame(teams);
    expect([...map.keys()]).toEqual([70]); // f5 game 80 excluded
    expect(map.get(70)?.market).toBe('first_inning_runs');
  });
});
