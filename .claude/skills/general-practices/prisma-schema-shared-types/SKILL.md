---
name: prisma-schema-shared-types
description: Guide for defining Prisma data models and keeping shared TypeScript types in sync in FinishLine. Covers schema conventions, enum patterns, multi-tenant organizationId scoping, the migration workflow, and the shared type barrel export. Use when adding new database models, creating or editing Prisma schema, defining shared types or interfaces, adding enums, running migrations, or when asked how the data layer works.
---

# Prisma Schema and Shared Types

> **Summary:** How to define data models in Prisma and maintain corresponding TypeScript types in the shared package so backend and frontend stay in sync.

## Overview

FinishLine's data layer has two halves that must stay synchronized: the Prisma schema defines the database structure, and the shared TypeScript types define the API contract between backend and frontend. When you add or modify a model, you typically touch both.

The Prisma schema lives at `src/backend/src/prisma/schema.prisma` — a single file containing all models, enums, and relations. The shared types live in `src/shared/src/types/` as feature-scoped TypeScript files that are re-exported through `src/shared/index.ts`. The backend uses Prisma-generated types internally but transforms them into shared types before sending responses. The frontend imports shared types directly and never references Prisma types.

This separation exists because Prisma types mirror the database exactly (snake_case joins, nullable FKs, raw DateTime objects), while shared types represent the cleaned-up API contract (camelCase, resolved relations, computed fields). The transformer layer (covered in the `query-args-and-transformers` skill) bridges the gap.

## Architecture

```
┌─────────────────────┐
│  schema.prisma      │
│  (database truth)   │
└────────┬────────────┘
         │ prisma generate
         ▼
┌─────────────────────┐
│  @prisma/client     │
│  (generated types)  │
└────────┬────────────┘
         │ used in services
         ▼
┌─────────────────────┐
│  transformers       │
│  (Prisma → shared)  │
└────────┬────────────┘
         │ returns
         ▼
┌─────────────────────┐
│  shared/src/types/  │
│  (API contract)     │
└────────┬────────────┘
         │ imported by
         ▼
┌─────────────────────┐
│  frontend           │
│  (React app)        │
└─────────────────────┘
```

## File Locations

- **Prisma schema:** `src/backend/src/prisma/schema.prisma`
- **Migrations:** `src/backend/src/prisma/migrations/`
- **Shared types:** `src/shared/src/types/{feature}-types.ts`
- **Barrel export:** `src/shared/index.ts`
- **Transformers:** `src/backend/src/transformers/{feature}.transformer.ts`
- **Query args:** `src/backend/src/prisma-query-args/{feature}.query-args.ts`

## Prisma Schema Conventions

### Model Naming

Models use `PascalCase` with underscores separating logical words. This matches PostgreSQL conventions and keeps generated Prisma client types readable.

```prisma
// CORRECT — PascalCase with underscores
model Reimbursement_Request { ... }
model Work_Package { ... }
model Change_Request { ... }
model Event_Type { ... }

// WRONG — no underscores or camelCase
model ReimbursementRequest { ... }
model workPackage { ... }
```

### Field Naming

Fields use `camelCase`. Foreign key fields end with `Id`. Relation fields use the related model name (camelCase).

```prisma
model Event {
  eventId       String     @id @default(uuid())
  title         String
  dateCreated   DateTime   @default(now())
  dateDeleted   DateTime?
  userCreatedId String
  userCreated   User       @relation(...)
  eventTypeId   String
  eventType     Event_Type @relation(...)
}
```

### Primary Keys

Every model MUST use a UUID string primary key with the pattern `@id @default(uuid())`. The ID field MUST be named `{camelCaseModelName}Id`.

```prisma
model Vendor {
  vendorId String @id @default(uuid())
  // ...
}

model Reimbursement_Request {
  reimbursementRequestId String @id @default(uuid())
  // ...
}
```

**Note:** Some older models use a bare `id` field (e.g., `Unit`, `Link_Type`, `Graph`). New models MUST use the `{modelName}Id` convention.

### Timestamp Fields

Every new model MUST include a `createdAt` field. An `updatedAt` field is optional and left to the developer's discretion based on whether tracking modification time is useful for the feature:

```prisma
model My_New_Model {
  myNewModelId String   @id @default(uuid())
  // ... domain fields ...
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt  // optional
}
```

