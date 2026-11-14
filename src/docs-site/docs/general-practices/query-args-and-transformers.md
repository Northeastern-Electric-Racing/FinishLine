---
title: Query Args and Transformers
description: Guide for Prisma query args and transformer functions in FinishLine. Every domain has a slim Base model (query args, transformer, shared type) that per-endpoint models extend with only what they need. Transformers convert Prisma results into shared types for the API. Use when creating query args, writing transformers, fetching data from Prisma for API responses, or when asked how data flows from the database to the frontend.
skill: true
skill_name: query-args-and-transformers
---

# Query Args and Transformers

> **Summary:** Query args define what data Prisma fetches from the database. Transformers convert that Prisma data into the shared types sent to the frontend. Every domain has a slim **Base** model that endpoints **opt in** to extending, never a fat default that endpoints opt out of.

## Overview

When a service method needs to return data to the frontend, it goes through two steps:

1. **Query args** tell Prisma exactly which fields and relations to fetch. They are `select` objects defined with `Prisma.validator`.
2. **Transformers** take the typed Prisma result and reshape it into a shared type (defined in `src/shared/`) that the frontend expects.

This separation exists because Prisma's auto-generated types (column names, nested relation shapes, enum values) often differ from the API contract. Transformers handle renaming fields, mapping enums, flattening relations, and filtering out internal data.

**Why payload size matters:** our EC2 instances have about 1.3GB of memory for the app. Several large queries running at once will crash the instance (OOM). As a rule of thumb, keep every query well under **75,000 nodes**, where a node is one object or value in the result. 10,000 nodes is roughly 1MB over the wire. The usual cause of oversized queries is a "full" query args that every endpoint reuses, with every relation nested inside it. The Base pattern below exists to prevent that.

**Critical distinction:** Query args and transformers are ONLY for data being returned to the frontend. For internal queries in a service (validation checks, duplicate detection, permission lookups), use a minimal inline `select` directly in the Prisma call. See the "Internal Queries" section below.

## Architecture

```
            Base<Domain>                      ← slim: every consumer needs it
            ┌──────┴───────┐
   <Domain>BoardItem   <Domain>HomeCard       ← per-endpoint: spread the base, add only what that page reads
```

The same tree exists three times, once per layer:

| Layer       | Base                        | Extended                                              |
| ----------- | --------------------------- | ----------------------------------------------------- |
| Query args  | `getBaseTaskQueryArgs()`    | `select: { ...getBaseTaskQueryArgs().select, extra }` |
| Transformer | `baseTaskTransformer(task)` | `{ ...baseTaskTransformer(task), extra }`             |
| Shared type | `interface BaseTask`        | `interface TaskBoardItem extends BaseTask`            |

```
  Service Method
       │  fetches with Base or extended query args
       ▼
  Prisma.XGetPayload<Args>
       │  passes result to matching transformer
       ▼
  Shared type (API contract)
       │
       ▼
  Controller sends as JSON
```

## File Locations

| Layer        | Path                                                        | Contents                                                        |
| ------------ | ----------------------------------------------------------- | --------------------------------------------------------------- |
| Query args   | `src/backend/src/prisma-query-args/{feature}.query-args.ts` | `getBase{Entity}QueryArgs` + extended args used by 2+ endpoints |
| Service      | `src/backend/src/services/{feature}.services.ts`            | Inline extended args for single-endpoint models                 |
| Transformers | `src/backend/src/transformers/{feature}.transformer.ts`     | `base{Entity}Transformer` + every extended transformer          |
| Shared types | `src/shared/src/types/{feature}-types.ts`                   | `Base{Entity}` + every extended interface                       |

## The Base Model

The base is the smallest shape that every consumer of the entity needs. It must be slim enough to appear in any list.

```typescript
// src/backend/src/prisma-query-args/tasks.query-args.ts
export type BaseTaskQueryArgs = ReturnType<typeof getBaseTaskQueryArgs>;

export const getBaseTaskQueryArgs = () =>
  Prisma.validator<Prisma.TaskDefaultArgs>()({
    select: {
      taskId: true,
      title: true,
      notes: true,
      status: true,
      priority: true,
      deadline: true,
      // a task is meaningless without the wbs element it belongs to; every consumer navigates by it
      wbsElement: { select: { carNumber: true, projectNumber: true, workPackageNumber: true } },
      assignees: getBaseUserQueryArgs(),
      labels: getBaseTaskLabelQueryArgs()
    }
  });
```

