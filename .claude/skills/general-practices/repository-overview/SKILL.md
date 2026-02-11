---
name: repository-overview
description: >-
  High-level overview of the FinishLine monorepo structure, tech stack, tools,
  and how they work together. Use when onboarding to the codebase, asking
  about the project structure, wondering what technology FinishLine uses,
  asking where files live, or needing to understand how the frontend, backend,
  and shared packages relate to each other.
---

# Repository Overview

> **Summary:** FinishLine is a TypeScript monorepo with a React frontend, Express backend, and shared type package, managed with Yarn workspaces and built for Northeastern Electric Racing's project management needs.

## What is FinishLine?

FinishLine is a full-stack ERP and project management application built for **Northeastern Electric Racing (NER)**, a student engineering organization at Northeastern University that designs, builds, and races electric vehicles. The platform manages work breakdown structures, change requests, reimbursements, bill of materials, user onboarding, calendar events, supply chain operations, team management, and more.

The primary users are engineering students, team leads, and club advisors. NER is structured into subteams (mechanical, electrical, software, business, etc.) with roles including guests, members, leadership, heads, admins, and app admins. FinishLine supports multi-tenant organizations — all data is scoped by `organizationId`.

## Monorepo Structure

FinishLine uses **Yarn workspaces** to manage three packages in a single repository:

```
src/
├── backend/           # Express API server (Node.js)
├── frontend/          # React SPA (Vite)
└── shared/            # Common TypeScript types and utilities
```

The root `package.json` declares these workspaces and provides top-level scripts that orchestrate builds, tests, and development servers. The `shared` package MUST be built before the frontend or backend can use it, because they import its compiled output.

### Backend (`src/backend/`)

The backend is an **Express 5** server using **Prisma ORM** with **PostgreSQL**. It follows a layered architecture:

```
src/backend/
├── index.ts              # App entry: middleware, route registration, error handler
├── src/
│   ├── routes/           # Express route definitions with express-validator
│   ├── controllers/      # Thin request handlers — extract data, call service, return response
│   ├── services/         # Business logic — static class methods, filter by organizationId
│   ├── prisma/           # Schema, migrations, seed data, Prisma client singleton
│   ├── prisma-query-args/# Reusable Prisma select/include argument objects
│   ├── transformers/     # Convert Prisma models to API response shapes (shared types)
│   ├── integrations/     # External service clients (Slack)
│   └── utils/            # Auth middleware, custom exceptions, validation, helpers
└── tests/
    ├── unit/             # Service-level unit tests (vitest)
    ├── integration/      # Integration tests
    ├── test-data/        # Test fixtures
    └── test-utils.ts     # Shared test helpers
```

Key technology choices:
- **Express 5** for HTTP routing and middleware
- **Prisma 6** as the ORM with PostgreSQL
- **express-validator** for request input validation on routes
- **express-jwt** and **jsonwebtoken** for JWT-based authentication
- **Vitest** for unit and integration testing
- **Multer** for file uploads
- **Slack Web API** for Slack integration
- **Google APIs** for Google Calendar/Drive integration

### Frontend (`src/frontend/`)

The frontend is a **React 19** single-page application built with **Vite**:

```
src/frontend/
├── src/
│   ├── index.tsx               # ReactDOM entry point
│   ├── app/                    # Context providers, routing, auth wrappers
│   ├── pages/                  # Route-level page components (one directory per feature)
│   ├── components/             # Reusable UI components (NERFormModal, NERDataGrid, etc.)
│   ├── hooks/                  # React Query hooks wrapping API calls
│   ├── apis/                   # Axios API call functions with response transformers
│   │   └── transformers/       # Frontend-specific response transformers
│   ├── layouts/                # Layout components
│   ├── utils/                  # Routes, URL builders, pipes, types, axios config
│   ├── stylesheets/            # SCSS stylesheets
│   └── tests/                  # Component, hook, and page tests (vitest)
```