**Note:** Most existing models use `dateCreated DateTime @default(now())`. A few newer models (`Part`, `Part_Submission`, `Part_Review`) use `createdAt`/`updatedAt`. New models MUST use `createdAt` (not `dateCreated`) for consistency with the newer convention.

### Soft Deletion

Models that support deletion use a nullable `dateDeleted` field and a relation to the deleting user, rather than actually removing rows:

```prisma
model Example {
  exampleId     String    @id @default(uuid())
  dateDeleted   DateTime?
  userDeletedId String?
  userDeleted   User?     @relation(
    name: "exampleDeleter",
    fields: [userDeletedId],
    references: [userId]
  )
  // ...
}
```

Services MUST filter out soft-deleted records by checking `dateDeleted === null` in queries unless specifically retrieving deleted records.

### Multi-Tenant Organization Scoping

Every top-level domain model MUST be scoped to an organization, either directly or through a required parent relation. This is FinishLine's multi-tenancy mechanism — all data belongs to exactly one organization.

**Direct scoping** (most models):

```prisma
model Vendor {
  vendorId       String       @id @default(uuid())
  name           String
  // ... other fields ...
  organizationId String
  organization   Organization @relation(
    fields: [organizationId],
    references: [organizationId]
  )

  @@index([organizationId])
}
```

**Indirect scoping through parent** (child models):

```prisma
// Project gets organizationId through WBS_Element
model Project {
  projectId    String      @id @default(uuid())
  wbsElementId String      @unique
  wbsElement   WBS_Element @relation(
    fields: [wbsElementId],
    references: [wbsElementId]
  )
  // No organizationId needed — WBS_Element has it
}

// Work_Package gets it through Project → WBS_Element
model Work_Package {
  workPackageId String  @id @default(uuid())
  projectId     String
  project       Project @relation(
    fields: [projectId],
    references: [projectId]
  )
}
```

**Rule:** If a model has `organizationId`, it MUST also have `@@index([organizationId])`.

### Enums

Enums use `PascalCase` names with `SCREAMING_SNAKE_CASE` values. Enum names use underscores to separate logical words, matching model naming:

```prisma
enum Event_Status {
  UNCONFIRMED
  CONFIRMED
  SCHEDULED
  DONE
}

enum Reimbursement_Status_Type {
  PENDING_LEADERSHIP_APPROVAL
  LEADERSHIP_APPROVED
  PENDING_FINANCE
  PENDING_SABO_SUBMISSION
  SABO_SUBMITTED
  ADVISOR_APPROVED
  REIMBURSED
  DENIED
}
```

Enums are placed at the top of `schema.prisma`, before model definitions.

### Relations

Name all relations explicitly when a model has multiple relations to the same target. Use descriptive `@relation(name: "...")` strings:

```prisma
model User {
  createdEvents Event[] @relation(name: "eventCreator")
  deletedEvents Event[] @relation(name: "eventDeleter")
}

model Event {
  userCreatedId String
  userCreated   User   @relation(
    name: "eventCreator",
    fields: [userCreatedId],
    references: [userId]
  )
  userDeletedId String?
  userDeleted   User?  @relation(
    name: "eventDeleter",
    fields: [userDeletedId],
    references: [userId]
  )
}
```

### Indexes

Add `@@index` for any foreign key field that will be queried or filtered frequently. At minimum, always index `organizationId` and parent FK fields:

```prisma
model Receipt {
  // ...
  reimbursementRequestId String
  reimbursementRequest   Reimbursement_Request @relation(...)

  @@index([reimbursementRequestId])
}
```

### Unique Constraints

Use `@@unique` with a `name` parameter for compound unique constraints. Organization-scoped uniqueness is a common pattern:

```prisma
model Vendor {
  // name must be unique within an organization
  @@unique([name, organizationId], name: "uniqueVendor")
}

model Change_Request {
  // identifier is unique within an organization
  @@unique([identifier, organizationId],
    name: "uniqueChangeRequest")
}
```

## Shared Type Conventions

### File Organization

Each feature domain has its own type file in `src/shared/src/types/`:

```
src/shared/src/types/
├── project-types.ts
├── calendar-types.ts
├── change-request-types.ts
├── reimbursement-requests-types.ts
├── team-types.ts
├── user-types.ts
├── finance-types.ts
├── work-package-types.ts
├── task-types.ts
├── bom-types.ts
├── part-review.types.ts
└── ...
```

