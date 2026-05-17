# FILES.md

Structural and architectural index for the current repository state.

## Scope

- This repository is a Next.js App Router landing-page starter.
- It is not an implemented NestJS backend.
- It currently ships one homepage route and shared UI/runtime tooling.

## 1) High-Level Overview

## Purpose

- Provide a clean homepage-first foundation.
- Allow rapid landing-page iteration in a small codebase.
- Keep room for future expansion into SaaS/backend systems when required.

## Architectural Style

- Frontend-first modular structure:
  - `app/` for route/layout composition
  - `components/` for feature/shared UI
  - `lib/` for helpers
  - `scripts/` for runtime/infrastructure utilities
- No backend module/controller/service graph in active app runtime.

## Key Technologies

| Category | Technology | Status |
|---|---|---|
| Framework | Next.js App Router | Active |
| Language | TypeScript | Active |
| UI | React 19 | Active |
| Styling | Tailwind CSS + global CSS variables | Active |
| Theme | next-themes | Active |
| Package manager | pnpm | Active |
| Container | Docker (`node:22-slim`) | Active |
| Backend framework (NestJS) | Not present | Not active |
| ORM (Prisma/Drizzle in app runtime) | Not active | Future placeholder only |

## 2) Entry Points

## Current runtime entry points

- `app/layout.tsx`
  - Root HTML/body wrapper
  - Global theme provider wiring
  - Global CSS import
- `app/page.tsx`
  - Homepage composition
  - Renders `Navbar` + `HeroSection`

## Not present

- `main.ts` (NestJS bootstrap)
- `app.module.ts` (NestJS root module)
- `app/api/*` handlers (current repo state)

## 3) Module/Area Index

| Area | Path | Responsibility | Type |
|---|---|---|---|
| Route layer | `app/` | Layout and homepage composition | Feature |
| Feature UI | `components/` | Homepage UI sections/components | Feature |
| Theme layer | `components/theme/` | Theme provider + toggle | Shared |
| UI primitives | `components/ui/` | Reusable primitives (button/badge/sheet/separator) | Shared |
| Utility layer | `lib/` | Utility helpers (`cn`) | Shared |
| Runtime tooling | `scripts/` | Supervisor, polling, command runner, setup scripts | Infrastructure |
| Deployment config | root + `.github/workflows/` | Docker/workflow behavior | Infrastructure |

## 4) Controllers, Services, Data Layer (Current State)

These backend-oriented areas are not implemented as app runtime layers:

- NestJS controllers/providers/modules: **NOT PRESENT**
- App-level repository/query layers: **NOT PRESENT**
- Active app-level schema/entity model integration: **NOT PRESENT**

Future placeholder assets do exist:

- `scripts/db-init.js`
- `.github/workflows/init-db.yml`

They are for future DB onboarding and are not required for current homepage runtime.

## 5) Validation and Contracts

- Type safety is enforced via TypeScript strict config.
- No global runtime schema validator layer is currently wired.
- Homepage text/content currently lives directly in component-local constants (not centralized content module).

## 6) Cross-Cutting Concerns

## Theme

- `components/theme/theme-provider.tsx` wraps `next-themes` provider.
- `components/theme/theme-toggle.tsx` provides UI theme switching.
- Navbar currently renders the theme toggle.

## Error/infra helpers

- `scripts/error-reporter.ts` provides browser error reporting helper functions.
- `scripts/commandRunner.js` provides serialized command execution utility.

## 7) Configuration and Environment

## Core config files

| File | Purpose |
|---|---|
| `package.json` | scripts, dependencies, package manager pin, ESM mode, shadcn CLI helpers |
| `pnpm-lock.yaml` | primary lockfile |
| `next.config.mjs` | Next.js config |
| `tsconfig.json` | TypeScript compiler config |
| `tailwind.config.ts` | Tailwind theme/content globs |
| `postcss.config.mjs` | PostCSS config |
| `components.json` | shadcn generator config |
| `Dockerfile` | container build/runtime |

## Environment

- No mandatory env var is required to render current homepage.
- Future DB variables are used only by future placeholder paths:
  - `DATABASE_URL`
  - migration retry/connect timeout variables used by `scripts/db-init.js`
- Supervisor-related runtime toggles (optional):
  - `PORT`, `NEXT_DEV`, `GIT_BOOTSTRAP`, `GIT_POLL`, `PREVIEW_BRANCH`, `REPO_URL`, `HEALTHCHECK_PATH`, `GIT_POLL_INTERVAL`

