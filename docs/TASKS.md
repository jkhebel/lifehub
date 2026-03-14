# Life Dashboard — Tasks

Ordered tasks for the Life Dashboard MVP and early phases. Each task has scope, acceptance criteria, files likely touched, and validation steps. Lead implements; Test validates per criteria. See [ARCHITECTURE.md](ARCHITECTURE.md) and [PLAN.md](PLAN.md).

---

## Task format

- **ID** — Short identifier (e.g. T1, T2).
- **Title** — One-line name.
- **Scope** — What is in and out.
- **Acceptance criteria** — Testable conditions.
- **Files likely touched** — Dirs or file patterns.
- **Validation** — How to verify (commands and/or manual steps).

---

## T1 — JSON stat-tree types and validation

**Title:** Define the core JSON stat-tree types and basic validation.

**Scope:**
In:

- TypeScript types for domain/stat nodes and user state, aligned with the schema in [docs/JSON-MODEL.md](JSON-MODEL.md) (Area, Tracker, aggregation).
- A validation function that accepts raw JSON (e.g. from bundled default or user-supplied import) and either returns a validated tree or rejects malformed input.

Out:

- Persistence, UI, and gamification details (later tasks).

**Schema reference:** Configs are an array of root **Area** objects; each Area has `id`, `name`, `color`, `trackers` (array of **Tracker**), `children` (array of Area), `parentId`, and optional `targetProgress`, `targetDate`, `aggregation`. Each Tracker has `id`, `name`, `type` (one of `number` | `percentage` | `level` | `boolean` | `progress`), `value`, and optional `target`, `min`, `max`, `unit`, `weight`. See JSON-MODEL.md for full field list.

**Validation behavior:**

- **Minimal:** Require shape (array of objects, each with required Area/Tracker fields); reject missing `id`, non-array `children`/`trackers`, invalid `type`.
- **Strict (optional):** Reject unknown keys, enforce value ranges (e.g. 0–100 for percentage), or require `target` when `type` is `progress`.
- **Errors:** Validation failures should be surfaceable (e.g. return `{ ok: false, errors: string[] }` or throw with a structured error) so the app can fall back to defaults or show a message; avoid silent corruption.

**Acceptance criteria:**

- A TypeScript module defines node types matching the Area/Tracker schema (e.g. `id`, `name`/label, `children`, `trackers`).
- A validation function accepts a valid example tree and rejects obviously malformed input (e.g. missing `id`, non-array `children`, invalid tracker `type`).
- Example config (used by the app) passes validation.

**Files likely touched:** `src/model/`, `src/domain/`, test files under `src` or `tests`.

**Validation:**

- Run type-check (e.g. `npm run typecheck`).
- Run unit tests for the validation utilities (e.g. `npm test` focused on model tests).

---

## T2 — Derived metrics from the stat tree

**Title:** Compute normalized completion and aggregate scores for each node.

**Scope:**
In:

- Functions that, given a validated config (Area[] tree) and current values, compute:
  - Per-tracker normalized completion (0–100%): see [ARCHITECTURE.md](ARCHITECTURE.md) §4.2 (boolean 0/100; target-based or max-based ratio; else 50).
  - Per-area completion by aggregating tracker and child completions (average, weighted, or minimum per area’s `aggregation`).

Out:

- Any sophisticated leveling/XP systems (later tasks); T9 adds level/badge hooks on top of these metrics.

**Acceptance criteria:**

- Given a simple tree with leaf stats and parent containers, the function returns:
  - Completion for each leaf based on `value` vs `target` (or `max`) as in ARCHITECTURE §4.2.
  - Completion for parents based on children and trackers using the area’s `aggregation` mode.
- Behavior is deterministic for the same inputs.

**Files likely touched:** `src/model/`, tests. (Current implementation lives in `useDashboard`; refactoring into a dedicated model module aligns with ARCHITECTURE boundaries.)

**Validation:**

- Add unit tests over small example trees, verifying expected completions for each aggregation mode.

---

## T3 — Local persistence (user state and config)

**Title:** Persist stat values and preferences in the browser.

**Scope:**
In:

- A small persistence module/hook to:
  - Save current stat values and basic preferences to `localStorage` (or equivalent).
  - Load them on app start.

Out:

- Remote sync/backends.

**Acceptance criteria:**

- When the user adjusts a stat value, it is saved and restored across page reloads.
- If storage is unavailable or corrupted, the app falls back gracefully to defaults.

**Files likely touched:** `src/persistence/`, `src/hooks/`, tests as appropriate.

**Validation:**