Key technology choices:
- **React 19** with functional components and hooks
- **Vite 6** for dev server and production builds
- **Material-UI (MUI) v6** for the component library and styling
- **React Query v3** (`react-query` 3.17.0) for server state management
- **React Hook Form v7** with **Yup** validation for forms
- **React Router DOM v5** for client-side routing
- **Axios** for HTTP requests to the backend
- **Recharts** and **Chart.js** for data visualization
- **date-fns** and **dayjs** for date manipulation
- **Vitest** for testing with React Testing Library

### Shared (`src/shared/`)

The shared package contains **TypeScript type definitions** and **utility functions** used by both the frontend and backend:

```
src/shared/
├── index.ts                    # Re-exports everything
└── src/
    ├── types/                  # TypeScript interfaces for API contracts
    │   ├── project-types.ts
    │   ├── user-types.ts
    │   ├── calendar-types.ts
    │   ├── change-request-types.ts
    │   ├── finance-types.ts
    │   ├── reimbursement-requests-types.ts
    │   ├── work-package-types.ts
    │   ├── team-types.ts
    │   ├── bom-types.ts
    │   ├── statistics-types.ts
    │   ├── part-review.types.ts
    │   └── ...
    ├── backend-supports/       # Backend-specific shared logic
    ├── date-utils.ts           # Shared date utilities
    ├── permission-utils.ts     # Role/permission checking
    ├── validate-wbs.ts         # WBS number validation
    ├── utils.ts                # General utilities
    └── word-count.ts           # Word count utility
```

Types are imported throughout the codebase as:
```typescript
import { Project, User, WbsNumber } from 'shared';
```

The shared package compiles to `dist/` via TypeScript and is referenced by the other packages through Yarn workspace resolution.

## How the Pieces Work Together

### End-to-End Data Flow

A typical request flows through the system like this:

```
Page Component
  │
  ▼
Hook (useQuery / useMutation)
  │
  ▼
API function (Axios)
  │
  ── HTTP request ──▶  Route (validation)
                         │
                         ▼
                       Controller
                         │
                         ▼
                       Service (business logic)
                         │
                         ▼
                       Prisma (DB + transaction)
                         │
                         ▼
                       Transformer (Prisma → shared type)
                         │
  ◀── HTTP response ───
  │
  ▼
Frontend transformer → shared type
  │
  ▼
Hook returns data to component
```

Shared types define the API contract at every boundary.

1. A **React page component** renders UI and calls a **hook** (`useQuery` for reads, `useMutation` for writes).
2. The hook calls an **API function** in `src/frontend/src/apis/` which uses **Axios** to make an HTTP request. For reads, the API function applies a **frontend transformer** to convert the raw response into the shared type.
3. The request hits an **Express route** which runs **express-validator** middleware for input validation, then calls the **controller**.
4. The **controller** is a thin layer: it extracts data from the request (`req.body`, `req.params`, `req.currentUser`, `req.organization`), calls the **service** method, and returns the result with an HTTP status code.
5. The **service** contains the business logic. It validates permissions, enforces business rules, queries the database via **Prisma**, and returns data. For responses, it uses a **backend transformer** to convert Prisma models into the shared API types.
6. **Shared types** (`src/shared/src/types/`) define the data shapes at every boundary. The backend transformer produces these types; the frontend API function expects them.

### Authentication and Multi-Tenancy

Every request (except login and health check) passes through middleware defined in `src/backend/index.ts`:

1. **JWT validation** (`requireJwtProd` or `requireJwtDev`) — verifies the user's identity and stores `userId` in `res.locals`.
2. **`getUserAndOrganization`** — looks up the user and organization from the database, verifies the user belongs to the organization, and attaches both to `req.currentUser` and `req.organization`.

This means every controller and service method has access to the authenticated user and their organization. Services MUST filter all database queries by `organizationId` to enforce data isolation.

