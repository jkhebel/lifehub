# Life Dashboard — Design

Design details for the Life Dashboard app, aligned with [PROJECT.md](PROJECT.md). (The previous content of this file described another project and has been replaced so DESIGN.md is the single design reference for Life Dashboard.)

---

## JSON stat-tree schema

The Phase 1 data model is the **Area** tree with optional **DomainMetric** per node. Full field list, validation expectations, and a minimal JSON example are in **[docs/JSON-MODEL.md](JSON-MODEL.md)**. That document is the schema reference for implementation and config loading.

Summary:

- **Tree:** Root is an array of **Area** objects; each area has `id`, `name`, `color`, `children[]` (nested areas), `parentId`, optional `metric` (binary, progress, or stages), and optional `aggregation` (average | minimum) when deriving from children.
- **Metrics:** Each area may have at most one **DomainMetric** — binary (done/not), progress (current/max, optional unit), or stages (ordered list + current index). Progress is derived from the metric or by aggregating children.
- **Validation:** A validation function must accept valid JSON and reject malformed input (e.g. missing `id`, non-array `children`, or legacy `trackers`/`achievements`); see [TASKS.md](TASKS.md).

---

## Derived metrics and progress

Completion (0–100%) is derived per node from its metric (or by aggregating children when no metric). Formulas are documented in [ARCHITECTURE.md](ARCHITECTURE.md) §4.2. The same derived metrics feed the bullseye and the character card; no view-specific derivation.

---

## Gamification (early hooks)

Levels and badges are **placeholders** in Phase 1 / early Phase 2. Design rules are not locked in; they will be defined by Architect and Game Design within the guardrails in [PROJECT.md](PROJECT.md) §4.3 (no punitive streak loss, no dark patterns).

- **Level:** A computed value (e.g. from aggregate completion across domains). Model layer should expose a function that returns a global level and optional per-domain level-like indicators.
- **Badges:** A list of triggered achievements from thresholds (e.g. completion, streaks). Model layer should expose a function that returns the list; UI (e.g. character card) displays them.

See [ARCHITECTURE.md](ARCHITECTURE.md) §4.2 and §5, and [TASKS.md](TASKS.md) T9.
