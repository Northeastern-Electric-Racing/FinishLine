---
name: slim-domain
description: Guided refactor of one FinishLine domain (e.g. tasks, calendar) onto slim Base<Domain> query args, transformers, and shared types, with per-endpoint models extending the base. Walks the developer through approval checkpoints before implementing.
argument-hint: <domain>
disable-model-invocation: true
---

# Slim domain refactor: `$ARGUMENTS`

Background: large Prisma payloads under concurrency OOM the 2GB EC2 instances. Every query must stay well under **75,000 nodes** (≈7.5MB over the wire). The fix: slim base models that you opt in to extending, never fat defaults that you opt out of.

This is a pipeline with **three approval checkpoints**. Do not start a phase until the previous checkpoint is approved. Do not edit any code until Checkpoint 3 is approved.

If `$ARGUMENTS` is empty or does not match a domain (no `src/backend/src/routes/$ARGUMENTS.routes.ts` or similar), ask which domain before doing anything.

## Phase 1: Map the call sites

1. Read the domain's routes file and list every endpoint (method + path → controller → service function → query args used).
2. For each GET-style endpoint (anything that returns a model), find its frontend api function in `src/frontend/src/apis/` and its hook in `src/frontend/src/hooks/`.
3. Spawn one `Explore` subagent per read endpoint, all in a single message so they run in parallel. Give each one this brief, filled in:

   > Endpoint `<METHOD path>` is called through `<api fn>` → `<hook>`. Find every component in `src/frontend/src` that consumes this hook's data, directly or through props or utils it passes the data to. For **each call site** (a distinct page or component usage), report:
   > - `site`: page/component file path
   > - `fields`: every field of the response actually read, as dot paths (e.g. `assignees[].firstName`, `wbsElement.name`). Follow the data through props, utils, and transformers in `src/frontend/src/apis/transformers/`. Do not list a field just because the type has it.
   > - `db-pushdown`: anything the frontend derives that the query could compute instead (counts, existence checks, filters, sums, "latest X"). Example: loading every task only to count the open ones should be a Prisma `_count`.
   > - `volume`: how many items the site loads, and whether they are all visible at once or only after the user clicks, expands, or scrolls.
   > Report facts only, with file:line references. Don't propose models.

4. Mutation endpoints (create/update/delete) don't need subagents. Just record whether any frontend caller reads the response body (`onSuccess` data, the `mutateAsync` result).

## Phase 2: Base model → CHECKPOINT 1

Design `Base<Domain>`: the smallest shape every call site needs.

