# What's next

This doc orients new contributors and agents on the current phase and the immediate next steps for **Life Dashboard**.

## Current state

- **Compass:** `docs/PROJECT.md` defines the Life Dashboard concept: nested domains, bullseye diagrams, character-sheet metaphor, JSON stat tree, and gamification philosophy. Treat it as the domain-of-truth compass.
- **Architecture:** `docs/ARCHITECTURE.md` describes the React/Vite/Tailwind app structure, JSON model (Area + optional DomainMetric), persistence, and presentation (DomainTree, DomainModal, CharacterCard, BullseyeDiagram). The app lives at repo root with `src/` at the root.
- **Plan and tasks:** `docs/PLAN.md` outlines phases (Phase 1 MVP done; Phase 2 gamification in progress). `docs/TASKS.md` lists tasks T1–T11.
- **Agents:** `AGENTS.md` and playbooks in `agents/` define roles for Architect, Lead, UI/UX, Game Design, Test, Docs, Refactor, and Security/Privacy.

## Implemented (Phase 1 + UI reconfig)

- **Unified domain metrics:** Single tree of areas with optional metric per node (binary, progress, stages). Progress derived from metric or by aggregating children (average/minimum). No trackers or achievements; clean-slate persistence.
- **UI:** Single grid (radar + character card). No bottom domain panel. Domain tree shows inline metric summary and progress; double-click opens **DomainModal** (add/edit: name, emoji, color, metric, pin to favorites, delete). Drag-and-drop: reorder siblings or move to another parent. **Pinned** section above the tree for favorite domains; pin/unpin in the domain edit modal. When an area is deleted, its id and descendants are removed from `pinnedAreaIds`.

## Immediate focus

**Goal:** Phase 2 gamification (levels, badges, XP, cosmetics) and UX polish, within the guardrails of `docs/PROJECT.md`.

**Lead (with Test/Docs/UI) should:**

- Advance T11 (achievements, milestones, XP, badges) and any follow-up tasks from the Architect.
- Keep docs and tests aligned with the current schema and behavior.

**Docs** should keep `docs/` accurate; **Architect + Game Design** define concrete rules for levels/badges per PROJECT.md.

## After Phase 2

- Import/export and templates for life ontologies.
- Optional sync (e.g. Todoist/Google Tasks) with Security/Privacy review.