On the frontend, the Axios interceptor in `src/frontend/src/utils/axios.ts` automatically attaches the `organizationId` header and the authorization token to every request.

### Context Providers

The frontend wraps the app in a provider hierarchy (see `src/frontend/src/app/AppMain.tsx` → `AppContext.tsx`):

```
ClarityProvider          → Analytics (Microsoft Clarity)
  AppContext              → Composed provider wrapper
    QueryClientProvider   → React Query cache
      OrganizationContext → Current organization state
        AuthContext        → Current user authentication
          ThemeContext     → MUI theme (light/dark)
            HomePageProvider → Home page state
              ToastProvider  → Toast notifications
                BrowserRouter → React Router v5
                  OAuthProvider → Google OAuth
```

### HTTP Method Convention

FinishLine uses an unconventional HTTP method pattern: **GET for reads, POST for everything else** (creates, updates, and deletes). The backend does not use PUT, PATCH, or DELETE methods.

## Key File Location Reference

When looking for code related to a specific feature, files follow a consistent naming pattern across the stack:

| Layer | Path Pattern | Example (Calendar) |
|-------|-------------|-------------------|
| Routes | `src/backend/src/routes/{feature}.routes.ts` | `calendar.routes.ts` |
| Controllers | `src/backend/src/controllers/{feature}.controllers.ts` | `calendar.controllers.ts` |
| Services | `src/backend/src/services/{feature}.services.ts` | `calendar.services.ts` |
| Prisma Query Args | `src/backend/src/prisma-query-args/{feature}.query-args.ts` | `calendar.query-args.ts` |
| Transformers | `src/backend/src/transformers/{feature}.transformer.ts` | `calendar.transformer.ts` |
| Backend Utils | `src/backend/src/utils/{feature}.utils.ts` | `calendar.utils.ts` |
| Backend Tests | `src/backend/tests/unit/{feature}.test.ts` | `calendar.test.ts` |
| Shared Types | `src/shared/src/types/{feature}-types.ts` | `calendar-types.ts` |
| Frontend APIs | `src/frontend/src/apis/{feature}.api.ts` | `calendar.api.ts` |
| Frontend Hooks | `src/frontend/src/hooks/{feature}.hooks.ts` | `calendar.hooks.ts` |
| Frontend Pages | `src/frontend/src/pages/{FeaturePage}/` | `CalendarPage/` |
| Frontend Utils | `src/frontend/src/utils/{feature}.utils.ts` | `calendar.utils.ts` |
| Frontend Tests | `src/frontend/src/tests/pages/{FeaturePage}/` | — |
| URL Builders | `src/frontend/src/utils/urls.ts` | (all in one file) |
| Frontend Routes | `src/frontend/src/utils/routes.ts` | (all in one file) |

## Feature Areas

FinishLine covers the following major feature areas. Each has its own slice through the full stack (routes, services, hooks, pages, types):

- **Work Breakdown Structure (WBS):** Projects and Work Packages with status tracking, description bullets, and stage gates
- **Change Requests:** Formal approval workflow for scope, timeline, and budget changes (multiple CR types: standard, activation, stage gate, budget)
- **Finance:** Reimbursement requests with multi-step approval chains, vendors, sponsors, sponsor tiers, account codes, index codes
- **Calendar:** Events, event types, calendars, shops, machinery, schedule slots, and a confirmation/scheduling workflow
- **Teams & Users:** Role-based access control, team assignments, team types, user settings, secure settings, schedule settings
- **Onboarding:** Checklists with ordered items for new member onboarding
- **Parts & BOM:** Part creation, part review workflow (submissions, review requests, reviews), bill of materials (materials, assemblies, manufacturers, units)
- **Statistics:** Custom graphs, graph collections, and dashboard analytics
- **Retrospective:** Timelines and budget retrospectives for completed work
- **Recruitment:** Milestones and FAQs for the recruitment pipeline
- **Notifications & Announcements:** Push notifications, pop-ups, and announcements
- **Tasks:** Task tracking tied to WBS elements with status and priority
- **Gantt:** Timeline visualization for projects and work packages
- **Organizations:** Multi-tenant organization settings, useful links, featured projects, images, contacts

