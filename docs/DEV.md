# Dev Guide

This file defines the **authoritative developer workflow** for this repository. It reflects the **current** Life Dashboard implementation (React/Vite/Tailwind). See [ARCHITECTURE.md](ARCHITECTURE.md) and [PLAN.md](PLAN.md) for product and layout context.

## Tooling

- **Language(s):** TypeScript
- **Package manager(s):** npm (or pnpm/yarn if you prefer; lockfile may vary)
- **Runtime(s):** Browser (Vite dev server)
- **Primary framework(s):** React 18, Vite 5, Tailwind CSS 3
- **Tests:** Vitest (unit tests for model and utilities)

## Current layout

The Life Dashboard app lives at the **repo root**. Run all commands from the repository root (the directory containing this `docs/` folder and the app’s `package.json`).

- `src/` — React application source (components, hooks, model, persistence).
- `index.html`, `vite.config.ts`, `package.json`, `tsconfig.json` — standard Vite root files.

There is no nested `life-dashboard/` directory; the app was promoted to root per [ARCHITECTURE.md](ARCHITECTURE.md) §1.2.

## Setup

From the repo root:

```bash
npm install
```

## Run (development)

```bash
npm run dev
```

Starts the Vite dev server (e.g. <http://localhost:5173>).

## Test

```bash
npm test
```

Runs unit tests once (Vitest). For watch mode:

```bash
npm run test:watch
```

Tests live under `src/` with a `.test.ts` or `.test.tsx` suffix (e.g. `src/model/validation.test.ts`, `src/model/derivedMetrics.test.ts`).

## Lint / Typecheck

```bash
npm run lint
```

```bash
npm run typecheck
```

Typecheck runs `tsc --noEmit` and is part of the recommended quality gate before commits and PRs.

## Build

```bash
npm run build
```

Produces a production build in `dist/`. Preview with:

```bash
npm run preview
```

## Environment variables

None required for MVP. All data is local (localStorage). Future features (e.g. optional sync) may use env-based config; no secrets in the repo.

## Workflow (branching & PRs)

### Branch naming (required)

Use role-based branches: `agent/<role>/<task-slug>`. Roles: `architect`, `lead`, `test`, `sec`, `refactor`, `docs`. See [AGENTS.md](../AGENTS.md).

Create branches manually, for example:

```bash
git checkout -b agent/lead/<task-slug>
```

### Commits

- Prefer small, logical commits.
- Commit after reaching a coherent checkpoint (builds, tests pass, or a clear milestone).
- Avoid mixing unrelated changes in a single commit.

### Pull requests

- One task = one PR.
- Keep PRs small and reviewable.
- Use the PR template and complete all applicable checklists.
- If `./scripts/ci-check` exists, ensure it passes before requesting review.

## Quality gate

If a CI check script exists:

```bash
./scripts/ci-check
```

Otherwise ensure the following pass before opening a PR:

- `npm run build`
- `npm run lint`
- `npm run typecheck`
- `npm test`
