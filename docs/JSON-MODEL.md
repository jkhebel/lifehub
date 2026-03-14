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
| `stages` | string[] | Yes | Ordered list of stage names (e.g. N5, N4, N3, N2, N1). |

Progress: if `stages.length <= 1`, 100% when `currentIndex === 0` else 0%; else `(currentIndex / (stages.length - 1)) * 100`.

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
- If `metric` is present: validate by type — binary: `value` 0 or 1; progress: `current` and `max` numbers; stages: `currentIndex` number, `stages` non-empty array of strings.
- Recursively validate children.
- Optionally: default `aggregation` to `"average"` when absent and allow only `"average"` or `"minimum"`.

Configs can come from a **bundled default** (e.g. six OG domains) or **user state** (localStorage); the model layer consumes the validated shape only.

---

## 6. Persisted state

Dashboard state persisted to localStorage includes only:

- `areas` — the tree of areas (new shape only).
- `currentAreaId` — selected domain id or null.
- `breadcrumbs` — array of area ids for navigation path.

Gamification (XP, badges, completion log) is deferred; when re-added, it can be keyed off “binary domain completed” and optional progress/stages thresholds.
