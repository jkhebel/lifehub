# What's next

This doc orients new contributors and agents on the current phase and the immediate next steps for **Life Dashboard**.

## Current state

- **Compass:** `docs/PROJECT.md` defines the Life Dashboard concept: nested domains, bullseye diagrams, character-sheet metaphor, JSON stat tree, and gamification philosophy. Treat it as the domain-of-truth compass.
- **Architecture:** `docs/ARCHITECTURE.md` describes the React/Vite/Tailwind app structure, JSON model (Area + optional DomainMetric), persistence, and presentation (DomainTree, DomainModal, CharacterCard, BullseyeDiagram). The app lives at repo root with `src/` at the root.
- **Plan and tasks:** `docs/PLAN.md` outlines phases: **Phase 1** and **Phase 2** are done; **Phase 3** (deployment, auth, per-user persistence) is in progress. `docs/TASKS.md` lists tasks T1–T22 (T19–T22 for Phase 3).
- **Agents:** `AGENTS.md` and playbooks in `agents/` define roles for Architect, Lead, UI/UX, Game Design, Test, Docs, Refactor, and Security/Privacy.

## Implemented (Phase 1 + Phase 2 foundation)

- **Unified domain metrics:** Single tree of areas with optional metric per node (binary, progress, stages, levels). Stages support optional `stageBounds` and `currentValue` for value-based tiers (e.g. vocabulary → A1/A2/B1/B2). Optional `statName` per area (e.g. HP, Charm). Progress derived from metric or by aggregating children (average/minimum).
- **Levels metric:** **Character level** is derived from `gamification.totalXp` (sublinear curve); shown on the character card as title “Level N” and an XP bar. **Per-domain “level”** in the radar is expressed as progress to the next tier when using stages (e.g. “To next level” view with tier labels like A1, A2, B1). Levels are computed from the model, not stored in the JSON tree.
- **Radar:** View mode **To next level** (relative: progress to next tier per axis, with tier labels) and **Absolute** (objective). Optional multi-series in objective mode (multiple polygons + legend). Default: relative.
- **Gamification:** Persisted `gamification` (totalXp, completionLog). Binary domain set to done adds completion entry and awards XP. Character card shows title (Level N), XP bar, stat block (statName or name + progress), and **badges/titles (minimal)**: badges derived from completion count (First steps, Getting started, Building momentum); title = Level N.
- **JSON view:** **Data (JSON)** modal (`DataJsonView`) lets users view and edit the full dashboard state as JSON (areas, gamification, currentAreaId, breadcrumbs, pinnedAreaIds). Areas are validated on Apply; invalid data shows an error. Accessible from the UI for power users and debugging.
- **UI:** Single grid (radar + character card). Domain tree, **DomainModal** (add/edit: name, stat name, emoji, color, metric including **Stages** with stageBounds/currentValue, pin, delete), drag-and-drop, **Pinned** section. Pixel/TCG direction: Silkscreen font for headings/radar labels; see `docs/DESIGN.md`.
- **Phase 3:** Static app deploys to Fly.io (Dockerfile, fly.toml). Optional auth via Supabase (email/password); when env is set, Sign in / Sign out in header. Per-user state in Supabase table `dashboard_state` when signed in; localStorage when not. See [docs/supabase-setup.md](supabase-setup.md) and [docs/DEV.md](DEV.md) (Deploy to Fly.io, env vars).

## Immediate focus

**Goal:** Phase 3 validation (deploy, sign-in, state sync) and Phase 2 follow-up (accessibility, empty states).

**Lead (with Test/Docs/UI) should:**

- Keep docs and tests aligned with the current schema and behavior.
- Validate: `fly deploy`, sign in/out, state persists across reload when signed in.

**Security/Privacy:** No secrets in repo; env-only config; RLS on `dashboard_state` so users only access own row.

## After Phase 3

- Import/export and templates for life ontologies.
- Optional OAuth (Google/GitHub) for sign-in.
- Optional sync (e.g. Todoist/Google Tasks) with Security/Privacy review.
