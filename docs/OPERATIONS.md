# Operations

How to run, verify, and deploy `budgerr-web`, and the traps that have real teeth.

This repo is a thin client: it has no database, no server-side session, and no business logic.
Most "it's broken" turns out to be the backend not running, CORS, or a missing API key, so
check those three before reading any component.

## Run it

```bash
npm install
cp .env.example .env.local
npm run dev
```

Serves on http://localhost:3000.

### What has to be up first

| Dependency | Where | Needed for | Without it |
| --- | --- | --- | --- |
| [Budgerr backend](https://github.com/aayushpokhrel1/Budgerr) | `localhost:8001` | everything | every page fails to load data |
| [playstat](https://github.com/aayushpokhrel1/Playstat) | `localhost:8000` | the "Tonight's edges" panel on `/bets` | that one panel stays empty, the rest of the page works |

**The backend's `CORS_ORIGINS` must include `http://localhost:3000`**, and so must playstat's
if you run it directly. A CORS rejection shows up in the browser console, not in this app's
UI, so a page that renders empty with no error on screen is a CORS or key problem.

## Verify

```bash
npm test          # vitest run
npm run lint      # eslint
npm run build     # next build, and the only thing CI runs
```

Run all three before pushing. **All three gate a merge**: `.github/workflows/ci.yml` runs
lint, then test, then build, in that order so the fast checks fail first.

### What a green check used to mean

Until 2026-10-26 that workflow ran `npm run build` and nothing else, so a failing test or a
lint error merged green and every test in this repo was advisory. Worth knowing because the
lesson generalises past this repo: **a mechanical defence that CI does not execute is not a
defence.** When you add a guard here, check it actually runs, and check the runner's include
glob picks the file up (see the next trap). A `test` script in `package.json` proves the
command exists, not that anything invokes it.

### Trap: vitest only collects `lib/**/*.test.ts`

`vitest.config.ts` sets `include: ['lib/**/*.test.ts']` and `environment: 'node'`. A test file
placed anywhere else, a `tests/` directory, next to a component, at the repo root, **is
silently not collected**: `npm test` passes without ever running it, which is worse than a
failing test because it looks like coverage. Either put the file under `lib/` or widen the
glob in the same change. This is why `lib/handover.budget.test.ts` lives where it does rather
than beside the docs it guards.

`environment: 'node'` also means there is no DOM. A test that needs to render a component has
to add `environment: 'jsdom'` and the matching dependency; none of the current tests do.

## Environment

| Variable | Purpose | Default in `.env.example` |
| --- | --- | --- |
| `NEXT_PUBLIC_API_URL` | Base URL of the Budgerr backend | `http://localhost:8001` |
| `NEXT_PUBLIC_BUDGERR_API_KEY` | Per-consumer `X-API-Key`, sent on every backend and `/playstat/*` call. Must match a key in the backend's `BUDGERR_API_KEYS` | empty, you must fill it |
| `NEXT_PUBLIC_PLAYSTAT_API_URL` | Optional. Set it only to bypass the backend's `/playstat` proxy and hit playstat directly | commented out |

Put them in **`.env.local`**, not `.env`. `.gitignore` ignores `.env*` and un-ignores only
`.env.example`, so a real key cannot be committed by accident, and `.env.example` must never
be given a real value.

### Trap: every variable here is `NEXT_PUBLIC_*`, so none of them are secret

Next.js inlines `NEXT_PUBLIC_*` into the client bundle at build time. `NEXT_PUBLIC_BUDGERR_API_KEY`
is therefore **readable by anyone who opens devtools on a deployed build**. That is tolerable
only because the key identifies a consumer rather than authorising a person, and the whole
app is single-user by design. Two things follow:

- **Never move a real secret into a `NEXT_PUBLIC_*` variable.** If this app ever needs one, it
  needs a server-side route to hold it, which this repo currently has none of.
- **Rotating the key means rebuilding and redeploying**, not just changing an environment
  value, because the old key is baked into the shipped JavaScript.

## Deploy

**Nothing in this repo deploys it yet.** There is no `vercel.json`, `wrangler.toml`,
`netlify.toml` or `Dockerfile`, and CI builds without publishing. `npm run build` followed by
`npm start` is the production shape if you host it yourself.

When a target is chosen, record it here, and note that the API key above becomes a build-time
input rather than a runtime one.

## Latent landmines

- **A new backend endpoint means a new page here.** The README calls this repo a *full mirror*
  of the backend API, so anything added to the backend leaves this claim false until a page
  catches up. The claim is the thing to keep true or to strike.
- **Two frontends share the same shape, not the same code.** `budgerr-app` (Expo) reimplements
  these components with React Native styles, and `lib/queries.ts` deliberately mirrors the
  app's. A change to the data layer usually needs the same change in the sibling repo, as a
  separate commit in a separate repo.
- **The Bets page talks to two unrelated APIs.** Budgerr and playstat share no backend and no
  database. A playstat outage must never take out the Bets page; the edges panel is the only
  thing allowed to go blank.
- **There is no auth UI, but the backend is auth-gated.** One hardcoded account, no login
  screen. The key is the only credential, and it is in the bundle. See the backend repo's
  `docs/ARCHITECT.md` section 9.