Rules for the base:

- **Use `select`, never `include`.** `include` pulls every column on the model, so a field added for one endpoint bloats every other endpoint. `select` is the equivalent of listing columns in SQL instead of `select *`.
- **Be liberal with primitive columns.** They are cheap, and including them saves writing an extended model just for one scalar.
- **Be strict about relations.** Include one only if the entity is meaningless without it (a task's wbs element, a project's wbs element). When you do, select only the fields needed, or nest that entity's own `getBase{X}QueryArgs()`.
- **No to-many relations** (lists), except ones that are tiny and bounded in practice, like a task's assignees and labels.
- **No `organizationId` parameter** unless the select actually uses it.

## Extended Models

Each endpoint (or group of endpoints with near-identical needs) gets a model that extends the base with exactly what its pages read.

```typescript
export const getTaskHomeCardQueryArgs = () =>
  Prisma.validator<Prisma.TaskDefaultArgs>()({
    select: {
      ...getBaseTaskQueryArgs().select,
      wbsElement: {
        select: {
          carNumber: true,
          projectNumber: true,
          workPackageNumber: true,
          // enough to name the task's project
          name: true,
          workPackage: { select: { project: { select: { wbsElement: { select: { name: true } } } } } }
        }
      }
    }
  });
```

**Merge or split?** Two endpoints share a model when they differ only by primitives or single-row relations, because a few extra fields cost less than another query args, transformer and type. Split them when one needs a to-many relation, a multi-hop nested object, or anything that grows with the org's data and the other doesn't.

**Name models after what they serve** (`TaskBoardItem`, `TaskHomeCard`), not `Preview`/`Full`/`WithX`.

**Never nest older, fat query args** (e.g. `getUserQueryArgs`, `getProjectQueryArgs`) inside a new model. Query the nested fields directly, or use that entity's `getBase{X}QueryArgs()`. If the entity has no base yet, create one.

**Push computation into the query.** If the frontend would load a list only to count, filter, or check it, compute that in Prisma instead (`_count`, a relation `where`) and expose it as an explicit field on the shared type:

```typescript
_count: { select: { tasks: { where: { dateDeleted: null, status: { not: 'DONE' } } } } }
```

### Where extended query args live

- Used by **two or more** endpoints → export it from the query args file, with its `ReturnType` type.
- Used by **one** endpoint → write it inline in the service function, still spread from the base:

```typescript
const task = await prisma.task.findUnique({
  where: { taskId },
  select: { ...getBaseTaskQueryArgs().select, startDate: true }
});
```

## Query Args Details

### Structure

Every exported query args function has a type alias using `ReturnType`, and returns a `Prisma.validator` call. The transformer uses the alias via `Prisma.TaskGetPayload<BaseTaskQueryArgs>`. If you change what the query fetches, the transformer's input type updates and TypeScript flags any mismatch.

### `organizationId` Parameter

Some query args accept `organizationId` to scope nested relations, most commonly user roles:

```typescript
roles: organizationId ? { where: { organizationId } } : true,
```

Pass it through from the service method only when the select uses it.

### Filtering Soft-Deleted Records

Query args MUST filter soft-deleted records in nested to-many relations with `where: { dateDeleted: null }`:

```typescript
export const getTaskBlockedByQueryArgs = () =>
  Prisma.validator<Prisma.TaskFindManyArgs>()({
    where: { dateDeleted: null },
    select: { taskId: true, title: true, status: true }
  });
```

The top-level `dateDeleted: null` filter goes in the service's `where` clause, not in the query args.

### Circular Dependencies

`user.query-args.ts` has a comment: `// DO NOT CALL ANY OTHER QUERY ARGS FROM HERE TO AVOID CIRCULAR DEPENDENCIES`. User query args are nested into almost every other file, so they sit at the bottom of the dependency tree. Keep this in mind when adding new nesting.

## Transformers

### Structure

A transformer is a pure function that takes a Prisma result (typed using the query args) and returns a shared type. Extended transformers start by spreading the base transformer:

