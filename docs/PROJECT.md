# Life Dashboard

## Character Sheet for Your Real Life

*A gamified personal dashboard for tracking your growth across nested life domains, visualized as bullseye diagrams and character stats.*

---

# 1. Purpose

Life Dashboard is a personal dashboard and **character sheet for your real life**.

It is designed to help you:

- Map your life into **nested domains** (e.g. `Growth → Languages → French`).
- Track **progress and habits** across those domains.
- See your overall state at a glance via **bullseye diagrams** and **card-like stat views** (inspired by TCG/RPG UIs).
- Feel like you are **“leveling up” a character that represents you**, without turning life into a grindy game.

This document defines the conceptual foundation and long-term direction for Life Dashboard. Other docs (ARCHITECTURE, PLAN, TASKS, DESIGN) translate this into implementation details.

---

# 2. Core Concepts

## 2.1 Domains and subdomains

The core mental model is a **tree of domains**:

- High-level areas: `Growth`, `Health`, `Relationships`, `Work`, `Play`, etc.
- Nested subdomains: e.g. `Growth → Languages → French`, `Health → Fitness → Strength`.
- Each node in the tree can either:
  - Be a **container** for more subdomains, or
  - Hold one or more **stats** that can be tracked.

This tree is **data-driven**, not hardcoded: the same engine should work for many different personal ontologies.

## 2.2 Stats

Stats are **quantitative or qualitative measures** attached to nodes in the tree, for example:

- “French study hours per week”
- “Gym sessions this month”
- “Meditation streak”
- “Subjective confidence in public speaking (1–5)”

Each stat can have:

- A **current value** (e.g. `12`, `true`, `3/5`).
- An optional **target or cap** (e.g. `20 hours`, `5/5`).
- Optional **metadata**: description, tags, weight/importance, units.

The dashboard should be able to **derive normalized values** (0–1 or 0–100%) from these raw stats so they can be compared and visualized.

## 2.3 Completion and progress

Life Dashboard is not about perfection; it is about **seeing momentum and balance**.

For any node in the tree (e.g. `Growth`), we can derive:

- **Completion**: how close you are to the defined targets under that node.
- **Balance**: whether attention is being spread in a way that matches your chosen priorities.
- **Trend** (future): whether things are improving, declining, or stable over time.

These derived measures are **computed from the JSON stat tree**; the same underlying representation drives both numbers and visuals.

## 2.4 Bullseye diagrams

Bullseye diagrams are **concentric ring visualizations** that summarize:

- Outer rings: broader domains.
- Inner rings or segments: more specific subdomains or stats.
- Fill/opacity/size: degree of completion or focus.

The goal is that, at a glance, you can see:

- Which domains are bright and full (healthy, active).
- Which domains are faint or empty (neglected).
- How your life “shape” changes over time.

The bullseye is a **view** over the same JSON model; no custom wiring for specific domains.

## 2.5 Character sheet and card UI

Beyond the bullseye, each person has a **character representation**:

- A **card-like view** (similar to a TCG card or RPG character sheet).
- Key stats surfaced with icons, labels, colors, and short descriptors.
- Optional **flavor text** that makes progress feel narrative rather than purely numeric.

The character representation should remain:

- **Respectful and non-judgmental**.
- **Configurable** enough to match different user aesthetics and priorities.

---

# 3. JSON-Configured Stat Tree

Life Dashboard treats the structure of your life as **data**, not code.

The core idea: your domains, subdomains, and stats can be represented as a simple, nested JSON structure that the app can read, validate, and render.

At a high level, each node in the tree looks like:

- An **identifier** (`id`).
- A **display label** (`label`).
- Optional **children** (subdomains).
- Optional **stat definition** (if this node is trackable).

One possible sketch (illustrative, not final schema):

```json
[
  {
    "id": "growth",
    "label": "Growth",
    "children": [
      {
        "id": "languages",
        "label": "Languages",
        "children": [
          {
            "id": "french",
            "label": "French",
            "stat": {
              "type": "progress",
              "current": 12,
              "target": 20,
              "unit": "hours/week",
              "weight": 1.0
            }
          }
        ]
      }
    ]
  }
]
```

### 3.1 Constraints and goals for the JSON model

- **Human-readable**:
  - You should be comfortable editing it manually.
  - Keys and nesting should be intuitive even without deep docs.
- **Stable identifiers**:
  - `id` fields should be stable over time so history or saved state can be associated reliably.
- **Extensible but not over-abstracted**:
  - Leave room for future `stat.type` variants (e.g. `boolean`, `rating`, `counter`, `composite`), but do not design an overly generic type system before it is needed.
