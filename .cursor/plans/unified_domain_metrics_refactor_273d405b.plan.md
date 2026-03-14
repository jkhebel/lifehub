---
name: Unified domain metrics refactor
overview: Unify trackers and milestones into a single tree of domains with optional per-node metrics (binary, progress, stages); single bottom panel; clean slate (no migration); gamification deferred until after trial usage.
todos:
  - id: types
    content: Define DomainMetric types and new Area shape (no trackers/achievements); simplify DashboardState
    status: completed
  - id: validation
    content: Update validation for new Area shape and optional metric
    status: completed
  - id: derived-metrics
    content: Single calculateDomainProgress (metric vs aggregate children); remove tracker/milestone logic
    status: completed
  - id: default-data
    content: getDefaultAreas/getResetAreas return six OG domains (new shape, no metrics)
    status: completed
  - id: persistence
    content: Persist only areas, currentAreaId, breadcrumbs; clean-slate on old shape
    status: completed
  - id: hook
    content: useDashboard without trackers/achievements/gamification; add updateDomainMetric
    status: completed
  - id: domain-panel
    content: Single bottom panel — current domain children + add subdomain + set/edit metric
    status: completed
  - id: radar-character
    content: Radar and CharacterCard use single progress; strip gamification from card
    status: completed
  - id: app-cleanup
    content: Remove AchievementsPanel, TrackerPanel, XP toast; wire single panel
    status: completed
  - id: dead-code
    content: Remove or stub AchievementsPanel, TrackerPanel, TrackerCard, StatEditor, AddTrackerModal
    status: completed
  - id: docs-tests
    content: Update JSON-MODEL, ARCHITECTURE, tests for new schema and derived metrics
    status: completed
isProject: false
---

# Unified domain metrics: evaluation and refactor plan

## 1. Current workflow (as implemented today)

**Data model**

- **Areas** (domains): tree of nodes with `id`, `name`, `color`, `children[]`, `parentId`, and optional `aggregation` (average | weighted | minimum).
- **Trackers**: live on an area in `area.trackers[]`. Each has `type` (number, percentage, level, boolean, progress), `value`, optional `target`/`min`/`max`/`unit`/`weight`. Progress is derived per tracker (e.g. value/target → 0–100%), then combined with child area progress via aggregation.
- **Achievements**: optional `area.achievements[]` — milestones (one-time), tasks (repeatable), projects (containers). Completions stored in `gamification.completionLog`; milestone progress = completed / total for that area subtree.

**UI flow**

1. User selects a domain in the tree (left: Character card + DomainTree). Breadcrumbs and radar update; **current area** drives the bottom row.
2. **Bottom row — two separate panels:**

- **Trackers** (lg:col-span-7): Lists `currentArea.trackers`; add/edit/delete trackers; edit domain name/icon; delete domain. If no area selected, shows the selected-area context (or empty).
- **Milestones** (lg:col-span-5): Lists `currentArea.achievements` (milestones + projects); "Add milestone"; claim → XP toast, badges. If no area selected, shows "Select a domain from the list above...".

1. **Radar**: One view. Progress per wedge = `calculateRadarProgress(area, completionLog)`: if the area (or descendants) has any milestones → use milestone progress; else use tracker-based progress (aggregation over trackers + children).
2. **Character card**: Uses `calculateAreaProgress` (tracker-only aggregation) for level and progress badges; gamification (XP, avatar, titles, badges) from `state.gamification`.

So today we have **two parallel systems**: numeric trackers (with types) vs discrete achievements (milestones/tasks), two panels, and the radar picks one source per area (milestone-first, else tracker).

---

## 2. Your proposal in one sentence

**One tree of homogeneous nodes (domains).** Leaf nodes define how they are measured (binary, progress, stages). Non-leaf progress is either computed from children (average/min/weighted) or overridden by the node’s own metric or a custom formula. Goals and progress-vs-time are future.

---

## 3. Evaluation and refinements

**What works well**

- **Single concept** simplifies UX: one tree, one kind of “thing” to add/edit. No “add tracker” vs “add milestone” — just “add domain” or “set how this domain is measured.”
- **Leaf = one metric** matches “each leaf needs a way to get 0–100%” and avoids the current split (trackers array vs achievements).
- **Stages** (ordered list, e.g. N5→N1, A1→C2) are a good addition; current model only has `level` (numeric) and doesn’t model “current stage in sequence” cleanly.
- **Override at non-leaf** (own metric or formula from children) keeps flexibility without forcing everything into “only children.”

