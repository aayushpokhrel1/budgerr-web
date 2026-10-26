@AGENTS.md

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

Rules:
- For codebase questions, first run `graphify query "<question>"` when graphify-out/graph.json exists. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).

## Where things are written down

Budgerr is **three separate repos** under one folder: `Budgerr/` (this one is the umbrella repo, a sibling of this one),
`budgerr-app/` and `budgerr-web/`. A change that spans them is several commits in several repos,
so say which repo a decision belongs to before writing it down.

| File | What it holds |
| --- | --- |
| `README.md` | What the web app is, the stack, how to run it |
| `PRODUCT.md` | Product truth: who it is for, decisions, roadmap, what is deferred and why |
| `DESIGN.md` | The visual system: tokens, type, colour, component patterns |
| `docs/OPERATIONS.md` | Run, verify, environment, deploy, and the traps with teeth |
| `docs/superpowers/specs/` | The design of one feature, written before building it. `YYYY-MM-DD-<feature>.md` |
| `docs/superpowers/plans/` | The task breakdown for one feature. Same naming |
| `AGENTS.md` | Agent instructions; keep it and CLAUDE.md consistent |
| `CLAUDE.md` | This file |

**Verify with `npm run lint && npm test && npm run build`.** CI runs all three in that order
(lint and test first, since the build is much slower). `docs/OPERATIONS.md` has the traps
that remain, including the one that matters most here: vitest only collects
`lib/**/*.test.ts`, so a test file placed anywhere else is silently never run.

There is no `HANDOVER.md` here. If one is ever added it holds **current state only**: where
things stand, what is half-done, what is next. Before adding a line to any such file, ask: will
this still be true in a month? If yes it belongs in one of the docs above, or in the vault.
`lib/handover.budget.test.ts` is a tripwire that holds that rule the moment the file appears:
it fails over 200 lines or on a dated heading, and the answer when it goes red is to move
content to its home, never to raise the limit.

## When Aayush says "update"

"Update the docs", "update everything", or just "update" means **all of it, in this turn**:

1. **The knowledge vault** - `C:\Users\aayus\Documents\Knowledge-Vault\Projects\Budgerr\`
   (the path is per-machine). `Projects/Budgerr/index.md` exists and is linked from the vault's
   `Projects/index.md`, so append to it. Use ONE folder for all three repos, and name the repo
   in each note. Add what this session learned that is worth keeping: a decision and its WHY, a
   non-obvious gotcha or fix, a cross-project learning. This is the part that gets forgotten,
   and it is the part that compounds.
2. **Every doc in this repo**, not only the one already open, and the sibling repos if the change
   reached them.

**Vault writes go through WSL, and note content must never appear on the command line.** The Bash
tool re-quotes the wrapper, so backticks and apostrophes inside a note get executed or break the
command. Write the note to a file first, then pass only literal paths.

**Write a script FILE and run that; a `bash -lc '...'` one-liner breaks two ways**, both
confirmed on 2026-10-21:

- `$VAR` and backslash-escapes inside the single quotes are mangled by the re-quoting. A
  `V=/mnt/c/...` assignment followed by `"$V/index.md"` arrived as the literal `/index.md` and
  every write failed to open its file.
- Git Bash rewrites `/mnt/...` arguments into Windows paths, producing
  `bash: C:/Program Files/Git/mnt/c/...: No such file or directory`.

```
MSYS_NO_PATHCONV=1 MSYS2_ARG_CONV_EXCL='*' wsl -d Ubuntu -- bash /mnt/c/<tmp>/vault-write.sh
```

Inside that script, edit an existing note with `python3` and a heredoc rather than `sed`: a
wikilink is full of `[`, `|` and `\` that sed treats as syntax, and python lets you assert you
matched exactly one line before rewriting, so a missed match fails instead of silently doing
nothing.

**Updating docs means making them TRUE, not just appending what shipped.** Correct or strike a
stale claim where it sits rather than adding a newer entry underneath it, because the next reader
may hit the old one first. Cross-check every number against reality instead of trusting the file.

## Where knowledge goes

A lesson has exactly one home, chosen by how far it reaches:

- **A rule about specific code goes in a comment AT that code.** The most reliable form there is:
  you cannot edit the function without reading the warning above it.
- **A lesson that generalises goes in the vault**, phrased so it is useful on a different
  project, with this one as the example.
- **A dated narrative of what you did today goes in `git log`.** It is already there, in detail.

Keep any one lesson in a single place. Two copies drift, and the drift causes wrong work later.
