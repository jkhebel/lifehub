# Life Dashboard — JSON Stat-Tree Model

Phase 1 schema for the Life Dashboard stat tree. This document describes the **Area** (domain) structure and optional **DomainMetric** that implement the conceptual model in [PROJECT.md](PROJECT.md) (domains, subdomains, progress, balance). The canonical TypeScript types live in the app (`src/types/`); this doc is the schema reference for docs and for validation/import.

---

## 1. Mapping to PROJECT.md

| PROJECT.md concept | JSON / implementation |
| --- | --- |
| **Domain / subdomain** | `Area` — tree node with `id`, `name`, `children` (sub-areas), `parentId`. |
| **How a domain is measured** | Optional `metric` on each area: `binary`, `progress`, or `stages`. |
| **Completion** | Derived from `metric` (or aggregation of children when no metric). |
| **Balance** | Expressed by area-level progress; aggregation mode (`average` / `minimum`) for non-leaf nodes. |

The same tree drives navigation, derived metrics, bullseye visualization, and character card (single source of truth).

---

## 2. Area (domain node)

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | string | Yes | Stable identifier (for persistence and selection). |
| `name` | string | Yes | Display label (e.g. "Health", "Growth"). |
| `color` | string | Yes | Hex color for UI (e.g. `"#22c55e"`). |
| `icon` | string | No | Optional emoji or icon identifier. |
| `description` | string | No | Short description. |
| `children` | Area[] | Yes | Nested sub-areas (may be empty). |
| `parentId` | string \| null | Yes | Parent area id; `null` for root areas. |
| `metric` | DomainMetric | No | How this node is measured; if absent, progress is derived from children (or 0 if leaf). |
| `aggregation` | string | No | `"average"` \| `"minimum"`; used when no metric and node has children. Default `"average"`. |
| `statName` | string | No | Game-style stat label (e.g. HP, Charm, Wisdom); shown on character card when set. |

**Legacy (invalid for clean-slate):** Areas must **not** have `trackers` or `achievements`. Configs that contain them fail validation and the app falls back to the default six domains.

---

## 3. DomainMetric (optional per-node metric)

Each area may have at most one `metric`. If present, progress for that node is computed from the metric; if absent and the node has children, progress is the aggregation of children’s progress; if absent and no children, progress is 0.

### 3.1 Binary

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `type` | `"binary"` | Yes | |
| `value` | 0 \| 1 | Yes | 0 = not done, 1 = done. Progress: 0% or 100%. |

### 3.2 Progress

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `type` | `"progress"` | Yes | |
| `current` | number | Yes | Current value. |
| `max` | number | Yes | Maximum (used for 0–100%; if max ≤ 0, progress is 0). |
| `unit` | string | No | Unit label (e.g. `"hours"`, `"%"`). |
| `target` | number | No | Optional goal (future use; v1 uses current/max for progress). |

Progress = `min(100, (current / max) * 100)`.

### 3.3 Stages

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `type` | `"stages"` | Yes | |
| `currentIndex` | number | Yes | Index into `stages` (0-based). |
| `stages` | string[] | Yes | Ordered list of stage names (e.g. A1, A2, B1, B2). |
| `stageBounds` | number[] | No | Numeric bounds per tier; length must be `stages.length + 1` (e.g. [0, 1000, 2000, 4000, 6000] for word-count tiers). |
| `currentValue` | number | No | Raw value when using `stageBounds` (e.g. vocabulary count); tier is derived from which range contains this value. |

Progress: if `stageBounds` and `currentValue` are set, progress within current tier toward next; else if `stages.length <= 1`, 100% when `currentIndex === 0` else 0%; else `(currentIndex / (stages.length - 1)) * 100`.

---

## 4. Example (minimal tree as JSON)

Root is an array of top-level areas. Nested structure uses `children`; optional `metric` per node.

```json
[
  {
    "id": "health",
    "name": "Health",
    "color": "#22c55e",
    "icon": "💚",
    "description": "Physical and mental wellness",
    "parentId": null,
    "aggregation": "average",
    "children": [
      {
        "id": "fitness",
        "name": "Physical Fitness",
        "color": "#16a34a",
        "icon": "🏋️",
        "parentId": "health",
        "metric": {
          "type": "progress",
          "current": 3,
          "max": 5,
          "unit": "sessions/week"
        },
        "children": []
      },
      {
        "id": "checkup",
        "name": "Annual checkup done",
        "color": "#16a34a",
        "parentId": "health",
        "metric": { "type": "binary", "value": 1 },
        "children": []
      }
    ]
  }
]
```

---

## 5. Validation expectations

A validation function for raw JSON configs should:

- Accept a JSON value that is an **array of objects** (root areas).
- For each area: require `id` (string), `name` (string), `color` (string), `children` (array), `parentId` (string or null).
- Forbid `trackers` and `achievements` on any area (old shape → validation fails; loader uses default).
- If `metric` is present: validate by type — binary: `value` 0 or 1; progress: `current` and `max` numbers; stages: `currentIndex` number, `stages` non-empty array of strings; if `stageBounds` present, length must be `stages.length + 1` and ascending; if `currentValue` present, must be number.
- If `statName` present, must be string.
- Recursively validate children.
- Optionally: default `aggregation` to `"average"` when absent and allow only `"average"` or `"minimum"`.

Configs can come from a **bundled default** (e.g. six OG domains) or **user state** (localStorage); the model layer consumes the validated shape only.

---

## 6. Persisted state

Dashboard state persisted to localStorage includes:

- `areas` — the tree of areas (new shape only).
- `currentAreaId` — selected domain id or null.
- `breadcrumbs` — array of area ids for navigation path.
- `pinnedAreaIds` — array of domain ids pinned as favorites for quick access (order preserved).
- `gamification` — when present: `totalXp` (number) and `completionLog` (array of `{ domainId, completedAt }`).

When an area is deleted, its id and all descendant ids are removed from `pinnedAreaIds` so the list does not retain stale references.

Gamification is implemented (XP from binary completions; character level derived from total XP). See §7 for the Levels metric and §8 for the JSON view.

---

## 7. Levels metric (derived, not stored)

**Character level** is not stored in the JSON tree. It is **derived** from `gamification.totalXp`: the app uses a sublinear curve so that each level requires more XP than the last. The character card displays this level and an XP progress bar.

**Per-domain “level”** in the UI is also derived:

- For **stages** metrics: the radar’s “To next level” view shows progress toward the *next tier* (e.g. A1 → A2) and displays the current tier label. When `stageBounds` and `currentValue` are set, progress within the current tier is computed from the numeric value.
- For other metrics: “level” is expressed as the node’s completion percentage (0–100%).

So the JSON schema does not include a `level` field on areas; levels are computed by the model from `gamification`, metric type, and progress.

---

## 8. JSON view (Data as JSON)

The app provides a **Data (JSON)** view (modal) that:

- Shows the full persisted dashboard state as formatted JSON: `areas`, `gamification`, `currentAreaId`, `breadcrumbs`, `pinnedAreaIds`.
- Allows editing the text and **Apply**ing; the same validation used for config loading (see §5) is run on `areas`. Invalid areas produce an error message; other top-level fields are normalized or preserved from current state if missing.
- Is useful for power users, backups, and debugging.

The schema described in this document (Area, DomainMetric, persisted state in §6) is what that JSON represents. Any edits via the JSON view must conform to the same validation expectations.
