# Life Dashboard — Architecture

High-level structure, boundaries, and data flow for the Life Dashboard app. Lead/Test/Docs/UI/Game agents use this to decide what to build and where. The JSON stat-tree model is introduced in `docs/PROJECT.md`. The Phase 1 schema (Area, optional DomainMetric, validation expectations) is defined in [docs/JSON-MODEL.md](JSON-MODEL.md); design details may also appear in `docs/DESIGN.md` where applicable.

---

## 1. Current and Intended Repository Layout

### 1.1 Current layout

Today the codebase looks roughly like:

- `life-dashboard/` — Vite + React + TypeScript + Tailwind app (the actual Life Dashboard implementation).
- `src/` (at repo root) — currently empty.

This means the app is **nested one level down** inside the repo.

### 1.2 Intended layout (after restructuring)

To simplify development and make documentation less confusing, the intended layout is:

- App lives at the **repo root**, with:
  - `src/` — React application source (components, hooks, pages, etc.).
  - `index.html`, `vite.config.*`, `package.json`, `tsconfig.*`, etc. — standard Vite root files.
- The existing empty root `src/` directory is removed.
- All content currently under `life-dashboard/` is **moved up** to the repo root.

Until that move is performed, any path references in docs that assume a root-level Vite app should be read as **“inside `life-dashboard/` for now”**.

---

## 2. High-Level Architecture

At a high level, the system is a **single-page React application** that:

- Loads a **JSON stat tree** describing domains, subdomains, and stats.
- Maintains **per-user state** (current values, preferences) in local storage.
- Computes **derived metrics** (completion, normalized scores) from that tree.
- Renders:
  - A **navigation tree** for exploring domains.
  - One or more **bullseye diagrams** summarizing progress.
  - A **character card** view surfacing key stats and flavor.
  - Editor/controls for adjusting stats and configuration.

```mermaid
flowchart LR
  JsonConfig[JSONStatTree]
  LocalState[LocalState<br/>(values, prefs)]
  Deriver[DerivedMetrics]
  Nav[DomainTreeUI]
  Bullseye[BullseyeView]
  Card[CharacterCard]
  Editors[Editors/Controls]

  JsonConfig --> Deriver
  LocalState --> Deriver
  Deriver --> Bullseye
  Deriver --> Card
  JsonConfig --> Nav
  JsonConfig --> Editors
  LocalState --> Editors
  Editors --> LocalState
```

In the MVP, **all data lives in the browser** (JSON configuration + local storage). Future iterations may add sync or import/export without changing this basic flow.

**View surfaces:** The **bullseye** and **character card** are sibling views: both are fed by the same derived metrics (completion per node, optional level/badges from the model). No view has its own private derivation logic.

```mermaid
flowchart LR
  Model[ModelLayer<br/>DerivedMetrics]
  Bullseye[BullseyeView]
  CharacterCard[CharacterCard]
  Model --> Bullseye
  Model --> CharacterCard
```

---

## 3. Frontend Modules and Responsibilities

The exact file and folder structure may evolve, but the main concerns are:

### 3.1 Data model layer (`src/model/` or `src/domain/`)

**Owns:**

- Type definitions for:
  - `StatNode` / `DomainNode` (tree nodes).
  - `StatDefinition` (type, target, units, weight, etc.).
  - `UserStatState` (current values, timestamps).
- Functions to:
  - Validate and normalize JSON configurations.
  - Walk the tree and compute derived metrics (e.g. completion percentages).

**Consumes:**

- Raw JSON configuration (from bundled defaults or user import).
- User state (e.g. from local storage).

**Produces:**

- A normalized in-memory representation of the tree.
- Derived metrics per node (completion, aggregate scores, optional domain “levels”).

### 3.2 Persistence layer (`src/persistence/`)

**Owns:**

- Reading/writing:
  - JSON configuration (initially: static or embedded; later: user-edited and saved).
  - User state (current stat values, preferences) via `localStorage` or similar browser APIs.

**Consumes:**

- In-memory model and updated values from UI.

**Produces:**

- Stable storage across sessions.
- Hooks/utilities like `useLocalStorageState` or `saveConfig`.

Constraints:

- No backend is assumed for MVP.
- Future sync/backends must treat local data as primary and respect privacy.

### 3.3 View model / state layer (`src/state/` or React context)

**Owns:**

- Global app state:
  - Selected domain or stat.
  - View mode (bullseye vs card vs list).
  - Light-weight UI prefs (e.g., theme, whether to show gamey elements like levels).
- Glue logic that:
  - Loads JSON config and user state on startup.
  - Exposes derived tree + metrics to components.

Implementation options:

- Simple React context + hooks (likely sufficient for MVP).

### 3.4 Presentation components (`src/components/`)

Core components include:

- `DomainTree`:
  - Renders nested domains/subdomains with inline metric summary (e.g. `250/2000`, `N3`, `Done`) and progress per row.
  - Single click selects; double-click opens the domain edit modal. Drag-and-drop: drop on the thin strip above a row reorders siblings; drop on a row moves the domain as a child of that row. Sibling order is manual (array order); no separate bottom panel.