- Manual: Change a value, refresh the page, confirm it persists.
- Optional: Unit tests for serialization/deserialization utilities.

---

## T4 — Domain tree navigation UI

**Title:** Implement a UI component to navigate the domain/subdomain tree.

**Scope:**
In:

- A `DomainTree` component that:
  - Displays the nested structure of domains and subdomains.
  - Allows selecting a node to focus the rest of the UI.

Out:

- Full-featured editing (add/remove/reorder) beyond basic needs.

**Acceptance criteria:**

- Given a sample config, the tree view correctly renders all nodes in hierarchy.
- Clicking a node updates a “selected” state and causes other components to reflect that selection.
- Keyboard navigation (up/down and expand/collapse where applicable) works for basic traversal.

**Files likely touched:** `src/components/DomainTree.*`, state/context wiring.

**Validation:**

- Manual: Load the app, expand/collapse and select nodes, and see selection reflected elsewhere (e.g. header or detail panel).

---

## T5 — Bullseye visualization

**Title:** Render a bullseye diagram from derived metrics.

**Scope:**
In:

- A `Bullseye` component that:
  - Visualizes domains/subdomains as concentric rings and/or segments.
  - Maps completion metrics to visual properties (e.g. fill, opacity, or radius).

Out:

- Multiple advanced bullseye variants; start with one clear representation.

**Acceptance criteria:**

- Given derived metrics for nodes:
  - The bullseye renders without errors.
  - Changes in underlying metrics (e.g. adjusting a stat) are reflected visually.
- The diagram remains legible at common viewport sizes.

**Files likely touched:** `src/components/Bullseye.*`, supporting utilities.

**Validation:**

- Manual: Adjust stat values and confirm region(s) of the bullseye visibly change.

---

## T6 — Character card view

**Title:** Create a character card view summarizing key stats.

**Scope:**
In:

- A `CharacterCard` component that:
  - Consumes **the same derived metrics** as the bullseye (per-area completion, per-tracker completion); no separate calculation pipeline.
  - Selects which stats to display: e.g. top-level domains only, or a fixed/small set of “headline” stats (user-selected highlights can be a later enhancement).
  - Displays an overall “level” or progress bar derived from aggregate completion (e.g. root-level average or a simple global metric from the model).
  - Presents them in a card-like “character sheet” layout (see [PROJECT.md](PROJECT.md) §2.5).

Out:

- Complex flavor systems or narrative text generation (later).

**Acceptance criteria:**

- The card renders consistently and uses the same completion/aggregation logic as the bullseye.
- Adjusting stats changes the card’s displayed values/progress (and bullseye stays in sync).
- The visual style feels clearly “character sheet”/card-like (within Tailwind and current design constraints).

**Files likely touched:** `src/components/CharacterCard.*`.

**Validation:**

- Manual: Toggle between domains and verify the card updates appropriately; adjust stats and confirm both card and bullseye reflect the same metrics.

---

## T7 — Basic editing flows for stats

**Title:** Allow users to edit stat values and basic properties.

**Scope:**
In:

- Simple UI affordances to:
  - Update numeric values and/or ratings for stats.
  - Adjust target values where appropriate.

Out:

- Full configuration editing (adding/removing entire domains) beyond simple cases.

**Acceptance criteria:**

- The user can select a stat and:
  - Change its current value via UI controls.
  - Optionally adjust its target.
- Changes are persisted (see T3) and reflected in derived metrics and visualizations.

**Files likely touched:** `src/components/StatEditor.*`, state/persistence wiring.

**Validation:**

- Manual: Adjust a stat and confirm the bullseye, card, and persisted data update correctly.

---

## T8 — Developer workflow alignment

**Title:** Align `docs/DEV.md` and scripts with the Life Dashboard app layout.

**Scope:**
In:

- Document the actual dev commands (install, dev, test, build, lint) for the Vite app.
- Ensure any existing scripts or CI references match the real project layout (especially after moving `life-dashboard/` to root).

Out:

- Implementing new CI logic beyond what is needed to run the app and tests.

**Acceptance criteria:**

- A new contributor can follow `docs/DEV.md` to:
  - Install dependencies.
  - Run the dev server.
  - Run tests and lint/typecheck.
- Commands work both before and after the planned repo restructuring (with appropriate notes if needed).

**Files likely touched:** `docs/DEV.md`, scripts under `scripts/`, `package.json` as necessary.

**Validation:**

- Manual: Run documented commands in a clean checkout and confirm they succeed.

---

## T9 — Early gamification hooks (Phase 2 prep)

**Title:** Prepare model and UI hooks for levels and badges.

**Scope:**
In:

- Minimal additions to the model layer (e.g. a gamification sub-module or functions alongside derived metrics; see [ARCHITECTURE.md](ARCHITECTURE.md) §4.2 and §5) to support:
  - A computed “level” value (even if initially trivial, e.g. derived from aggregate completion).
  - A simple list of “badges” derived from thresholds (e.g. completion or streak thresholds).

Out:

- Deep game economy or complex progression systems; formulas remain flexible per Game Design/Architect.

**Acceptance criteria:**

- The model layer exposes:
  - A function that returns a global level and per-domain “level-like” indicators (consuming the same completion metrics as the bullseye/card).
  - A function that returns a list of triggered badges based on current metrics.
- The UI can display these values in the character card, even if the visual design is minimal.

**Files likely touched:** `src/model/` (including gamification helpers), `src/components/CharacterCard.*`.

**Validation:**

- Manual: Create a config and set stat values that cross thresholds; verify levels/badges update as expected.

---

## T10 — Config loading and default tree (optional follow-up to T1)

**Title:** Load default or user JSON config and bridge to app state.

**Scope:**
In:

- A small config module (or extension of the model layer) that:
  - Loads a default JSON config (e.g. bundled with the app or from a known asset).
  - Uses the T1 validation function to parse raw JSON into a validated `Area[]` (or equivalent).
  - Can be used by the state layer (e.g. `useDashboard`) so the app starts from validated config instead of hard-coded TypeScript-only initial data.

Out:

- Full import/export UI (later); this task focuses on loading and validation only.

**Acceptance criteria:**

- The app can initialize from a JSON config that passes T1 validation.
- Invalid or missing config falls back to a bundled default without crashing.
- State layer receives a typed `Area[]` tree, not raw JSON.

**Files likely touched:** `src/model/`, `src/persistence/` or config loader, `src/hooks/useDashboard.ts` (or equivalent).

**Validation:**

- Unit test: load valid JSON → get Area[]; load invalid JSON → get default or structured error.
- Manual: Start app with no localStorage; confirm default tree loads; optionally replace default with a JSON file and confirm it loads.

---

## T11 — Achievements, milestones, tasks, and gamification (Phase 2)

**Title:** Achievements (milestones/tasks/projects), XP, badges, cosmetics, radar milestone view.

**Scope:**
In:

- **Model:** Achievement type and optional `achievements` on Area; GamificationState (completionLog, domainXp, unlockedBadges, unlockedTitles, avatarUnlocks, selectedAvatar, selectedTitle). Validation for achievements. Derived: milestone progress per area, XP level, earned badges/titles/avatars.
- **Persistence:** Persist gamification state with dashboard state; normalize on load for backward compatibility.
- **UI:** Achievements panel per area (add/complete milestones and tasks, XP feedback toast); bullseye view toggle “By trackers” / “By milestones”; character card shows avatar, title, XP level, and progress + milestone badges.
- **Docs:** JSON-MODEL (§6 Achievement), ARCHITECTURE (§5 gamification), PLAN (Phase 2/3), this task.

Out:

- Todoist/Google Tasks sync (Phase 3); complex game economy.

**Acceptance criteria:**

- User can add milestones, tasks, and projects to an area; claim milestones and complete tasks; see XP gain and unlocked badges/titles/avatars.
- Radar can display progress by trackers or by milestone completion.
- Character card shows selected avatar and title, level, XP level, and badges. State persists.

**Files touched:** `src/types/`, `src/model/` (derivedMetrics, gamification, validation), `src/persistence/`, `src/hooks/useDashboard.ts`, `src/components/` (AchievementsPanel, CharacterCard, BullseyeDiagram), `src/App.tsx`, `docs/`.

**Validation:** Manual: add achievement, complete, check XP and badges; toggle radar view. Unit tests for derived metrics and gamification.

**Note:** T11 is superseded by the unified domain-metrics refactor and Phase 2 roadmap. Implemented instead: gamification state (XP, completion log, level from XP), radar view mode (relative to next level / objective), tiered stages (stageBounds, currentValue), stat names (statName), multi-series radar with legend, pixel/TCG design pass. See roadmap plan and ARCHITECTURE §5.

---

## T12 — Tiered stages and progress-to-next-level (Phase 2a) — Done

Schema: optional `stageBounds` and `currentValue` on StagesMetric. Model: `getProgressToNextLevel(domain)`. Validation for stageBounds length and ascending order.

---

## T13 — Radar view mode and tier labels (Phase 2a) — Done

Radar supports view mode “To next level” (relative) and “Absolute” (objective). Relative view shows progress to next tier and tier label per axis. Toggle in radar section.