Every type file MUST be re-exported from the barrel file at `src/shared/index.ts`:

```typescript
export * from './src/types/calendar-types.js';
export * from './src/types/project-types.js';
// ... etc
```

**When adding a new type file**, add the corresponding `export *` line to `src/shared/index.ts`. Use the `.js` extension in the import path (ESM convention).

### Type Naming

Shared types use `PascalCase` with no underscores — they follow standard TypeScript conventions, not Prisma's:

| Prisma Model            | Shared Type            |
| ----------------------- | ---------------------- |
| `Reimbursement_Request` | `ReimbursementRequest` |
| `Work_Package`          | `WorkPackage`          |
| `Event_Type`            | `EventType`            |
| `Change_Request`        | `ChangeRequest`        |

### Entity Types vs Preview Types

Many entities have both a full type and a lighter preview type. The full type includes resolved relations; the preview includes only essential fields for list views:

```typescript
// Full type — used on detail pages
export interface Project extends WbsElement {
  summary: string;
  budget: number;
  workPackages: WorkPackage[];
  teams: TeamPreview[];
  tasks: Task[];
  favoritedBy: User[];
}

// Preview type — used in lists and dropdowns
export interface ProjectPreview extends WbsElementPreview {
  startDate?: Date;
  endDate?: Date;
  budget: number;
  duration: number;
  workPackages: WorkPackagePreview[];
  teams: { teamName: string; teamId: string }[];
}
```

### Enum Mirroring

Prisma enums MUST have corresponding TypeScript enums in shared types. The TypeScript enum uses `PascalCase` keys mapping to the Prisma `SCREAMING_SNAKE_CASE` values:

```typescript
// Mirrors prisma enum Event_Status
export enum EventStatus {
  UNCONFIRMED = 'UNCONFIRMED',
  CONFIRMED = 'CONFIRMED',
  SCHEDULED = 'SCHEDULED',
  DONE = 'DONE'
}

// Mirrors prisma enum WBS_Element_Status
export enum WbsElementStatus {
  Inactive = 'INACTIVE',
  Active = 'ACTIVE',
  Complete = 'COMPLETE'
}
```

Both patterns exist in the codebase — some use the raw string as the value (`UNCONFIRMED = 'UNCONFIRMED'`), others use readable keys (`Inactive = 'INACTIVE'`). Either is acceptable as long as the values match the Prisma enum exactly.

### Payload Types for Create and Edit

Every feature MUST define separate payload types for create and edit operations. These types represent the data the frontend sends to the backend, not the database model structure.

**Naming convention:** `Create{Feature}Payload` and `Edit{Feature}Payload` (or `{Feature}CreateArgs` for consistency with existing patterns).

```typescript
// What the frontend sends to create an event
export interface EventTypeCreateArgs {
  name: string;
  calendarIds: string[];
  requiredMembers: boolean;
  optionalMembers: boolean;
  teams: boolean;
  // ... boolean flags for optional fields
}

// What the frontend sends to create a reimbursement product
export interface ReimbursementProductCreateArgs {
  id?: string;
  name: string;
  cost: number;
  refundSources: CreateRefundSourceArgs[];
}
```

Payload types differ from entity types in important ways: they use IDs instead of resolved objects for relations (e.g., `calendarIds: string[]` not `calendars: Calendar[]`), they omit server-generated fields (`dateCreated`, `organizationId`, `userCreated`), and they may include validation-specific structures.

**When the codebase doesn't yet have separate create/edit payloads for a feature, add them.** Even if the current code passes raw objects or uses inline types, new and modified code MUST use explicit payload types in the shared package.

### Type Relationships Across Files

Shared type files import from each other. Keep imports minimal — prefer importing `Preview` types over full types when the full relation isn't needed:

```typescript
// In project-types.ts
import { TeamPreview } from './team-types.js';
import { User, UserPreview } from './user-types.js';

export interface Project extends WbsElement {
  teams: TeamPreview[]; // NOT Team[]
  lead?: User;
}
```

## Step-by-Step: Adding a New Model

### 1. Define the Prisma Model

Add the model to `src/backend/src/prisma/schema.prisma`:

```prisma
model Schedule_Slot {
  scheduleSlotId String   @id @default(uuid())
  startTime      DateTime
  endTime        DateTime
  allDay         Boolean  @default(false)
  eventId        String
  event          Event    @relation(
    fields: [eventId],
    references: [eventId]
  )
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  @@index([startTime])
  @@index([endTime])
}
```