**Refinements**

- **Terminology:** Keeping a single term in the schema and UI reduces confusion. **Domain** is already used in PROJECT.md and docs; **branch** is evocative but less standard. Recommendation: use **domain** in UX and docs; keep `Area` in code as the tree node type (or rename to `Domain` in a later pass). No need to support two terms in the UI.
- **“Leaf” definition:** In your model, progress is computed upward, so **leaves** = nodes with `children.length === 0`. They must have a **metric** (or we treat them as 0% until one is set). Non-leaves either have no metric (derive from children) or an explicit metric / formula.
- **Metric on node vs on children:** Clean approach: each node has an optional **metric** (your three types + suggestions below). If present, it is used for that node’s progress; if absent and node has children, progress = aggregation of children; if absent and no children, progress = 0 (or “unset” in UI).
- **Custom formula:** Start with **aggregation mode** only (average, min, weighted). Add “custom formula” (e.g. expression over child ids) as a later enhancement to avoid scope creep and expression parsing/security.

**Suggested metric types (beyond binary, progress, stages)**

- **Binary** — checkbox, done/not done. (Covers current “milestone” one-off.)
- **Progress** — current/max (and optional target for “goal”), with unit. Handles “8/60 levels”, “3/8 chapters”.
- **Stages** — current stage from an ordered list; progress = index / (length - 1) or similar. Handles JLPT, CEFR.
- **Count** (optional): Unbounded integer (e.g. “books read this year”). Could be modeled as progress with no max (progress = 0 or “N/A” until you add a target), or a dedicated type that only contributes when a **goal** is set (roadmap). Recommendation: treat as **progress** with optional `target`; if no target, node can still show the number and goals (later) can attach a target.
- **Rating/scale** (1–N): Subjective. Already coverable with **progress** (value 0–N, max N) or a small variant. No extra type required unless you want dedicated UI (e.g. stars).

So: **binary, progress, stages** are enough for v1; document that “count with no target” is progress with target optional; goals (and thus “target by date”) go on the roadmap.

**Radar display (stacked vs single)**

- **Single line per wedge** = one number per domain (current behavior). Keeps the chart readable.
- **Stacked / breakdown** = e.g. one wedge split into sub-segments for each child. Good for “drill-down” but more complex. Recommendation: implement **single-line first** (derived value per node); add a **toggle or tooltip** for “show breakdown” (stacked or list of child contributions) as a follow-up so we don’t block the refactor.

---

## 4. Decisions (confirmed)

*User confirmed: clean slate (no migration); gamification deferred until after trial usage.*

**A. Migration:** Map each tracker to a new child domain with one metric (type chosen from tracker type); map milestones to binary child domains (or one “Milestones” child with stages “none / some / all”). Preserve tree shape and IDs where possible.

- **Clean slate:** Reset to the new schema (e.g. six OG domains, no trackers/milestones); document export/backup before upgrade so users can keep a copy of the old format.

**B. Gamification (XP, badges, avatar)**
Today XP/badges are tied to **milestone claims**. In the unified model, “claiming” could be:

- **Binary metric** set to “done” (and optionally a completion timestamp for “first completed” badges).
- Keep a **completion log** (nodeId + completedAt) for binary nodes so we can still award “first milestone”, “five milestones”, etc. from “binary domains completed.”

So: keep gamification events keyed off “binary domain completed” (and optionally progress/stages thresholds later); no need to keep a separate Achievement type for that.

---

## 5. Proposed direction (no commitment to implement yet)

**Phase A — Unified tree and metrics (refactor)**

- **Schema:** One tree of nodes (domains). Each node has optional **metric**: `{ type: 'binary' | 'progress' | 'stages', ... }`. Progress for leaves with a metric = computed from metric; for nodes with children and no metric = aggregation (average/min/weighted) of children; for nodes with children and metric = override (or formula later). Remove `trackers[]` and `achievements[]` from the node type; replace with optional `metric`.
- **Bottom row:** Single panel for the **current domain**: show children (subdomains), add subdomain, and **set/edit metric** for this domain (or “derive from children”). No separate Trackers vs Milestones panels.
- **Radar:** One progress value per domain (current aggregation + override behavior). No “trackers vs milestones” — single source of truth.
- **Persistence:** Dashboard state stores the tree + metric values + completion log for binary (and any “claimed at” for gamification). Migration path per answer to (A).