## Development Environment

### Prerequisites

FinishLine requires **Docker** for the PostgreSQL database regardless of how you run the application code. You MUST have Docker installed and running before starting development.

### Initial Setup

First time setup (or after pulling new dependencies):
```bash
yarn install                  # Install all workspace dependencies
yarn prisma:generate          # Generate the Prisma client from the schema
```

### Database Setup

The PostgreSQL database always runs in a Docker container. The `yarn database:setup` command handles everything: it writes the `DATABASE_URL` to `src/backend/.env`, starts a PostgreSQL container named `finishline` on port 5432, creates the `nerpm` database, and runs Prisma migrations with seed data:
```bash
yarn database:setup           # One-time: create Postgres container + seed DB
```

After initial setup, the container persists. If you restart your machine, start it again with `docker start finishline`.

### Running the Application

You have two options for running the frontend and backend: on your host machine or in Docker containers. Either way, they connect to the same PostgreSQL container.

**Option A: Host machine (recommended for faster iteration)**
```bash
yarn start                    # Builds shared, starts backend (nodemon, port 3001)
                              #   + frontend (vite, port 3000) concurrently
```

Or run them individually:
```bash
yarn frontend                 # Frontend dev server on port 3000
yarn backend:dev              # Backend with nodemon on port 3001
yarn workspace shared build   # Rebuild shared (required after changing shared types)
```

**Option B: Docker containers**
```bash
yarn docker:start             # Start frontend + backend + DB containers
yarn docker:dev               # Full docker dev environment with watch mode
yarn docker:i                 # Install deps inside containers
```

### Database Commands

These commands manage the Prisma schema and database state:
```bash
yarn prisma:generate          # Regenerate Prisma client — run after ANY schema.prisma change
yarn prisma:migrate           # Create and apply a new migration — run after adding/changing
                              #   models, fields, enums, or relations in schema.prisma
yarn prisma:reset              # Drop the database, re-run all migrations, and re-seed — useful
                              #   when your local DB is in a bad state or you want a clean slate
yarn prisma:studio            # Open Prisma Studio GUI — a visual database browser for debugging
```

### Testing

Tests run against a **separate** PostgreSQL container on port 5433 so they don't interfere with your development database. You MUST run the setup script before testing and the teardown script after:

```bash
yarn test:setup               # Spins up a test Postgres container (port 5433)
                              #   and adds a test DATABASE_URL to .env

yarn test                     # Run all tests (backend then frontend)
yarn test:backend             # Backend unit tests only (vitest)
yarn test:frontend            # Frontend tests only (vitest)

yarn test:teardown            # Stops and removes the test container,
                              #   removes the test DATABASE_URL from .env
```

The setup script appends a second `DATABASE_URL` pointing at port 5433 to `src/backend/.env`. Prisma uses the last `DATABASE_URL` in the file, so tests hit the test database while the line is present. The teardown script removes it, restoring the original dev database URL. If you skip teardown, your dev server will point at the (stopped) test database and fail to connect.

### Code Quality

```bash
yarn lint                     # ESLint
yarn prettier-check           # Prettier formatting check
yarn tsc-check                # TypeScript type checking (frontend + backend)
```

## ESLint Rules

The project enforces strict ESLint rules including: `guard-for-in`, `prefer-arrow-callback`, `eqeqeq` (strict equality), `no-var`, `prefer-const`, `prefer-destructuring`, `object-shorthand`, `no-else-return`, `no-lonely-if`, `no-throw-literal`, and `prefer-spread`. See the root `package.json` `eslintConfig` section for the full configuration.

## License

FinishLine is licensed under **GNU AGPLv3**. Source files include a license header comment.
