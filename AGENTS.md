# Agent Team – Life Dashboard

This repo uses a small team of agents to plan, implement, test, document, and harden **Life Dashboard** — a gamified personal dashboard for tracking nested life domains via a JSON stat tree, bullseye diagrams, and a character-sheet UI. Each agent has a playbook in `agents/<role>-agent.md`. Follow both this file and the role-specific playbook when acting as that agent.

## Team roster

| Role | Playbook | Purpose |
|------|----------|---------|
| **Architect** | `agents/architect-agent.md` | Product and system design; JSON stat-tree and gamification framing; defines docs and tasks. Docs-first; minimal app code. |
| **Lead** | `agents/lead-agent.md` | Default implementation agent. Delivers features from `docs/TASKS.md` in the React/Vite/Tailwind stack. |
| **UI/UX** | `agents/ui-ux-agent.md` | Owns layout, interaction, accessibility, and visual polish (bullseye, character card, navigation). |
| **Game Design** | `agents/game-design-agent.md` | Designs gamification systems (levels, badges, mastery) within healthy guardrails. |
| **Docs** | `agents/docs-agent.md` | Keeps `docs/` accurate and aligned with implementation and philosophy. |
| **Test** | `agents/test-agent.md` | Adds and strengthens tests; focuses on model, derived metrics, and UI invariants. |
| **Refactor** | `agents/refactor-agent.md` | Improves structure and maintainability without changing behavior. |
| **Security/Privacy** | `agents/security-agent.md` | Reviews changes for privacy and data-handling risks; future sync and integrations. |

## Project and roadmap

- **Product:** Life Dashboard — a JSON-configured, gamified personal dashboard: nested domains, bullseye diagrams, and a character card representing your “real-life character”. See `docs/PROJECT.md` (domain of truth).
- **Phase 1 (initial scope):** Define and implement the JSON stat-tree, derived metrics, local persistence, bullseye visualization, character card, navigation, and basic editing flows (see `docs/PLAN.md` and `docs/TASKS.md`).
- **Strategy:** Start practical (JSON model + visuals); design playfully (TCG/RPG feel); layer gamification and integrations incrementally.
- **Canonical docs:** `docs/PROJECT.md`, `docs/ARCHITECTURE.md`, `docs/PLAN.md`, `docs/TASKS.md`, `docs/DEV.md` (and any future `docs/DESIGN.md` / `docs/DECISIONS.md` when created).

## Golden rules

- **Branch naming:** `agent/<role>/<task-slug>` (e.g. `agent/lead/t1-json-model`). Use `./scripts/new-branch.sh <role> <task-slug>` when available.
- **Task source:** Work from `docs/TASKS.md`. Tasks must have scope, acceptance criteria, and validation steps (defined by Architect and updated as needed).
- **Quality bar:**
  - Keep changes small and PR-friendly.
  - Prefer straightforward, readable implementations over clever abstractions.
  - Add or update tests when behavior changes.
- **Dependencies and config:**
  - Avoid new dependencies without explicit approval.
  - Use env-based config only for any future networked features; no secrets in the repo.
- **Architecture boundaries:** Follow module boundaries in `docs/ARCHITECTURE.md` (model, persistence, state, presentation). Avoid leaking concerns across layers.

## Constraints (all agents)

- Do not contradict or dilute the conceptual foundations in `docs/PROJECT.md` (nested stat tree, character-sheet metaphor, gamification guardrails).
- Do not introduce dark-pattern gamification (punitive streak loss, manipulative notifications, unhealthy competitiveness).
- Do not modify `docs/PROJECT.md` unless explicitly asked; it is the domain-of-truth compass.
- Treat user data as sensitive:
  - Assume personal stats are private.
  - Make it easy to back up/export data in future work.

## Adding or changing agents

- To add a specialist: create `agents/<role>-agent.md` with role, responsibilities, project knowledge, rules, and output format (use existing agent files as templates). Register the agent in the table above and in `.github/workflows/branch-name.yml` if branch naming applies.
- The **Architect** role should always exist; other roles may be added or merged as the project evolves.

## Next step

The immediate focus is to deliver the **Phase 1 MVP** described in `docs/PLAN.md`:

- Architect, Lead, and Docs agents should align on T1–T3 (JSON model, derived metrics, persistence) and T4–T7 (navigation, bullseye, character card, editing) from `docs/TASKS.md`.
- UI/UX and Game Design agents should collaborate on how the bullseye and character sheet express progress and levels, staying within the guardrails in `docs/PROJECT.md`.