**Phase B — Roadmap (later)**

- **Goals:** Target value (and optionally target date) per metric; show “progress toward goal” in card/radar.
- **Progress vs time:** Second view (toggle with radar or separate tab): progress over time (e.g. line chart per domain), requiring history snapshots or event log.
- **Custom formula:** Non-leaf progress = expression over child ids (e.g. `0.5 * Japanese + 0.5 * French`).
- **Radar breakdown:** Toggle or tooltip to show stacked/child breakdown per wedge.

---

## 6. Summary

| Topic                        | Recommendation                                                                               |
| ---------------------------- | -------------------------------------------------------------------------------------------- |
| **Term**                     | Use **domain** in UX; keep or rename `Area` in code.                                         |
| **Metric types**             | **Binary, progress, stages** for v1; count = progress with optional target.                  |
| **Leaf rule**                | Leaves (no children) need a metric to have progress; else 0 or “unset”.                      |
| **Non-leaf**                 | Progress = aggregation of children, or override with own metric; custom formula later.       |
| **Bottom row**               | One panel: current domain’s children + metric (add/edit domain, set metric).                 |
| **Radar**                    | Single value per wedge; stacked/breakdown as future toggle.                                  |
| **Goals / progress-vs-time** | Roadmap.                                                                                     |
| **Gamification**             | Keep; tie to “binary domain completed” (and optional thresholds); completion log by node id. |

**Confirmed:** Clean slate (no migration). Gamification deferred until after trial usage.

---

## 7. Concrete implementation todos

Execution order and file touch list:

**7.1 Types** ([src/types/index.ts](src/types/index.ts))

- Define `DomainMetric` union: `BinaryMetric` (`{ type: 'binary', value: 0 | 1 }`), `ProgressMetric` (`{ type: 'progress', current: number, max: number, unit?: string, target?: number }`), `StagesMetric` (`{ type: 'stages', currentIndex: number, stages: string[] }`).
- Add to `Area`: optional `metric?: DomainMetric`, keep `aggregation?: AggregationMode` (v1: only `average` and `minimum`; narrow type to `'average' | 'minimum'` or keep union and ignore `weighted` in UI/validation). Remove `trackers`, `achievements`; remove or deprecate `targetProgress`/`targetDate` for v1 (roadmap).
- `DashboardState`: only `areas`, `currentAreaId`, `breadcrumbs`. Remove `gamification`.
- Remove or keep as deprecated: `Tracker`, `Achievement`, `CompletionLogEntry`, `GamificationState`, `TRACKER_TYPES`, `getDefaultGamificationState` (delete once nothing references them).

**7.2 Validation** ([src/model/validation.ts](src/model/validation.ts))

- Validate new Area shape: require `id`, `name`, `color`, `children` (array), `parentId`. Forbid `trackers` and `achievements` (or treat as invalid for clean-slate). If `metric` present, validate by type (binary: value 0|1; progress: current/max numbers; stages: currentIndex number, stages non-empty array). Recursively validate children. On load, if any area has `trackers` or `achievements`, validation fails and loader uses default.

**7.3 Derived metrics** ([src/model/derivedMetrics.ts](src/model/derivedMetrics.ts))

- Replace with single `calculateDomainProgress(domain: Area): number`. If `domain.metric`: binary → value ? 100 : 0; progress → if max <= 0 then 0 else min(100, (current/max)*100); stages → if stages.length <= 1 then (currentIndex === 0 ? 100 : 0) else (currentIndex / (stages.length - 1))* 100. Else if `domain.children.length > 0`: aggregate children’s progress via `domain.aggregation` (average or minimum only in v1). Else: 0.
- Remove: `getTrackerProgress`, `calculateAreaProgress` (tracker-based), `calculateMilestoneProgress`, `calculateRadarProgress`, `calculateBlendedProgress`, `collectMilestones`, `getMilestoneCounts`, and any achievement/tracker-specific helpers. Keep or add simple helpers if needed (e.g. getGlobalXp/getXpLevel can be removed until gamification returns).

**7.4 Default and reset data** ([src/data/initialData.ts](src/data/initialData.ts), [src/config/loadConfig.ts](src/config/loadConfig.ts))

