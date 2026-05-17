# RiverX Next.js Base Template

Production-ready Next.js App Router template with RiverX-style runtime orchestration (supervisor, warmup, optional git bootstrap, and git poll).

## Commands

```bash
pnpm install
pnpm dev
pnpm build
pnpm start
pnpm typecheck
pnpm verify:dev-runtime
```

## Runtime Defaults

- Host: `0.0.0.0`
- Port: `3000` by default, always passed explicitly to Next
- Mode switch: `NEXT_DEV=true` runs `next dev`; `NEXT_DEV=false` runs `next start`
- Supervisor entrypoint: `node scripts/dev-supervisor.js`

Examples:

```bash
PORT=4010 pnpm dev
PORT=4010 NEXT_DEV=false pnpm start
HEALTHCHECK_PATH=/ pnpm dev
```

## Environment Variables

Use `.env.example` as the base.

- Browser-safe vars must use `NEXT_PUBLIC_*`
  - `NEXT_PUBLIC_APP_NAME`
  - `NEXT_PUBLIC_API_BASE_URL`
- Runtime/supervisor vars
  - `NEXT_DEV`, `PORT`, `HEALTHCHECK_PATH`
  - `GIT_BOOTSTRAP`, `GIT_POLL`, `GIT_POLL_INTERVAL`
  - `PREVIEW_BRANCH`, `REPO_URL`
- Optional parity DB vars (template remains backend-agnostic)
  - `DATABASE_URL`, `DB_MIGRATE_RETRY_MS`, `DB_MIGRATE_CONNECT_TIMEOUT_SEC`, `PGCONNECT_TIMEOUT`, `DATABASE_SSL`

## Project Structure

```text
app/           App Router entrypoints and global styles
components/    Shared UI and feature components
scripts/       Runtime supervisor, git poller, and verification tooling
lib/           Utilities
```

## Notes

- Frontend-first and backend-agnostic by default.
- Docker runtime uses `node:22-alpine`, Corepack, and pinned `pnpm@10.26.2`.
- Supervisor performs warmup checks and can optionally bootstrap/poll git state.