```typescript
// src/backend/src/transformers/tasks.transformer.ts
export const baseTaskTransformer = (task: Prisma.TaskGetPayload<BaseTaskQueryArgs>): BaseTask => ({
  taskId: task.taskId,
  wbsNum: wbsNumOf(task.wbsElement),
  title: task.title,
  notes: task.notes,
  status: convertTaskStatus(task.status),
  priority: convertTaskPriority(task.priority),
  deadline: task.deadline ?? undefined,
  assignees: task.assignees.map(baseUserTransformer),
  labels: task.labels.map(baseTaskLabelTransformer)
});

export const taskHomeCardTransformer = (task: Prisma.TaskGetPayload<TaskHomeCardQueryArgs>): TaskHomeCard => ({
  ...baseTaskTransformer(task),
  projectName: taskProjectName(task.wbsElement)
});
```

**The input type** is always `Prisma.{Model}GetPayload<{QueryArgs}>`. Because extended args spread the base select, an extended payload is assignable to the base transformer's input.

**The return type** is always the shared type from `src/shared/`.

### Common Transformer Operations

**Renaming fields:** `color: calendar.colorHexCode`

**Mapping enums.** Prisma enums and shared enums are separate types, so map them explicitly:

```typescript
export const eventStatusTransformer = (status: PrismaEventStatus): EventStatus => {
  const mapping: Record<PrismaEventStatus, EventStatus> = {
    UNCONFIRMED: EventStatus.UNCONFIRMED,
    CONFIRMED: EventStatus.CONFIRMED,
    SCHEDULED: EventStatus.SCHEDULED,
    DONE: EventStatus.DONE
  };
  return mapping[status];
};
```

**Converting nulls to undefined:** `deadline: task.deadline ?? undefined`

**Transforming nested relations** with the related entity's base transformer: `assignees: task.assignees.map(baseUserTransformer)`

**Computing derived fields** from data the query already selected, such as `_count` results or a name one hop up. Prefer computing in the query over loading extra rows to compute here.

## Internal Queries (Not for API Response)

Any database call whose result is never returned (validation, permission checks, org checks, duplicate detection, counts) selects the **absolute minimum** inline. That is usually not a base query args:

```typescript
// Checking existence and org ownership
const originalTask = await prisma.task.findUnique({
  where: { taskId },
  select: { dateDeleted: true, wbsElement: { select: { organizationId: true } } }
});

// Only need a count
const requestedWbsElement = await prisma.wBS_Element.findUnique({
  where: { wbsNumber: { ...wbsNum, organizationId } },
  select: { dateDeleted: true, project: { select: { _count: { select: { teams: true } } } } }
});
```

The same applies in utils and helpers (e.g. `validateTaskLabels`), not only in services.

## Mutations Don't Return Data

Create, update and delete endpoints return `204` with no body. The service returns `Promise<void>` and does not pass query args to the write:

```typescript
static async editTaskStatus(user: User, organizationId: string, taskId: string, status: Task_Status): Promise<void> {
  // ... permission + validation with minimal selects ...
  await prisma.task.update({ where: { taskId }, data: { status } });
}
```

**Exception:** if a frontend caller actually reads the response (e.g. the task board inserts the created task without refetching), return the slimmest extended model that caller needs. See the [backend-endpoints](./backend-endpoints) document for the controller side.

## Helper Parameter Types

Functions that take a model (utils, Slack notifications, permission checks) accept only the fields they read, never a full type:

```typescript
export const sendSlackTaskAssignedNotification = async (
  slackId: string,
  task: Pick<BaseTask, 'wbsNum' | 'title'>,
  organizationId: string
) => { ... };
```

This lets any model that extends the base be passed in, without forcing callers to fetch more than they need.

## How It All Connects in a Service

```typescript
static async getOverdueTasksByTeamLeadership(userId: string, organization: Organization): Promise<TaskHomeCard[]> {
  // 1. Internal lookup: minimal inline select
  const teams = await prisma.team.findMany({
    where: { organizationId: organization.organizationId, OR: [{ leads: { some: { userId } } }, { headId: userId }] },
    select: { teamId: true }
  });

  // 2. Fetch for the response: extended query args
  const tasks = await prisma.task.findMany({
    where: { deadline: { lt: new Date() }, status: { not: 'DONE' }, dateDeleted: null /* ... */ },
    ...getTaskHomeCardQueryArgs()
  });

  // 3. Transform and return
  return tasks.map(taskHomeCardTransformer);
}
```