## 8) Async & Background Processing

Current async/runtime utility behavior exists only in scripts:

- `scripts/dev-supervisor.js` starts Next.js and optional git utilities.
- `scripts/git-poll.js` polls git remotes in configured environments.

No queues/workers/message brokers are active in app runtime.

## 9) Testing Structure

- No committed unit/integration/e2e test suite currently present.
- Add tests in explicit directories when test coverage is introduced.

## 10) File & Directory Index

Complete tracked source/config index (excluding `.git`, `node_modules`, `.next`).

```text
.
├── .dockerignore                          # Docker context exclusions
├── .gitattributes                         # Git attributes
├── .gitignore                             # Git ignore rules
├── .github/
│   └── workflows/
│       └── init-db.yml                    # Future DB init workflow (manual dispatch)
├── Dockerfile                             # Container image/runtime entry
├── FILES.md                               # This structural index
├── README.md                              # Operational guide
├── RULES.md                               # Change boundaries and placement rules
├── app/
│   ├── globals.css                        # Global design tokens + base styles
│   ├── layout.tsx                         # Root layout + theme provider wiring
│   └── page.tsx                           # Homepage composition (Navbar + HeroSection)
├── components/
│   ├── HeroSection.tsx                    # Hero section content + CTA UI
│   ├── Navbar.tsx                         # Brand header + theme toggle
│   ├── theme/
│   │   ├── theme-provider.tsx             # next-themes provider wrapper
│   │   └── theme-toggle.tsx               # Dark/light toggle control
│   └── ui/
│       ├── badge.tsx                      # Shared badge primitive
│       ├── button.tsx                     # Shared button primitive
│       ├── separator.tsx                  # Shared separator primitive
│       └── sheet.tsx                      # Shared sheet/dialog primitive
├── components.json                        # shadcn generator metadata
├── content/                               # Currently empty directory (content module removed)
├── dynamic-assistant-instructions.md      # Assistant behavior and workflow instructions
├── dynamic-generator-prompt.md            # Landing-page generation prompt template
├── lib/
│   └── utils.ts                           # `cn()` helper
├── next.config.mjs                        # Next.js config
├── package-lock.json                      # Legacy npm lockfile retained
├── package.json                           # Scripts/deps/package manager pin/type module
├── pnpm-lock.yaml                         # Primary lockfile
├── postcss.config.mjs                     # PostCSS configuration (sensitive file)
├── scripts/
│   ├── commandRunner.js                   # Serialized command execution helper
│   ├── db-init.js                         # Future DB migration bootstrap helper
│   ├── dev-supervisor.js                  # Runtime supervisor for Next + warmup + git helpers
│   ├── error-reporter.ts                  # Browser error reporter utility
│   ├── generate-section.mjs               # Section scaffold script (currently outdated assumption)
│   ├── git-poll.js                        # Git polling/sync helper
│   └── setup-env.mjs                      # `.env.local` setup helper
├── tailwind.config.ts                     # Tailwind configuration
└── tsconfig.json                          # TypeScript configuration
```

## 11) How to Modify Safely

## Add or modify homepage UI

1. Edit `components/HeroSection.tsx` and/or `components/Navbar.tsx`.
2. Adjust composition in `app/page.tsx` only when section ordering/layout changes.
3. Keep shared primitive edits (`components/ui/*`) intentional and global.

## Theme updates

1. Edit toggle behavior in `components/theme/theme-toggle.tsx`.
2. Edit provider behavior in `components/theme/theme-provider.tsx`.
3. Edit tokens in `app/globals.css` and `tailwind.config.ts`.

## Runtime/deployment updates

1. Supervisor behavior: `scripts/dev-supervisor.js`
2. Container behavior: `Dockerfile`
4. Workflow placeholders: `.github/workflows/init-db.yml`

## Avoid these pitfalls

- Do not assume removed `content/content.ts` still exists.
- Do not assume dashboard/auth/backend modules are present.
- Do not modify sensitive config files blindly (`postcss.config.mjs`) without review.
- Do not introduce broad refactors for small homepage tasks.
- Do not bypass package scripts for UI scaffolding; use `pnpm run shadcn:init` and `pnpm run shadcn:add <component>` to keep generator behavior consistent.