### 2. Add Any New Enums

Place enums at the top of the schema file, before models:

```prisma
enum Conflict_Status {
  PENDING
  APPROVED
  DENIED
  NO_CONFLICT
}
```

### 3. Run the Migration

```bash
yarn prisma:migrate
```

This runs `npx prisma migrate dev` from the backend directory. It will prompt you for a migration name — use a descriptive kebab-case name like `add-schedule-slots` or `add-conflict-status-enum`. The migration creates a new SQL file in `src/backend/src/prisma/migrations/`.

After migrating, Prisma automatically runs `prisma generate` to update the client types.

**If using Docker for development:**

```bash
yarn docker:prisma:migrate
```

### Manual Migration Steps

Prisma can auto-generate migrations for simple changes (adding a new model, adding a nullable column, adding an enum value). However, some schema changes require you to **manually edit the generated SQL migration file** because Prisma cannot safely resolve them on its own. Common scenarios:

- **Adding a required (non-nullable) field to an existing table.** The migration will fail if the table already has rows, because existing rows have no value for the new column. You must either give the column a `@default(...)` in the schema, or manually edit the migration SQL to set a backfill value before adding the `NOT NULL` constraint:

  ```sql
  -- Step 1: Add column as nullable
  ALTER TABLE "My_Model" ADD COLUMN "newField" TEXT;
  -- Step 2: Backfill existing rows
  UPDATE "My_Model" SET "newField" = 'default_value';
  -- Step 3: Set NOT NULL constraint
  ALTER TABLE "My_Model"
    ALTER COLUMN "newField" SET NOT NULL;
  ```

- **Renaming a column or table.** Prisma interprets renames as a drop + create, which destroys data. You must replace the generated SQL with `ALTER TABLE ... RENAME COLUMN`.

- **Changing a column's type** (e.g., `Int` → `String`). Prisma may generate a destructive migration. You must manually write a `USING` cast or a multi-step migration.

- **Splitting or merging models.** Any structural refactor that moves data between tables needs manual SQL to migrate the data.

**Workflow for manual migrations:**

1. Run `yarn prisma:migrate` — Prisma generates the migration file
2. **Before applying**, open the generated SQL file in `src/backend/src/prisma/migrations/{timestamp}_{name}/migration.sql`
3. Edit the SQL to handle the data migration safely
4. Run `yarn prisma:migrate` again to apply the edited migration

Alternatively, use `npx prisma migrate dev --create-only` from `src/backend` to generate the migration file without applying it, edit it, then run `yarn prisma:migrate` to apply.

### 4. Define the Shared Type

Create or update the appropriate file in `src/shared/src/types/`:

```typescript
// In calendar-types.ts

export enum ConflictStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  DENIED = 'DENIED',
  NO_CONFLICT = 'NO_CONFLICT'
}

export interface ScheduleSlot {
  scheduleSlotId: string;
  startTime: Date;
  endTime: Date;
  allDay: boolean;
}

export interface ScheduleSlotCreateArgs {
  startTime: Date;
  endTime: Date;
  allDay: boolean;
}
```

### 5. Export from Barrel

If you created a new type file, add it to `src/shared/index.ts`:

```typescript
export * from './src/types/my-new-types.js';
```

### 6. Build Shared Package

After modifying shared types, rebuild the shared package so the backend and frontend can see the changes:

```bash
yarn workspace shared build
```

Or if using the dev server, it may handle this automatically.

### 7. Create Transformer and Query Args

See the `query-args-and-transformers` skill for how to create the Prisma-to-shared-type transformer and the corresponding query args.

## Key Rules

- Every Prisma model MUST have a UUID primary key: `{modelName}Id String @id @default(uuid())`
- Every new model MUST include `createdAt DateTime @default(now())`; `updatedAt` is optional
- Every top-level model MUST have `organizationId` directly or inherit it through a required parent relation
- Every `organizationId` field MUST have a corresponding `@@index([organizationId])`
- Soft deletion uses `dateDeleted DateTime?` — NEVER use hard deletes
- Prisma enums MUST have mirrored TypeScript enums in `src/shared/src/types/`
- Shared types MUST be re-exported from `src/shared/index.ts`
- New features MUST define separate `Create` and `Edit` payload types in shared
- Payload types use IDs (`teamIds: string[]`) not resolved objects (`teams: Team[]`)
- Foreign key fields MUST be indexed with `@@index`

