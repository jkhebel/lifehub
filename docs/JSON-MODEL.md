# Life Dashboard — JSON Stat-Tree Model

Phase 1 schema for the Life Dashboard stat tree. This document describes the **Area** and **Tracker** structures that implement the conceptual model in [PROJECT.md](PROJECT.md) (domains, subdomains, stats, completion, balance). The canonical TypeScript types live in the app (`life-dashboard/src/types/`); this doc is the schema reference for docs and for validation/import.

---

## 1. Mapping to PROJECT.md

| PROJECT.md concept | JSON / implementation |
| --- | --- |
| **Domain / subdomain** | `Area` — tree node with `id`, `name` (label), optional `children` (sub-areas). |
| **Stat** | `Tracker` — attached to an `Area` via `trackers[]`; has `type`, `value`, optional `target`, `unit`, `weight`. |
| **Completion** | Derived from `Tracker` `value` vs `target` (or `max`); aggregated per area via `aggregation`. |
| **Balance** | Expressed by area-level progress and optional `targetProgress` / `targetDate`; future balance metrics can layer on the same tree. |

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
| `trackers` | Tracker[] | Yes | Stats belonging to this node (may be empty). |
| `children` | Area[] | Yes | Nested sub-areas (may be empty). |
| `achievements` | Achievement[] | No | Milestones, tasks, and projects for this area. |
| `parentId` | string \| null | Yes | Parent area id; `null` for root areas. |
| `targetProgress` | number | No | Target progress 0–100 for this area. |
| `targetDate` | string | No | ISO date (e.g. `"2025-12-31"`). |
| `aggregation` | string | No | `"average"` \| `"weighted"` \| `"minimum"`; default `"average"`. |

---

## 3. Tracker (stat)

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | string | Yes | Stable identifier. |
| `name` | string | Yes | Display label. |
| `type` | string | Yes | `"number"` \| `"percentage"` \| `"level"` \| `"boolean"` \| `"progress"`. |
| `value` | number | Yes | Current value (boolean: 0/1). |
| `target` | number | No | Target for completion (e.g. hours, count). |
| `min` | number | No | Minimum (e.g. for sliders). |
| `max` | number | No | Maximum (e.g. for level or percentage cap). |
| `unit` | string | No | Unit label (e.g. `"hours/week"`, `"%"`). |
| `color` | string | No | Override color; usually inherited from area. |
| `weight` | number | No | Used when parent `aggregation` is `"weighted"`; default 1. |

---

## 4. Example (minimal tree as JSON)

Root is an array of top-level areas. Nested structure uses `children` and `trackers` per area.

```json
[
  {
    "id": "health",
    "name": "Health",
    "color": "#22c55e",
    "icon": "💚",
    "description": "Physical and mental wellness",
    "parentId": null,
    "targetProgress": 80,
    "targetDate": "2025-12-31",
    "aggregation": "average",
    "trackers": [],
    "children": [
      {
        "id": "fitness",
        "name": "Physical Fitness",
        "color": "#16a34a",
        "icon": "🏋️",
        "parentId": "health",
        "trackers": [
          {
            "id": "workouts",
            "name": "Workouts This Week",
            "type": "number",
            "value": 3,
            "target": 5
          },
          {
            "id": "cardio",
            "name": "Weekly Cardio Minutes",
            "type": "progress",
            "value": 90,
            "target": 150,
            "min": 0,
            "max": 150,
            "unit": "min"
          }
        ],
        "children": []
      }
    ]
  }
]
```

---

## 5. Validation expectations (T1)

A validation function for raw JSON configs should:

- Accept a JSON value that is an **array of objects** (root areas).
- For each area: require `id` (string), `name` (string), `color` (string), `trackers` (array), `children` (array), `parentId` (string or null).
- For each tracker: require `id` (string), `name` (string), `type` (one of the allowed types), `value` (number).
- Reject obviously malformed input (e.g. missing `id`, `children` not an array, invalid `type`).
- Optionally: normalize (e.g. default `aggregation` to `"average"`, ensure `weight` present when needed). Strict vs minimal mode can be defined in T1/T1b.

Configs can come from a **bundled default** (e.g. shipped with the app) or **user-supplied** (import or localStorage); the model layer consumes the validated shape regardless of source. See [TASKS.md](TASKS.md) T1 and any T1b/T10 config-loading task.

---

## 6. Achievement (milestones, tasks, projects)

Each **Area** may have an optional `achievements` array. An **Achievement** represents a milestone (one-time), task (repeatable), or project (container). **Current UI focus:** milestones only; the app exposes “Add milestone” and “Project” (as a container for milestones). Task tracking is supported in the schema but not yet in the UI.

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `id` | string | Yes | Stable identifier. |
| `name` | string | Yes | Display label. |
| `kind` | string | Yes | `"milestone"` \| `"task"` \| `"project"`. |
| `areaId` | string | Yes | ID of the area this achievement belongs to. |
| `parentId` | string | No | When nested under a project, the parent achievement id. |
| `xpReward` | number | No | XP granted on completion (tasks: per completion; milestones: one-time). |
| `targetCount` | number | No | For tasks: optional target count per period. |
| `children` | Achievement[] | No | When `kind` is `"project"`, nested achievements. |

User state (persisted separately from config) tracks **completion log** (achievementId + completedAt), **domainXp**, **unlockedBadges**, **unlockedTitles**, **avatarUnlocks**, **selectedAvatar**, and **selectedTitle**. See [ARCHITECTURE.md](ARCHITECTURE.md) §5.
