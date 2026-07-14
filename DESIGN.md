<!-- SEED: re-run /impeccable document once there's code to capture the actual tokens and components. -->
---
name: Budgerr Web
description: The desktop mirror for a personal budgeting app that treats sports betting as a real budget category.
---

# Design System: Budgerr Web

## 1. Overview

**Creative North Star: "The Well-Kept Ledger"**

Budgerr Web is read the way a careful person reads their own bank statement: quickly, confidently, without needing to squint or second-guess a number. The system is restrained by design — a near-white surface, near-black text, and exactly one color that's allowed to mean something (a muted gold, used sparingly, for what deserves attention). A cool slate-blue sits behind it as a second, quieter signal for status and structure. Numbers get their own typographic register — monospaced, tabular, precise — because in a budgeting-plus-betting app, misreading a figure is the one mistake that actually matters.

This system explicitly rejects the generic AI-SaaS look: no gradient text, no cream/sand/parchment backgrounds, no identical card grids, no tiny uppercase eyebrows stacked above every section, no hero-metric-plus-gradient template. It also rejects sportsbook energy — no neon, no odds-ticker urgency, no celebratory win animation. This is a budgeting tool that happens to track bets, not a betting app that happens to track a budget.

**Key Characteristics:**
- Pure white surface, near-black ink — color is a signal, not decoration
- One warm accent (muted gold) used deliberately and rarely
- A second, cooler accent (slate-blue) carries structure and status, never competes with gold for attention
- Monospace numerals wherever money, odds, or stats appear
- Motion is responsive, not choreographed — feedback for state changes, no orchestrated entrances

## 2. Colors

Restrained strategy: tinted neutrals plus one accent that stays under roughly 10% of any given screen. Color here signals, it doesn't set the mood.

### Primary
- **Ledger Gold** (oklch(0.62 0.14 85)) — `[hex to be resolved during implementation]`: the one warm signal color. Reserved for primary actions (log a bet, save), the active nav state, and anything that represents "your money, your choice" — never used as a background wash.

### Secondary
- **Slate Signal** (oklch(0.45 0.09 235)) — `[hex to be resolved during implementation]`: the cooler, quieter accent. Carries status and structure — links, secondary badges, informational states (e.g. "pending" bet status) — so it never competes with gold for the eye's attention.

### Neutral
- **Paper** (oklch(1.000 0.000 0)) — `[#ffffff]`: page background. Pure white, no hidden warmth — the mood lives in the accents and typography, not the surface.
- **Ledger Surface** (oklch(0.97 0.005 85)) — `[hex to be resolved during implementation]`: cards and panels, pulled just slightly toward the gold hue so surfaces feel like part of the same system without reading as "cream."
- **Ink** (oklch(0.20 0.01 85)) — `[hex to be resolved during implementation]`: body text and headings. Near-black with a whisper of the brand hue, ≥7:1 against Paper.
- **Muted Ink** (oklch(0.52 0.01 85)) — `[hex to be resolved during implementation]`: secondary text, timestamps, helper copy — ink pulled toward Paper, still ≥3.5:1 contrast.

### Named Rules
**The One Signal Rule.** Ledger Gold appears on at most one element per view doing the most important thing on that screen — a primary button, an active state, a number worth noticing. If two things are gold, neither one is.

## 3. Typography

**Display/Body Font:** a humanist or technical sans (final family TBD — candidates: Inter, IBM Plex Sans, or the existing Geist Sans already wired into the project)
**Numeric/Mono Font:** a monospace family for figures (candidates: Geist Mono, already wired into the project, or IBM Plex Mono)

**Character:** Clean and unshowy for words, precise and tabular for numbers — the pairing should feel like a well-typeset financial statement, not a marketing page.

### Hierarchy
- **Display** (semibold, `clamp(1.75rem, 4vw, 2.5rem)`, tight line-height): page-level totals or the one number that matters most on a screen (e.g. remaining betting allowance).
- **Headline** (semibold, ~1.25rem): section and card titles (Dashboard, Bets, Rewards).
- **Title** (medium, ~1rem): sub-section labels, table headers.
- **Body** (regular, ~0.9375rem, 1.5 line-height, max ~70ch): descriptions, form labels, helper text.
- **Label** (medium, ~0.75rem, slight letter-spacing, not uppercase-by-default): metadata, timestamps, status tags.
- **Numeric** (mono, tabular-nums, weight matched to context): every dollar amount, odds value, percentage, and stat. Always mono, no exceptions.

### Named Rules
**The Tabular Numbers Rule.** Any figure representing money, odds, or a stat renders in the mono family with `font-variant-numeric: tabular-nums`. This is non-negotiable — it's what makes columns of numbers scannable at a glance.

## 4. Elevation

Flat by default, layered only through the Paper/Ledger Surface distinction rather than shadows. Depth comes from the subtle surface-color shift, not drop shadows — this keeps the interface feeling calm rather than "app-like" or gamified. A single soft shadow is reserved for genuinely floating elements (dropdowns, modals) where depth needs to be unambiguous.

### Shadow Vocabulary
- **Floating** (`box-shadow: 0 8px 24px rgba(0,0,0,0.08)`): dropdowns, popovers, modal surfaces only — anything that visually detaches from the page.

### Named Rules
**The Flat-By-Default Rule.** Cards and panels are distinguished by surface color, not shadow. Shadows appear only on elements that are actually floating above the page.

## 5. Components

Components are placeholders pending real implementation — re-run `/impeccable document` once buttons, cards, and forms exist in code.

### Buttons
- **Shape:** gently rounded (`8px` radius) — enough to feel considered, not enough to feel playful.
- **Primary:** Ledger Gold background, white text (saturated fill needs light text, not dark), medium padding.
- **Secondary / Ghost:** Slate Signal or Ink outline/text on transparent or Ledger Surface background.

### Cards / Containers
- **Corner style:** `8px` radius, matching buttons.
- **Background:** Ledger Surface.
- **Shadow strategy:** none at rest — see Elevation.
- **Border:** none by default; a single 1px Ledger Surface-to-Paper distinction is enough.

### Inputs / Fields
- **Style:** Ledger Surface background, 1px border in a neutral tone, `8px` radius.
- **Focus:** border shifts to Slate Signal, no glow.

### Navigation
- **Style:** flat top nav, Ink text, active item marked with Ledger Gold underline or text color — not a filled pill (avoids the "gamified tab" feel).

## 6. Do's and Don'ts

### Do:
- **Do** use mono/tabular numerals for every dollar amount, odds value, and stat.
- **Do** keep Ledger Gold to one element per screen — the single most important action or number.
- **Do** use flat surfaces distinguished by color, not shadow, except for genuinely floating elements.
- **Do** keep motion responsive: transitions on real state changes (hover, settle a bet, update a total), nothing choreographed or celebratory.

### Don't:
- **Don't** use gradient text anywhere.
- **Don't** use a cream, sand, or parchment-tinted background — the surface is pure white or near-black, never warm-neutral-by-default.
- **Don't** build identical card grids or nest cards inside cards.
- **Don't** add uppercase tracked eyebrows above every section.
- **Don't** use the hero-metric-plus-gradient-accent SaaS template.
- **Don't** borrow sportsbook visual language: no neon, no odds-ticker urgency, no confetti or celebratory animation on a settled bet.
- **Don't** use side-stripe (`border-left`) colored accents on cards or list items.
