# RULES.md — Change Boundaries & Placement (Current Repo)

This repository is a homepage-first Next.js App Router starter.

## 1) Scope and Source of Truth

- Use `README.md` for operational setup and runtime behavior.
- Use `FILES.md` for structural index and file ownership.
- This file defines edit boundaries and safe change policy.
- Do not assume missing backend architecture.

## 2) Current Product Shape

- One public homepage route: `app/page.tsx`.
- Current visible surfaces:
  - `components/Navbar.tsx` (includes theme toggle)
  - `components/HeroSection.tsx`
- No active app-level auth routes, dashboard routes, or API routes.
- No active app-level DB model integration in route runtime.

## 3) Routing & Component Placement

### Route Ownership

- Root composition: `app/page.tsx`
- Global wrappers/providers: `app/layout.tsx`
- Global styles: `app/globals.css`

### Component Ownership

- Navbar branding/theme trigger: `components/Navbar.tsx`
- Hero content/layout/CTAs: `components/HeroSection.tsx`
- Theme runtime primitives: `components/theme/*`
- Shared UI primitives: `components/ui/*`
- Shared helpers: `lib/*`

### Content Contract Note

- `content/content.ts` was removed.
- Current homepage copy is local to component files.
- If reintroducing centralized copy, do it deliberately and update this file + `FILES.md` together.

## 4) Server vs Client Rules

1. `app/*` files are Server Components by default.
2. Add `"use client"` only for hooks/browser APIs/event handlers.
3. Keep server-only logic out of client files.
4. Keep client/server concerns split when possible.

## 5) UI Primitive Boundaries

- `components/ui/*` are shared primitives.
- Do not patch primitives for one-off page-only styles.
- Prefer styling at feature component level first.
- Change primitive internals only when global behavior change is intended.
- When generating new primitives, use `pnpm run shadcn:add <component>` so output stays aligned with `components.json`.

## 6) Script Contracts

Current scripts in `scripts/`:

- `commandRunner.js`: serialized command execution with timeout/lock.
- `db-init.js`: future DB migration/bootstrap utility.
- `dev-supervisor.js`: process supervisor for Next.js + warmup + optional git bootstrap/poll.
- `error-reporter.ts`: browser error reporting helper.
- `generate-section.mjs`: section scaffold helper (currently references removed `content/content.ts`; treat as outdated until fixed).
- `git-poll.js`: optional git polling updater.
- `setup-env.mjs`: `.env.local` scaffold helper.

Script change policy:

- Edit scripts only when task scope requires infrastructure/runtime behavior updates.
- Keep script edits deterministic and minimal.
- Do not silently repurpose script intent.

## 7) Future DB Placeholder Contract

- `scripts/db-init.js` and `.github/workflows/init-db.yml` are intentionally retained for future DB onboarding.
- `DATABASE_URL` is reserved for future DB use and is not required for current homepage runtime.
- Do not wire DB migration paths into default local page development flow unless DB artifacts are added in scope.

## 8) Configuration Boundaries

Allowed configuration touchpoints:

- `package.json`
- `next.config.mjs`
- `tsconfig.json`
- `tailwind.config.ts`
- `postcss.config.mjs`
- `components.json`
- Deployment/runtime files (`Dockerfile`)

Package script contract:

- Keep `shadcn`, `shadcn:init`, and `shadcn:add` scripts in `package.json` available for component scaffolding.
- If `components.json` aliases/style options change, verify shadcn scripts still resolve correct output paths.

## 9) Critical Safety Notes

- Do not invent missing architecture (dashboard/auth/API/ORM) in docs or code by default.
- Keep secrets out of source control.
- `postcss.config.mjs` has previously contained suspicious appended content; treat edits there as sensitive and review carefully.

## 10) Quick Checks Before Editing

1. Homepage composition change? Edit `app/page.tsx`.
2. Branding/theme-toggle change? Edit `components/Navbar.tsx`.
3. Hero message/CTA/layout change? Edit `components/HeroSection.tsx`.
4. Global theming/styling change? Edit `app/globals.css` and relevant theme/ui files.
5. Runtime behavior change in deployment containers? Edit `scripts/dev-supervisor.js` and deployment configs.

## 11) Non-Negotiable Rules

- Prefer minimal diffs.
- Do not move or rename core files without explicit scope.
- Do not refactor unrelated modules while solving localized tasks.
- If request assumes absent architecture, stop and clarify implementation scope.