## Key Rules

- Every domain has `getBase{Entity}QueryArgs`, `base{Entity}Transformer`, and `Base{Entity}`. Extended models spread or extend them.
- Always use `select`, never `include`.
- The base has primitives freely, and relations only when the entity is meaningless without them.
- Never nest older, fat query args in a new model. Use the related entity's base, or select fields directly.
- The query args file holds only the base and extended args used by 2+ endpoints. Single-endpoint args go inline in the service.
- Push counts, filters and existence checks into the query and expose them as explicit fields.
- Query args are ONLY for data returned to the frontend. Internal queries select the bare minimum inline.
- Mutations return `204` and pass no query args, unless a caller reads the response.
- Helper functions take a `Pick` of only the fields they use.
- Transformer input MUST be `Prisma.{Model}GetPayload<{QueryArgs}>`, and its output MUST be a shared type.
- NEVER return raw Prisma objects from a service.
- Filter `dateDeleted: null` in nested to-many relations.
- Map Prisma enums to shared enums explicitly, and convert `null` to `undefined` for optional fields.
- Do not import other query args from `user.query-args.ts`.

## Common Mistakes

- **Growing the base for one endpoint.** If only one page needs a field or relation, it belongs in that page's extended model.
- **Reusing one big model everywhere.** This is what causes OOMs. Each page should get only what it reads.
- **Nesting another domain's full query args** (e.g. `getUserQueryArgs` for a list of assignees). Use `getBaseUserQueryArgs()`.
- **Using `include`**, even for a single relation.
- **Loading a list just to count it** on the frontend or in a transformer. Use `_count`.
- **Using query args for internal lookups.** Select only the columns being checked.
- **Returning the updated object from a mutation** that no caller reads.
- **Exporting single-use query args** from the query args file instead of writing them inline in the service.
- **Forgetting `dateDeleted: null`** in nested to-many `where` clauses.

## Reference Files

- `src/backend/src/prisma-query-args/tasks.query-args.ts`: base task args, extended board and home card args, and `_count` pushdown
- `src/backend/src/transformers/tasks.transformer.ts`: base transformer and extended transformers that spread it
- `src/shared/src/types/task-types.ts`: `BaseTask` and the interfaces that extend it
- `src/backend/src/services/tasks.services.ts`: minimal validation selects, `204` mutations, pagination
- `src/backend/src/prisma-query-args/user.query-args.ts`: `getBaseUserQueryArgs` and the circular dependency warning

## Checklist

- [ ] Base query args, transformer and shared type exist for the entity
- [ ] Every query args uses `select` at every level, with no `include`
- [ ] Base contains no relations the entity can live without, and no unbounded lists
- [ ] Extended args spread `getBase{Entity}QueryArgs().select`
- [ ] Extended transformers spread `base{Entity}Transformer(...)`
- [ ] Extended shared types `extends Base{Entity}`
- [ ] Nested relations use the related entity's base args or a direct select, never older fat args
- [ ] Single-endpoint args are inline in the service, and only shared ones are exported
- [ ] Counts, filters and existence checks are computed in the query
- [ ] Type alias exported as `ReturnType<typeof getFunction>` for each exported args
- [ ] Internal and validation queries select the bare minimum
- [ ] Mutations return nothing unless a caller reads the response
- [ ] Nested to-many relations filter `dateDeleted: null`
- [ ] Nullable Prisma fields converted with `?? undefined`, and enums mapped explicitly

## Migration Notes

> Many domains still use the older pattern: one or two "full" query args (often built with `include` and nested full query args from other domains) reused by every endpoint, plus `Preview` variants to opt out. New code MUST follow the Base pattern above.

When refactoring a domain onto the Base pattern, older query args, transformers or types that other, not-yet-refactored domains still use should stay. Mark them `/** @deprecated Use <new>. Still used by <file> until <domain> is refactored */`, and delete them once nothing uses them. The `slim-domain` skill walks through refactoring a whole domain.