- `getResetAreas()` and `getDefaultAreas()`: return six OG top-level domains (Health, Career, Finances, Relationships, Growth, Recreation) in **new shape** only: `id`, `name`, `color`, `icon`, `description`, `parentId`, `children: []`, no `trackers`/`achievements`, no `metric`. Optionally add `aggregation: 'average'`.
- Stop using [defaultConfig.json](src/data/defaultConfig.json) for default (or replace with new schema). Remove or refactor `createInitialData()` so it’s not used for default load.

**7.5 Persistence** ([src/persistence/localStorage.ts](src/persistence/localStorage.ts))

- `DashboardState` type has no `gamification`. `normalizeLoadedState`: only areas, currentAreaId, breadcrumbs. If `parsed.areas` fails validation (e.g. old shape with trackers/achievements), return `createDefault()` (clean slate).

**7.6 Hook** ([src/hooks/useDashboard.ts](src/hooks/useDashboard.ts))

- State: `areas`, `currentAreaId`, `breadcrumbs` only. Remove all tracker/achievement/gamification actions and state. Add `updateDomainMetric(domainId: string, metric: DomainMetric | null)` (and optionally `updateDomain(domainId, partial)` for name/color/aggregation). Expose single `calculateDomainProgress`. Keep: `addArea`, `updateArea`, `deleteArea`, `moveArea`, `navigateToArea`, `navigateUp`, `getBreadcrumbAreas`, `resetData`, `displayAreas`, `currentArea`, etc.

**7.7 Single bottom panel** (new [src/components/DomainPanel.tsx](src/components/DomainPanel.tsx) or refactor TrackerPanel)

- One section: “Domain” or “Current domain”. When a domain is selected: show domain name (editable), list of **children** (subdomains) with progress and click to select; “Add subdomain” button; “Set metric” / “Derive from children” for **this** domain. Metric editor: type selector (binary / progress / stages) and type-specific inputs (binary: checkbox; progress: current, max, unit; stages: ordered list editor + current selection). For non-leaf: “Derive from children” (aggregation dropdown) or “Override with own metric”. When no domain selected: “Select a domain from the list above.”

**7.8 Radar and Character card** ([src/components/BullseyeDiagram.tsx](src/components/BullseyeDiagram.tsx), [src/components/CharacterCard.tsx](src/components/CharacterCard.tsx))

- Radar: pass single `calculateDomainProgress`; no branching. Character card: remove all gamification (avatar, title, XP, badges). Show overall progress (from root domains) and optionally a simple “level” or progress bar; keep domain tree + Add domain inside card.

**7.9 App and cleanup** ([src/App.tsx](src/App.tsx))

- Remove AchievementsPanel, TrackerPanel, XP toast, gamification props. Single bottom panel (DomainPanel). Radar and CharacterCard use single progress. Remove settings references to “Show levels and badges” if purely gamification.

**7.10 Dead code**

- Remove: [AchievementsPanel.tsx](src/components/AchievementsPanel.tsx), [TrackerPanel.tsx](src/components/TrackerPanel.tsx), [TrackerCard.tsx](src/components/TrackerCard.tsx), [AddTrackerModal](src/components/TrackerPanel.tsx) (or extract and delete), [StatEditor](src/components/StatEditor.tsx) if only used by trackers. Update [components/index.ts](src/components/index.ts). Optionally keep [gamification.ts](src/model/gamification.ts) but do not import from app until gamification is re-added.

**7.11 Docs and tests**

- [docs/JSON-MODEL.md](docs/JSON-MODEL.md): New Area shape, DomainMetric types; remove Tracker and Achievement sections.
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md): Derived metrics = single domain progress; remove tracker/milestone split.
- Tests: Update [validation.test.ts](src/model/validation.test.ts) for new schema. Update [derivedMetrics.test.ts](src/model/derivedMetrics.test.ts) for `calculateDomainProgress` (binary, progress, stages, aggregation). Update or remove [gamification.test.ts](src/model/gamification.test.ts). [loadConfig.test.ts](src/config/loadConfig.test.ts): default/reset areas new shape. Run full test suite and fix any broken imports or assertions.

---

## 8. Validation (how we’ll verify)