## Common Mistakes

- **Forgetting to re-export from `src/shared/index.ts`.** The frontend won't see your new types until they're re-exported from the barrel file. If imports fail with "not exported," check the barrel.

- **Using `id` instead of `{modelName}Id` for the primary key.** Some older models use bare `id`, but new models MUST use the descriptive name.

- **Missing `organizationId` on a top-level model.** If your model doesn't have a required parent that chains up to an organization, it needs `organizationId` directly. Without it, the service layer can't enforce multi-tenant isolation.

- **Forgetting `@@index` on foreign keys.** Every FK field that appears in `WHERE` clauses needs an index. At minimum, always index `organizationId` and parent relation FKs.

- **Prisma enum values not matching shared type values.** The Prisma enum value `PENDING_LEADERSHIP_APPROVAL` must match exactly as the string in the TypeScript enum. A mismatch causes runtime errors when transforming data.

- **Not running `yarn prisma:migrate` after schema changes.** The database won't reflect your changes until you run the migration. The Prisma client types also won't update until `prisma generate` runs (which `migrate dev` does automatically).

- **Editing already-applied migration files.** NEVER modify migration files that have already been applied to a database. You CAN and sometimes MUST edit a migration file before it is applied (see "Manual Migration Steps" above). Once applied, create a new migration instead.

- **Adding a required field without a default or backfill.** If your new column is non-nullable and the table has existing rows, the migration will fail. See "Manual Migration Steps" for how to handle this.

## Reference Files

These files demonstrate the conventions well:

- `src/backend/src/prisma/schema.prisma` — The single source of truth for all models and enums
- `src/shared/src/types/calendar-types.ts` — Good example of entity types, preview types, enums, and create args
- `src/shared/src/types/reimbursement-requests-types.ts` — Good example of complex nested types and multiple payload types
- `src/shared/src/types/project-types.ts` — Good example of type hierarchies (`WbsElement` → `Project`, preview types)
- `src/shared/index.ts` — Barrel export file; every new type file must be added here

## Checklist

- [ ] Model name uses `PascalCase` with underscores (e.g., `My_New_Model`)
- [ ] Primary key is `{modelName}Id String @id @default(uuid())`
- [ ] Model has `createdAt DateTime @default(now())` (and optionally `updatedAt DateTime @updatedAt`)
- [ ] Model has `organizationId` (directly or via parent chain)
- [ ] `organizationId` has `@@index([organizationId])`
- [ ] All FK fields have `@@index` declarations
- [ ] Named relations used when multiple relations target the same model
- [ ] Soft deletion uses `dateDeleted DateTime?` pattern (if applicable)
- [ ] Corresponding shared TypeScript types created in `src/shared/src/types/`
- [ ] Shared type file re-exported from `src/shared/index.ts`
- [ ] Prisma enums mirrored as TypeScript enums in shared types
- [ ] Separate `Create` and `Edit` payload types defined for API operations
- [ ] Payload types use IDs for relations, not resolved objects
- [ ] Migration created with `yarn prisma:migrate`
- [ ] Shared package rebuilt with `yarn workspace shared build`

## Migration Notes

> This section describes how this pattern differs from older code in the
> codebase. New code MUST follow the patterns above. When modifying existing
> files, update them to match these patterns where practical.

**Timestamp fields:** Most existing models use `dateCreated DateTime @default(now())`. A few newer models (`Part`, `Part_Submission`, `Part_Review`, `Part_Review_Popup`) use `createdAt`/`updatedAt`. New models MUST use `createdAt` (not `dateCreated`) for the creation timestamp.

**Primary key naming:** Some older models use a bare `id` field (e.g., `Unit`, `Link_Type`, `Material_Type`, `Manufacturer`, `Graph`, `Graph_Collection`). New models MUST use `{modelName}Id`.

**Payload types:** The codebase is inconsistent about defining explicit create/edit payload types. Some features have them (e.g., `EventTypeCreateArgs`, `ReimbursementProductCreateArgs`, `ScheduleSlotCreateArgs`), while others pass inline objects or rely on partial Prisma types. The naming also varies between `CreateArgs`, `CreatePayload`, `ApiInputs`, and `FormInput`. New code MUST define explicit payload types. Prefer the `{Feature}CreateArgs` naming to match the majority of existing patterns.
