# Life Dashboard — Plan

Phases and initial scope for the Life Dashboard app. Aligned with [PROJECT.md](PROJECT.md) (compass) and [ARCHITECTURE.md](ARCHITECTURE.md).

---

## Vision and strategy

Life Dashboard is a **gamified personal dashboard**: a character sheet for your real life, powered by a JSON-configured stat tree and visualized via bullseye diagrams and card-like stats.

Strategy:

- **Start practical**: make it easy to define a stat tree in JSON and see it rendered.
- **Design playfully**: lean into the TCG/RPG metaphor without making life feel like a grind.
- **Layer mechanics incrementally**: introduce gamification (levels, badges, quests) over time as the model and UI stabilize.

We avoid over-engineering complex game systems before the basic model, visualization, and editing flows feel solid.

---

## Phases overview

| Phase | Focus | Status |
| --- | --- | --- |
| **Phase 1** | MVP: JSON stat-tree, bullseye + card views, local persistence | Done |
| **Phase 2** | Gamification: levels, badges, milestones/tasks, XP, cosmetics, radar toggle | In progress |
| **Phase 3** | Deployment (Fly.io), authentication (Supabase), per-user persistence | In progress |
| **Phase 4+** | Integrations: templates, import/export, optional sync (e.g. Todoist/Google Tasks) | Placeholder |

---

## Phase 1 scope — MVP

**In scope:**

- **JSON stat-tree model**:
  - Define a simple, human-editable JSON structure for domains, subdomains, and stats (see [docs/JSON-MODEL.md](JSON-MODEL.md)).
  - Implement TypeScript types and validation utilities.
- **Visualization**:
  - Render at least one **bullseye diagram** driven purely from the JSON model + derived metrics.
  - Render a **character card** view that surfaces key stats and an overall sense of level/progress (even if the “level” is a basic derived metric). The card is a **view over the same derived metrics** as the bullseye (no separate logic); it selects which stats to show (e.g. top-level domains only, or a small set of user-selected highlights) and displays them in a card-like “character sheet” layout. See T6 and [ARCHITECTURE.md](ARCHITECTURE.md) §3.4.
- **Navigation and editing**:
  - Navigate the domain tree.
  - Adjust stat values and basic properties (e.g. targets) via UI controls.
- **Persistence**:
  - Save stat values and preferences locally (e.g. `localStorage`), and reload them on app start.
- **Architecture alignment**:
  - Keep model, persistence, and presentation concerns separated as described in ARCHITECTURE.

**Out of scope for Phase 1:**

- Multi-user auth or accounts.
- Cloud sync or remote storage.
- Rich history/time-series analytics.
- Complex game mechanics (e.g. skill trees, loot, competitive leaderboards).

---

## Phase 1 success criteria

Phase 1 is successful when:

- A user can **define or load** a JSON stat tree (either via a bundled default or simple editing flow).
- The app:
  - Renders a **bullseye diagram** representing that tree and its completion levels.
  - Shows a **character card** summarizing a subset of stats and an overall sense of progress.
- The user can:
  - Navigate between domains and subdomains.
  - Adjust at least one stat’s **current value** and **target** through the UI.
  - See those changes reflected **immediately** in both the bullseye and the card.
- Changes to stats and preferences **persist across browser refresh** via local storage or equivalent.
- The codebase reflects the module boundaries in `docs/ARCHITECTURE.md` (model, persistence, state, presentation).

---

## Phase 2 — Gamification and UX

Phase 2 builds on the MVP by adding:

- **Levels and mastery**:
  - Global “character level” derived from aggregate completion.
  - Per-domain “mastery levels” (e.g. Novice → Adept → Expert).
- **Badges and milestones**:
  - A small set of meaningful achievements (e.g. hitting a target, sustained consistency).
- **UX polish**:
  - Smoother editing flows (add/remove/reorder domains/stats).
  - Better empty states, onboarding, and help text explaining how to configure the dashboard.
- **Accessibility and responsiveness**:
  - Ensure bullseye and card views are usable across device sizes and by keyboard/screen-reader users.

Phase 2 should be guided closely by Architect, UI/UX, and Game Design agents, with careful attention to the guardrails in `docs/PROJECT.md`.

---

## Phase 3 — Deployment, Auth, and Per-User Persistence

Before or alongside broader integrations, the app can be deployed and given optional user accounts so data is no longer device-bound.

- **Deployment**
  - Host the static app (e.g. Vite build) on a platform such as [Fly.io](https://fly.io) (or Vercel, Netlify, etc.). Use env-based config for any future API base URLs; no secrets in the repo.
- **Authentication and user accounts**
  - Introduce optional sign-in (e.g. email/password or OAuth) so users can identify themselves. Until then, the app remains single-user per browser.
- **Persistence of JSON (and state) for user accounts**
  - When a user is signed in, persist dashboard state (areas, gamification, pinnedAreaIds, etc.) to a backend keyed by user id, so the same user sees the same data across devices. Local-only mode remains available when not signed in.

These items should be scoped into concrete tasks in TASKS.md when the team is ready. Security/Privacy review applies to any auth or networked persistence.

---

## Phase 4+ — Integrations and Sharing

Later phases may explore:

- **Import/export**:
  - Export stat config and state to a portable JSON file.
  - Import configs from templates or previous backups.
- **Templates and presets**:
  - Provide curated stat trees for common goals (e.g. language learning, fitness, creative practice).
- **Optional sync/sharing**:
  - Opt-in mechanisms to sync data across devices or share read-only views (e.g. a static snapshot of your bullseye/character card).
- **Optional task-app sync (e.g. Todoist, Google Tasks)**:
  - Map external tasks to areas (and optionally to achievements) so completions can count toward domain XP. Requires user configuration and OAuth; Security/Privacy review for any networked integration.

Any networked or social features must maintain a strong bias toward privacy and user control.

---

## Relationship to TASKS and NEXT

- `docs/TASKS.md` breaks this plan into concrete tasks with:
  - Scope
  - Acceptance criteria
  - Files/areas likely touched
  - Validation commands or manual test steps
- `docs/NEXT.md` orients new contributors to:
  - Which phase we are currently in.
  - Which tasks are the highest leverage right now.

Architect and Lead agents should keep this plan, TASKS, and NEXT in sync as work progresses.
