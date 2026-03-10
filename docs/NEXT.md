# What's next

This doc orients new contributors and agents on the current phase and the immediate next steps for **Life Dashboard**.

## Current state

- **Compass:** `docs/PROJECT.md` defines the Life Dashboard concept: nested domains, bullseye diagrams, character-sheet metaphor, JSON stat tree, and gamification philosophy. Treat it as the domain-of-truth compass.
- **Architecture:** `docs/ARCHITECTURE.md` describes the React/Vite/Tailwind app structure, JSON model/persistence/visualization pipeline, and the intended repo layout (promoting `life-dashboard/` to root and removing the empty root `src/`).
- **Plan and tasks:** `docs/PLAN.md` outlines phases; `docs/TASKS.md` breaks Phase 1 into concrete tasks T1–T10.
- **Agents:** `AGENTS.md` and the playbooks in `agents/` (to be updated) define roles for Architect, Lead, UI/UX, Game Design, Test, Docs, Refactor, and Security/Privacy.

## Immediate focus

**Goal:** Deliver the Phase 1 MVP so a user can define a JSON stat tree, see it rendered in bullseye and card views, and have changes persist locally.

**Lead (with Test/Docs/UI) should:**

1. **Stabilize the JSON model and derived metrics**
   - Implement T1 (JSON stat-tree types/validation) and T2 (derived metrics).
2. **Wire persistence and basic UI flows**
   - Implement T3 (local persistence) and T4 (domain tree navigation UI).
3. **Make the main visual surfaces real**
   - Implement T5 (bullseye visualization) and T6 (character card view).
4. **Enable basic editing**
   - Implement T7 (editing flows for stats) so changes flow through model → persistence → visuals.

In parallel, **Docs** should keep `docs/DEV.md` and any README/usage notes aligned with actual dev commands (T8), and **Architect + Game Design** can begin sketching concrete rules for levels/badges (T9), keeping within the guardrails of `docs/PROJECT.md`.

## Repo layout change (upcoming)

A **small, isolated change** (can be scheduled without blocking Phase 1 feature work):

- Move the contents of `life-dashboard/` to the repo root.
- Remove the now-empty root `src/` directory (if present).

After this, paths in docs and tasks should assume a **root-level Vite app** with `src/` at the repo root. See [ARCHITECTURE.md](ARCHITECTURE.md) §1 and [DEV.md](DEV.md) for current vs intended commands.

## After Phase 1

When the MVP criteria in `docs/PLAN.md` are met, the next phase focuses on:

- Refining gamification (levels, badges, mastery) with healthy guardrails.
- Polishing UX and accessibility.
- Exploring import/export and templates for different life ontologies.

Architect, UI/UX, and Game Design agents should propose updated tasks and possible new documents (e.g. a lightweight `DESIGN.md` for JSON schema details) before deeper feature work proceeds.
