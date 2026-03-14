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

- **Local dev:** None required. All data is local (localStorage) unless you enable Phase 3 auth/sync.
- **Optional (Phase 3):** Copy `.env.example` to `.env` and set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to enable sign-in and per-user cloud persistence. Get them from Supabase project → Settings → API. No secrets in the repo; use env only. See [supabase-setup.md](supabase-setup.md) for creating the `dashboard_state` table and RLS.

## Deploy to Fly.io

The app is a static Vite build served with nginx (SPA fallback). From the repo root:

1. Install [Fly CLI](https://fly.io/docs/hands-on/install-flyctl/) and log in: `fly auth login`.
2. Launch the app (first time): `fly launch --no-deploy` to create the app and `fly.toml`; answer prompts or keep defaults.
3. Deploy: `fly deploy`.
4. For production auth/sync, set secrets (not in repo): `fly secrets set VITE_SUPABASE_URL=https://xxx.supabase.co VITE_SUPABASE_ANON_KEY=your-anon-key`.

Build uses the multi-stage `Dockerfile` (node build, then nginx serve). SPA routing: refresh on any path returns `index.html`.

**Auto-deploy:** Pushing to `main` or `alpha` triggers a GitHub Actions deploy (see `.github/workflows/fly-deploy.yml`). Ensure `FLY_API_TOKEN` is set in the repo secrets. Merge to `alpha` for preview deploys; merge to `main` for production.

## Workflow (branching & PRs)

### Branch naming (required)

Use role-based branches: `agent/<role>/<task-slug>`. Roles: `architect`, `lead`, `ui-ux`, `game-design`, `docs`, `test`, `refactor`, `security`. See [AGENTS.md](../AGENTS.md).

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