- **Types:** No references to `Tracker`, `Achievement`, `GamificationState` in app code; `Area` has optional `metric`, no `trackers`/`achievements`.
- **Persistence:** Load app with no localStorage → see six OG domains. Save, reload → state restored. Put old JSON (with trackers) in localStorage → reload → see default six domains (clean slate).
- **Progress:** Add a leaf domain with binary metric, set done → radar and card show 100% for that wedge. Add progress metric 5/10 → 50%. Add stages [A,B,C], currentIndex 1 → 33.3% (or 50% per chosen formula). Parent with two children (50%, 100%) and average → 75%.
- **UI:** Single bottom panel; add subdomain, set metric (binary/progress/stages), edit domain name; no Trackers or Milestones panels.

---

## 9. Design choice (confirmed)

**Aggregation (v1):** Only **average** and **minimum** in v1. No weighted aggregation (no weight per child); can add later.

---

## 10. Refinements (final pass)

**Edge cases in derived metrics:** (1) Progress metric: if `max <= 0`, return 0% to avoid division by zero. (2) Stages: if `stages.length <= 1`, return 100% when `currentIndex === 0`, else 0%. (3) Aggregation: type can stay `'average' | 'minimum'` for v1 (drop `weighted` from union or ignore in UI).

**Domain panel:** Include delete domain (with confirmation) in the single bottom panel; reuse existing delete-area flow from current app.

**Character card:** Show **aggregate progress only** (option A). No Level 1–4 for now; levels can be re-added when we layer XP back on (see §11).

---

## 11. Future: levels and XP (suggestions)

*To revisit after the unified-domain refactor and trial usage.*

**Premise:** Progressing in (and completing) nodes generates XP; XP drives level-ups. Later, repeating tasks (e.g. “worked out today”) can also grant XP without necessarily moving a goal metric.

**(a) How much XP per accomplishment?**

- **Fixed per event type:** e.g. binary completed = 50 XP, each stage advance = 25 XP, progress milestone (e.g. 25% step) = 10 XP. Simple but one-size-fits-all.
- **Configurable per domain/metric:** Each domain (or each metric) has an optional `xpReward` (or `xpOnComplete` / `xpPerStep`). Binary: one reward on complete. Progress: optional XP per N% or on reaching target. Stages: XP per stage or on reaching final stage. User or template sets the number; defaults keep it simple.
- **Formula from “effort”:** e.g. XP = base × depth (deeper nodes worth more) or × “importance” weight. More flexible but harder to explain; better as an advanced option.

**Recommendation:** Start with **configurable per node** (optional `xpOnComplete` for binary, optional `xpPerStage` or `xpOnComplete` for stages, optional `xpOnReachTarget` for progress). Sensible defaults (e.g. 50 for binary complete) so users can ignore it; power users can tune.

**(b) How much XP per level?**

- **Linear:** Level N requires N × 100 XP (100, 200, 300 …). Easy to grasp; later levels feel same “distance” (can feel grindy).
- **Sublinear (e.g. sqrt):** e.g. level = floor(sqrt(totalXP / 100)) + 1. Early levels fast, later levels slow; common in games. Fits “early wins, long-term growth.”
- **Exponential / step:** e.g. level 2 = 200 XP, level 3 = 500, level 4 = 1000. Clear “tiers”; tuning curve is the design lever.

**Recommendation:** **Sublinear (sqrt or similar)** so early progress feels rewarding and levels don’t explode. Exact constant (e.g. 100 XP “per level unit”) can be tuned; optionally make it a **user setting** (e.g. “XP needed per level: 100 / 150 / 200”) so difficulty is adjustable without changing the curve shape.

**(c) Repeating tasks and XP**

- **Same as accomplishments:** Each completion of a repeating task grants a fixed or configurable XP amount (e.g. “Worked out today” = 10 XP). No progress toward a goal metric unless we also model that separately (e.g. “Strength” domain with progress metric “max lift” and a separate “Workouts this week” repeating task for XP).
- **User decision:** Yes—let the user (or template) set “XP per completion” for repeating tasks. Defaults (e.g. 5–10 XP for a daily check-in) keep it simple; some users may want 0 (track only, no XP) or higher for “hard” tasks.
- **Caps / anti-grind:** Optional: cap XP per task per day/week (e.g. max 3 completions count for XP) to avoid grinding one task. Can be a later refinement.

**Summary:** (a) Optional XP per node/event type with good defaults; (b) level = f(total XP) with a sublinear curve and optional user-tunable constant; (c) repeating tasks grant user-configurable XP per completion, with optional caps later. All of this stays out of scope for the current refactor and can be designed in detail once the unified model is in place and we’ve done a trial run.
