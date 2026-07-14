# Budgerr Web — Full Mirror

## 1. What this is

The web client for [Budgerr](https://github.com/aayushpokhrel1/Budgerr) — a personal budgeting app with sports betting baked in as a first-class category. Unlike the [mobile app](https://github.com/aayushpokhrel1/budgerr-app), which focuses on the day-to-day (check the budget, log a bet), this is a **full mirror**: every feature the backend exposes gets a page here, so it's the natural place for anything more comfortable on a bigger screen — reviewing longer bet history, adjusting reward card rates, deeper trend/reporting views.

Same as the rest of the project: pure frontend, all logic lives in the [Budgerr backend](https://github.com/aayushpokhrel1/Budgerr) (FastAPI + Postgres). This repo just renders it.

Scope for now: **you, personally**. No auth yet — matches the backend, which doesn't have any either. Both will need it before any of this is exposed beyond your own machine (see backend README Section 10/13).

---

## 2. Architecture

```
Budgerr backend (FastAPI, localhost:8001 in dev)
        ▲
        │  REST — fetch + React Query
        │
Budgerr Web (this repo)
  Next.js App Router (pages/nav) ── React Query (server state) ── React components
```

- No server-side data fetching / RSC data loading — every page is a client component that fetches via React Query, same pattern as the mobile app, for consistency between the two frontends
- No database, no server-side session — this is a thin client, same as the mobile app
- The Bets page also calls a second, unrelated API directly: [playstat](https://github.com/aayushpokhrel1/Playstat)'s `GET /edges`, for the "Tonight's edges" pre-fill panel — read-only, no shared backend or database with Budgerr

---

## 3. Tech stack

- **Next.js** (App Router, TypeScript) — the standard choice for a from-scratch React web app; App Router over Pages Router since it's the current default
- **Tailwind CSS** — utility classes directly in components, no separate stylesheet per component
- **React Query** (`@tanstack/react-query`) — server state, identical usage pattern to the mobile app's `lib/queries.ts`
- **react-plaid-link** — the official React wrapper around Plaid Link's web SDK, used on `/link-bank` instead of the standalone HTML page the backend also hosts (see backend README Section 9)

---

## 4. Project structure

```
app/
  layout.tsx        — root layout: fonts, <Providers>, <Nav>
  providers.tsx      — QueryClientProvider wrapper (client component)
  page.tsx           — Dashboard (/)
  bets/page.tsx       — Bets: filter, log, settle
  analytics/page.tsx  — Bet analytics: real/paper scope toggle, overall summary,
                        breakdowns by sportsbook/bet type/stat type, calibration
  rewards/page.tsx    — Cards, reward rates, best-card lookup, left-on-table report
  categories/page.tsx — Categories: create, list, edit monthly limit
  link-bank/page.tsx  — Plaid Link flow

components/
  Nav.tsx             — top navigation
  budget/             — dashboard pieces (allowance card, category tiles, recent
                        bets, best-card tip, trend stats) — same components as
                        the mobile app, reimplemented with Tailwind instead of
                        React Native StyleSheet
  bets/               — bet form (dynamic legs) + bet row with inline settle
  rewards/            — cards panel, reward rates panel, best-card lookup,
                        left-on-table report

lib/
  api.ts              — typed fetch client covering every backend endpoint
                        (bets, categories, budget periods, alerts, rewards:
                        cards/rates/progress/lookups, plaid)
  queries.ts          — React Query hooks wrapping api.ts
```

---

## 5. What's built

Every page is fully wired to the backend, not a mockup:

- **Dashboard** (`/`) — betting allowance card with status/progress, other category tiles, recent bets, recurring charges card (detected subscriptions with monthly estimate), best-card tip, net profit vs. bank cash flow, and an amber warning banner when a rotating reward category is about to expire
- **Bets** (`/bets`) — status filter, log-a-bet form with dynamic per-leg detail, inline settle (won/lost/push/cashed out) on pending bets, plus a "Tonight's edges (from playstat)" panel that lists today's positive-edge legs (player, stat, line, side, odds) from the [playstat](https://github.com/aayushpokhrel1/Playstat) project — clicking "+ Add to bet" pre-fills a leg
- **Analytics** (`/analytics`) — real/paper scope toggle, overall settled/record/staked/net-profit/ROI summary, breakdowns by sportsbook, bet type, and stat type (hit rate), and a calibration section comparing predicted vs. actual win rate overall and per probability bucket
- **Rewards** (`/rewards`) — credit card CRUD, reward rate CRUD per card (multiplier, cap, effective dates), "which card right now" lookup by category, "rewards left on the table" report over a date range
- **Categories** (`/categories`) — create categories, inline-edit monthly limits
- **Link bank** (`/link-bank`) — real Plaid Link flow via `react-plaid-link`, exchanges the token, offers an immediate transaction sync

**Not built yet**: nothing from the current Budgerr backend API surface — this genuinely is a full mirror of Budgerr as of this writing. Anything built into the Budgerr backend later (e.g. a stats/trend endpoint) will need a page added here too.

---

## 6. Running it

### Prerequisites
- The [Budgerr backend](https://github.com/aayushpokhrel1/Budgerr) running locally, with `CORS_ORIGINS` including `http://localhost:3000`
- Optional: the [playstat](https://github.com/aayushpokhrel1/Playstat) API running locally (`:8000`, also needs `http://localhost:3000` in its own `CORS_ORIGINS`) for the "Tonight's edges" panel on `/bets` — the page works fine without it, that panel just stays empty
- Node.js 18+

### Setup

```
npm install
cp .env.example .env.local   # defaults to http://localhost:8001
```

### Run

```
npm run dev
```

Open http://localhost:3000.

---

## 7. Environment variables

| Variable | Purpose | Default |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | Base URL of the Budgerr backend | `http://localhost:8001` in `.env.example` |
| `NEXT_PUBLIC_PLAYSTAT_API_URL` | Base URL of the playstat API (for the Tonight's edges panel) | `http://localhost:8000` in `.env.example` |