---

## T14 — Gamification state and XP (Phase 2b) — Done

GamificationState (totalXp, completionLog); binary domain set to done adds entry and awards XP; level from total XP (sublinear curve). Character card shows level and XP bar.

---

## T15 — Stat names and character card stat block (Phase 2a/c) — Done

Optional `statName` on Area; character card shows stat block (statName or name + progress). Default statName for six OG domains (HP, Charm, Fortune, Renown, Wisdom, Spirit).

---

## T16 — Multi-series radar and legend (Phase 2c) — Done

BullseyeDiagram accepts optional `series` (name + getValue); in objective view multiple polygons and legend when series length > 1.

---

## T17 — Pixel/TCG visual pass (Phase 2c) — Done

Silkscreen font for headings/radar labels; DESIGN.md documents pixel + TCG direction; card-paper and font-pixel applied.

---

## T18 — Progress % from child nodes (roadmap)

Define and implement an equation for computing a parent domain’s progress % from its child nodes (e.g. weighted average, or formula based on child metrics). For use when a parent uses a “Progress”-style metric driven by children. Document in ARCHITECTURE; implement when prioritised.

---

## T19 — Deploy static app to Fly.io (Phase 3)

**Title:** Deploy the Vite static build to Fly.io.

**Scope:** Dockerfile (multi-stage: node build, nginx serve with SPA fallback), fly.toml, and a “Deploy to Fly.io” section in docs/DEV.md. No secrets in repo; production env via `fly secrets set`.

**Acceptance criteria:** `fly deploy` succeeds; app loads at Fly URL; SPA routing works (refresh on a path returns 200).

**Files touched:** Dockerfile, fly.toml, docs/DEV.md.

---

## T20 — Env-based config and optional Supabase client (Phase 3)

**Title:** Vite env vars for Supabase; client only when configured.

**Scope:** Use `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`; create Supabase client only when both set. .env.example with comment. When unset, app runs local-only (no sign-in UI).

**Acceptance criteria:** With env set, Supabase client is used for auth/storage; without env, no auth UI and localStorage only.

**Files touched:** src/auth/supabase.ts, .env.example.

---

## T21 — Optional auth (Phase 3)

**Title:** Supabase Auth, sign-in/sign-out UI, useAuth.

**Scope:** Auth module (getSession, onAuthStateChange, signInWithPassword, signOut); AuthProvider and useAuth(); minimal sign-in form and “Sign out” in header (AuthBar). Email/password for MVP.

**Acceptance criteria:** With Supabase configured, sign in and sign out work; session survives reload; without config, no auth UI.

**Files touched:** src/auth/supabase.ts, src/auth/AuthContext.tsx, src/components/AuthBar.tsx, src/main.tsx, src/App.tsx.

---

## T22 — Per-user persistence (Phase 3)

**Title:** Supabase table, RLS, persistence abstraction, useDashboard integration.

**Scope:** Table `dashboard_state` (user_id, state jsonb, updated_at); RLS so users only access own row. Load/save from Supabase when signed in; localStorage when not. useDashboard uses useAuth and chooses source; debounced remote save.

**Acceptance criteria:** Signed-in user: state persists to Supabase and restores on reload; sign out then sign in restores cloud state. Local-only when not signed in.

**Files touched:** src/persistence/supabaseStorage.ts, src/persistence/localStorage.ts (export normalizer), src/hooks/useDashboard.ts, docs/supabase-setup.md.

---

## Summary

| ID | Title |
| --- | --- |
| T1 | JSON stat-tree types and validation |
| T2 | Derived metrics from the stat tree |
| T3 | Local persistence (user state and config) |
| T4 | Domain tree navigation UI |
| T5 | Bullseye visualization |
| T6 | Character card view |
| T7 | Basic editing flows for stats |
| T8 | Developer workflow alignment |
| T9 | Early gamification hooks (Phase 2 prep) |
| T10 | Config loading and default tree (optional follow-up to T1) |
| T11 | Achievements, milestones, tasks, and gamification (Phase 2) — superseded |
| T12 | Tiered stages and progress-to-next-level |
| T13 | Radar view mode and tier labels |
| T14 | Gamification state and XP |
| T15 | Stat names and character card stat block |
| T16 | Multi-series radar and legend |
| T17 | Pixel/TCG visual pass |
| T18 | Progress % from child nodes (roadmap) |
| T19 | Deploy static app to Fly.io (Phase 3) |
| T20 | Env-based config and optional Supabase client (Phase 3) |
| T21 | Optional auth (Phase 3) |
| T22 | Per-user persistence (Phase 3) |