- `BullseyeDiagram`:
  - Draws concentric rings and segments based on derived metrics. Responsive and accessible (labels, center click to navigate up).
- `CharacterCard`:
  - Shows overall progress and a **Pinned** section (when any domains are pinned) above the domain tree. Pinned chips navigate to that domain; star on a chip unpins. Contains the domain tree and "Add domain" button.
- `DomainModal`:
  - Single modal for both **Add domain** and **Edit domain** (opened by "Add domain" or double-clicking a row). Fields: name, emoji, color (add only), metric toggle (No metric / Metric) and type-specific inputs (binary, progress, stages). Edit mode only: "Pin to favorites" checkbox, "Delete this domain" (triggers confirmation dialog). When an area is deleted, its id and all descendant ids are removed from `pinnedAreaIds`.
- Layout and chrome:
  - Shell, breadcrumbs, settings, radar + character card grid (no bottom domain panel).

Each component should consume **typed props** derived from the model and avoid directly poking into raw JSON where possible.

### 3.5 Styling (`Tailwind CSS`)

**Owns:**

- Theme tokens (colors, spacing, typography).
- Component-level styling for bullseye, cards, and navigation.

Constraints:

- Keep styles in Tailwind (plus small CSS modules if necessary) rather than spreading ad-hoc inline styles.
- Maintain contrast and legibility, especially in data-dense views like the bullseye.

---

## 4. JSON Stat Tree and Derived Metrics

### 4.1 JSON configuration source and schema

The stat-tree shape (Area, optional DomainMetric, aggregation) is documented in [docs/JSON-MODEL.md](JSON-MODEL.md). Config may be loaded from a bundled default or from user-supplied JSON; the model layer consumes a validated structure only.

In the near term, there are two primary ways the app might receive its JSON:

- **Bundled default**:
  - A built-in JSON configuration (shipped with the app) that represents a sensible starter life ontology.
- **User-edited configuration**:
  - A JSON blob stored in local storage or a file the user can import/export.

The model layer should not care where the JSON came from; it only requires **shape**.

### 4.2 Derivation pipeline

Given:

- `ConfigTree` — the stat-tree from JSON (validated Area[]).
- `UserState` — current values, timestamps, and preferences.

The model layer should compute for each node:

- `normalizedCompletion` (0–1 or 0–100%).
- Optional `importanceWeight` (from config).
- Optional `level` or rank (future).

These outputs feed:

- The bullseye (visual encoding).
- The character card (headline stats).
- Any future charts or reports.

**Current progress (Phase 1 — unified domain metrics):**

A single function **`calculateDomainProgress(domain)`** in the model layer (`src/model/derivedMetrics.ts`) computes 0–100% per node:

- **If the node has a `metric`:**
  - **binary:** 100 if `value === 1`, else 0.
  - **progress:** `min(100, (current / max) * 100)` when `max > 0`; else 0.
  - **stages:** If `stages.length <= 1`, 100 when `currentIndex === 0` else 0; else `(currentIndex / (stages.length - 1)) * 100`.
- **Else if the node has children:** Aggregate children’s progress using the node’s `aggregation`:
  - `average` (default): mean of children’s progress.
  - `minimum`: minimum of children’s progress.
- **Else:** 0 (leaf with no metric).

Behavior is deterministic for the same tree and values. The bullseye and character card both use this single progress value; there is no separate “trackers vs milestones” source.

**Gamification:** Optional gamification state (totalXp, completionLog); binary completions award XP; level from total XP. See §5 and the roadmap.

---

## 5. Gamification

Gamification (XP, level, completion log) is implemented. The app persists optional `gamification` (`totalXp`, `completionLog`). Binary domains set to done add a completion entry and award XP; character level is derived from total XP. The character card shows level and XP bar. When an area is deleted, its id and all descendant ids are removed from `pinnedAreaIds`. Radar: relative view (progress to next level per axis, tier labels) and objective view (absolute %); optional multi-series show multiple polygons and a legend. See PROJECT.md and the roadmap.

---

## 6. Environment and Tooling

The app stack is:

- **Frontend:** React + TypeScript.
- **Bundler/dev server:** Vite.
- **Styling:** Tailwind CSS.

Once the `life-dashboard/` contents are promoted to the root, `docs/DEV.md` should be updated so that standard commands look like:

- Development: `npm run dev` (or `pnpm dev` / `yarn dev` depending on chosen manager).
- Test: `npm test` or equivalent.
- Build: `npm run build`.
- Lint/typecheck: project-specific scripts (e.g. `npm run lint`, `npm run typecheck`).

No backend or external services are assumed for MVP.

---

## 7. Constraints and Non-Goals (Architecture)

- **Local-first:** All core functionality should work entirely in the browser without network access.
- **Privacy by default:** No personal stat data leaves the device unless a future sync feature is explicitly enabled.
- **Simplicity over abstraction:**
  - Prefer straightforward TypeScript types and functions over heavy generic frameworks for the model layer.
- **Single source of truth:** The JSON stat tree + user state should be the authoritative representation from which all views are derived.

Future extensions (sync, templates, sharing) should build on these foundations rather than replacing them.
