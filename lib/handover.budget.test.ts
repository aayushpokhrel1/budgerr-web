// Keeps a HANDOVER.md, if this repo ever gets one, a current-state note rather than a log.
//
// This file lives in lib/ ON PURPOSE. vitest.config.ts sets
// include: ['lib/**/*.test.ts'], so a test placed beside the docs it guards, or in a
// tests/ directory, is silently never collected and npm test passes without running it.
// If you move this file, widen that glob in the same change.
//
// There is deliberately no HANDOVER.md in this repo today (see CLAUDE.md), so this is a
// tripwire, not a live check: it does nothing until someone adds the file, and then it
// holds them to the rule CLAUDE.md already states. The fix when it goes red is ALWAYS to
// move content to its real home (README / PRODUCT / DESIGN / docs/OPERATIONS / the vault),
// never to raise MAX.
//
// The reason: the same file on a sibling project (FamilyRecipes) reached 1,365 lines by
// accumulating everything, started contradicting itself, and a session then acted on a
// superseded line and re-proposed a change that same file recorded as already tried and
// rejected. A doc asking for brevity does not get it.
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, test } from 'vitest';

const MAX_LINES = 200;

// lib/ -> repo root. Resolved from this file rather than process.cwd(), so the check does
// not quietly start reading nothing when vitest is invoked from another directory.
const HANDOVER = join(__dirname, '..', 'HANDOVER.md');

const DATED_HEADING = /^#{1,4} .*\d{4}-\d{2}-\d{2}/;

describe('HANDOVER.md', () => {
  test('stays a current-state note, not an accumulating log', () => {
    if (!existsSync(HANDOVER)) return; // gitignored and absent by design: nothing to check

    const lines = readFileSync(HANDOVER, 'utf8').split('\n');

    expect(
      lines.length,
      `HANDOVER.md is ${lines.length} lines (max ${MAX_LINES}). Move content to its home, do not raise MAX_LINES.`,
    ).toBeLessThanOrEqual(MAX_LINES);

    const dated = lines.filter((l) => DATED_HEADING.test(l));
    expect(
      dated,
      `dated headings belong in git log, not the handover: ${JSON.stringify(dated)}`,
    ).toEqual([]);
  });

  test('the dated-heading pattern actually matches one', () => {
    // Negative control. Without this, a typo in the regex above makes the real check
    // vacuously pass forever, which is the failure mode this whole file exists to prevent.
    expect(DATED_HEADING.test('## 2026-10-22 what I did today')).toBe(true);
    expect(DATED_HEADING.test('## Current state')).toBe(false);
  });
});