- **Single source of truth**:
  - The same tree feeds:
    - UI navigation.
    - Derived stats/completion.
    - Bullseye and character card rendering.
    - Any future reporting or export.

The Architect and future JSON/schema work will refine this model, but this is the **conceptual anchor** for all further design.

---

# 4. Gamification Philosophy

Life Dashboard is intentionally **gamified**, but not a game.

The core metaphor is: **“You are leveling up a character that represents you.”**

## 4.1 Desired feel

- Lightly **RPG/TCG-inspired**: levels, badges, visually satisfying stats.
- **Encouraging** rather than shaming.
- **Reflective**: helps you see patterns and make choices, not just chase streaks.
- **Customizable**: supports different people’s definitions of “winning”.

## 4.2 Possible mechanics (exploratory)

These ideas are **brainstorm seeds**, not locked-in requirements:

- **Levels and XP**:
  - Gain XP when you move stats in a positive direction (e.g. log practice, complete a session).
  - Level thresholds that reflect cumulative progress across domains.
- **Domain “mastery levels”**:
  - Each domain can have its own level or rank (e.g. Novice → Adept → Expert), derived from stat completion.
- **Badges and milestones**:
  - Lightweight achievements for crossing meaningful thresholds (e.g. “French: 50 hours total”, “30 days of consistent journaling”).
- **Quests or focus modes**:
  - Optional, short-term focuses that highlight a subset of stats/domains for a week or month.

These mechanics should all be derived from, or attached to, the same JSON stat tree and derived metrics where possible.

## 4.3 Guardrails and anti-patterns

Gamification can easily become harmful; Life Dashboard explicitly avoids:

- **Punitive streak loss** that erases months of effort for a single missed day.
- **Manipulative notifications or dark patterns** designed to maximize time-in-app instead of value.
- **Overly competitive comparisons** between people (this is a **personal** dashboard first).

Design constraints:

- Celebrate **consistency and reflection**, not perfection.
- Ensure users can **export and back up their data** so they never feel trapped.
- Make it easy to **turn off or soften** specific gamification features (e.g. hide levels, show neutral instead of evaluative language).

---

# 5. Product Pillars

Life Dashboard is guided by several pillars:

- **Simplicity of configuration**:
  - Life structure and stats are defined in a small, understandable JSON structure.
  - Adding a new domain or stat should feel simple and safe.
- **Delightful visualization**:
  - Bullseye diagrams and card-like stats should feel playful and expressive, not sterile dashboards.
- **Ownership and privacy**:
  - Personal data should, by default, live locally on the user’s device.
  - Any future sync/backends must have clear privacy guarantees.
- **Extensibility**:
  - The stat tree and rendering engine should be general enough to support new visualizations, templates, or integrations later.

---

# 6. Initial Scope (MVP)

The initial version of Life Dashboard focuses on:

- A functioning **React/Vite/Tailwind** app that renders:
  - A configurable **JSON stat tree**.
  - At least one **bullseye diagram** view over that tree.
  - A basic **character card** view summarizing key stats.
- **Local persistence**:
  - The ability to save and load your configuration and current stat values (e.g. via localStorage).
- **Basic editing flows**:
  - Add, rename, and reorder domains/subdomains.
  - Define simple stats with current value and optional target.

Out of scope for MVP:

- Multi-user accounts or social features.
- Complex history/time-series analytics.
- Sophisticated game systems (skill trees, loot, etc.).

---

# 7. Long-Term Vision

Longer term, Life Dashboard can grow into:

- A **modular personal development hub** with:
  - Multiple visualization modes based on the same data.
  - Templates or “builds” for different life philosophies (e.g. productivity-focused, creative-focused, health-focused).
- A **platform for experiments in self-reflection**:
  - Users can try different stat ontologies and see how it changes their perception of progress.
- A possible **sync-enabled app**:
  - Optional cloud or file-based sync so the same dashboard can be used across devices, still respecting privacy.

The core constraint: as it grows, the system should never lose the **clarity of the JSON stat tree** as the source of truth for structure and stats.

---

# 8. Guiding Questions

The guiding questions for Life Dashboard are:

- How can we represent a person’s life as a **nested, editable stat tree** that remains both honest and kind?
- How can we use **gamified metaphors** (levels, cards, bullseyes) to make growth feel engaging without turning it into a grind?
- How can we keep the system **simple enough** to be edited by hand, while still being powerful enough to express complex, multi-domain lives?

These questions should inform future design and architectural decisions across the project.

---

End of Compass Document.