- Use `select`, never `include`.
- Be liberal with **primitive** columns. They are cheap, and keeping them avoids an extended model per endpoint.
- Be strict about **relations**. Include one only if the model is meaningless without it (a task needs its wbs element, a project its wbs element). Never put to-many relations (lists) in the base, except tiny ones that are bounded in practice (a task's assignees or labels). When a relation is included, select only the fields that are needed, or nest another domain's `getBase<X>QueryArgs()`.
- No organizationId parameter unless the select actually uses it.

**Stop and present:**

```
Call sites
| Page / component | Endpoint | Fields used |
...
DB pushdown opportunities: <bullets>

Proposed Base<Domain>
<select block, with a one-line reason next to each relation>
```

Iterate with the developer until they approve.

## Phase 3: Endpoint models → CHECKPOINT 2

Group call sites into models that extend the base. Decide like this:

- **Merge** two call sites into one model when the difference is only primitives or single-row relations. A few extra fields are cheaper than an extra query args file, transformer, and type.
- **Split** when one site needs a to-many relation, a multi-hop nested object, or anything that grows with the org's data and the other site doesn't.
- **Push down** every derivation from Phase 1 into the query (`_count`, filtered relation `where`, `select` of one field). Each one becomes an explicit custom field on the shared type (e.g. `numOpenTasks: number`).
- **Frontend refactors are allowed** when they unlock a much slimmer endpoint, such as splitting one endpoint into two, or loading details only when the user opens an item. Each one must be called out for approval, with the files it touches.
- Name models after what they serve (`TaskBoardItem`, `TaskHomeCard`), not after `Preview` or `Full`.
- **Deprecating Older Models** Models should not be using nested older get_queryArgs for nested objects. New models should either query nested information directly, or use the needed objects base model. If the object does not have a base model, you should propose making one.

**Stop and present** one entry per model:

```
<ModelName> extends Base<Domain>
  Endpoints: <METHOD path> (new | changed | unchanged)
  Serves: <pages/components>
  Adds on top of base: <fields/relations>
  Computed in DB: <_count / filters → custom field names>
  Frontend changes: <none | description + files>
```

Also list any endpoints you propose to add or remove. Iterate until approved.

## Phase 4: Call-site optimizations → CHECKPOINT 3

1. **Large reads:** for each endpoint where `volume` is unbounded or most of the items aren't visible up front, propose whatever slims it down best for that page. Options include pagination, loading details only when the user clicks in, or moving filtering or search to the server. There is no default answer, so pick the one that fits how the page is actually used. These changes alter how pages load, so never make one without approval. If the page filters, searches, or sorts on the client, say how that keeps working once everything isn't loaded up front.
2. **Mutations:** every create/update/delete returns `204` (`res.sendStatus(204)`). The service returns `Promise<void>` and passes no query args to the write. Exception: keep a return body only when a frontend caller reads it (from Phase 1), and then return the slimmest endpoint model that caller needs. List every exception.

**Stop and present** both lists. Once the developer approves, proceed straight to implementation.

## Phase 5: Implement

Follow these placement rules:

- `src/backend/src/prisma-query-args/<domain>.query-args.ts` holds **only** `getBase<Domain>QueryArgs` and extended query args used by **more than one** endpoint. Extend by spreading: `select: { ...getBase<Domain>QueryArgs().select, extra: true }`. Export a `ReturnType` type for each.
- A model used by a single endpoint gets its query args inline in the service function, still spread from the base.
- Transformers go in `src/backend/src/transformers/<domain>.transformer.ts`. Extended transformers start with `...base<Domain>Transformer(x)`.
- Shared types go in `src/shared/src/types/<domain>-types.ts`. Extended types use `interface X extends Base<Domain>`. Give each type a one-line doc comment naming what it serves.
- Update the controllers, routes (with validators for new params), the frontend api functions, hooks (mutation hooks become `useMutation<void, ...>`), call sites, and the test stubs in `src/frontend/src/tests/test-support/`.
- **Validation reads** (any DB call whose result is never returned, such as existence, permission, or org checks) select the absolute minimum inline: just the columns being checked, or `_count` for a count. This is usually not a base query args.
- **Helper parameter types:** functions that take a model (utils, slack notifications, permission checks) take only what they read, e.g. `Pick<Base<Domain>, 'wbsNum' | 'title'>`, never a full or fat type.
- When changing react-query keys, keep each read key under a prefix that the domain's mutations already invalidate.
- Fix bugs you come across only when they are obviously wrong (e.g. `await !promise`, a missing org check), and list each one in the final summary. Anything debatable goes under "Ask the developer".
- **Other domains:** if old query args, transformers, or types are still used by a domain you are not refactoring, keep them and mark them `/** @deprecated Use <new>. Still used by <file> until <domain> is refactored */`. Do not refactor the other domain. Delete only what has no remaining users.

Then verify, and fix until everything passes:

1. `yarn workspace shared build`
2. `cd src/backend && npx tsc --noEmit`
3. `cd src/frontend && npx tsc --noEmit`
4. Update the backend tests for the domain (`src/backend/tests/`) to match the new return shapes and the `204`s. **Backend tests wipe the database in `src/backend/.env` (`resetUsers` deletes most tables), so never run them without asking.** Ask the developer to confirm that `DATABASE_URL` points at a throwaway test database, then run `yarn workspace backend test <domain>`. If tests can't run, say so explicitly. Never report them as passing.
5. `yarn workspace frontend test` for the touched components.

Finish with a summary covering:
- the models created
- the endpoints changed
- the deprecated items left behind and which domain still uses them
- the bugs fixed along the way
- the verification results

## Ask the developer, don't decide, when

- a model can't be built without pulling in another domain's fat query args, or without changing another domain's code
- a change would alter visible behavior (fewer items shown, a new loading state, different sort order)
- a mutation's response is read by a caller and you aren't sure how slim it can be made
- the Prisma schema seems to need a change (an index or a new column)
- a subagent report is ambiguous about whether a field is actually rendered
- verification fails for a reason outside this domain
