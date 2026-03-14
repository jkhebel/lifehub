# What's next

This doc orients new contributors and agents on the current phase and the immediate next steps for **Life Dashboard**.

## Current state

- **Compass:** `docs/PROJECT.md` defines the Life Dashboard concept: nested domains, bullseye diagrams, character-sheet metaphor, JSON stat tree, and gamification philosophy. Treat it as the domain-of-truth compass.
- **Architecture:** `docs/ARCHITECTURE.md` describes the React/Vite/Tailwind app structure, JSON model (Area + optional DomainMetric), persistence, and presentation (DomainTree, DomainModal, CharacterCard, BullseyeDiagram). The app lives at repo root with `src/` at the root.
- **Plan and tasks:** `docs/PLAN.md` outlines phases (Phase 1 MVP done; Phase 2 foundation done). `docs/TASKS.md` lists tasks T1–T17 (T12–T17 implemented).
- **Agents:** `AGENTS.md` and playbooks in `agents/` define roles for Architect, Lead, UI/UX, Game Design, Test, Docs, Refactor, and Security/Privacy.

## Implemented (Phase 1 + Phase 2 foundation)

- **Unified domain metrics:** Single tree of areas with optional metric per node (binary, progress, stages). Stages support optional `stageBounds` and `currentValue` for value-based tiers (e.g. vocabulary → A1/A2/B1/B2). Optional `statName` per area (e.g. HP, Charm). Progress derived from metric or by aggregating children (average/minimum).
- **Radar:** View mode **To next level** (relative: progress to next tier per axis, with tier labels) and **Absolute** (objective). Optional multi-series in objective mode (multiple polygons + legend). Default: relative.
- **Gamification:** Persisted `gamification` (totalXp, completionLog). Binary domain set to done adds completion entry and awards XP; character level from total XP (sublinear curve). Character card shows level and XP bar, and stat block (statName or name + progress).
- **UI:** Single grid (radar + character card). Domain tree, **DomainModal** (add/edit: name, emoji, color, metric, pin, delete), drag-and-drop, **Pinned** section. Pixel/TCG direction: Silkscreen font for headings/radar labels; see `docs/DESIGN.md`.

## Immediate focus

**Goal:** Further Phase 2 polish and any follow-up from the roadmap (e.g. DomainModal support for editing statName and stages with stageBounds/currentValue; badges/titles UI).

**Lead (with Test/Docs/UI) should:**

- Keep docs and tests aligned with the current schema and behavior.
- Add DomainModal fields for statName and for stages (stageBounds, currentValue) when desired.

**Docs** should keep `docs/` accurate; **Architect + Game Design** define concrete rules for levels/badges per PROJECT.md.

## After Phase 2

- Import/export and templates for life ontologies.
- Optional sync (e.g. Todoist/Google Tasks) with Security/Privacy review.
