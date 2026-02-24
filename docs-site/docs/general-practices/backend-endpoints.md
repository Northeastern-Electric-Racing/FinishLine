---
title: Backend Endpoints
description: Guide for creating backend API endpoints in FinishLine following the Route → Controller → Service pattern with multi-tenant security. Use when creating new endpoints, adding API routes, implementing controllers or services, building backend request handlers, or when asked how the backend works.
skill: true
skill_name: backend-endpoints
---

# Backend Endpoints

> **Summary:** Every backend endpoint in FinishLine follows a three-layer pattern: Route (validation) → Controller (request extraction) → Service (business logic). This skill walks through the full pattern and how to add a new endpoint from scratch.

## Overview

FinishLine's backend is an Express.js application written in TypeScript. All request handling is split into three distinct layers with clear responsibilities:

1. **Routes** define the HTTP method and path, declare validation rules using `express-validator`, and point to a controller method. They contain zero business logic.
2. **Controllers** are thin glue — they extract data from `req.params`, `req.body`, and `req.query`, call the appropriate service method, and return the result as JSON. They MUST delegate all errors to Express via `next(error)`.
3. **Services** contain all business logic: permission checks, database queries via Prisma, data transformation, and side effects (Slack notifications, Google integrations, etc.). Services throw custom exceptions when something goes wrong.

Two key objects are available on every request thanks to global middleware: `req.currentUser` (the authenticated `User`) and `req.organization` (the Prisma `Organization` record). These are set by the `getUserAndOrganization` middleware in `src/backend/index.ts` and typed via `src/backend/custom.d.ts`.

## Architecture

```
  Client Request
       │
       ▼
┌──────────────┐  JWT validated, user
│  Middleware   │  and organization
│  (global)    │  attached to req
└──────┬───────┘
       │
       ▼
┌──────────────┐  express-validator
│    Route     │  rules, then
│              │  validateInputs
└──────┬───────┘
       │
       ▼
┌──────────────┐  Extract params/body,
│  Controller  │  call service, return
│  (thin)      │  JSON, pass errors
│              │  to next()
└──────┬───────┘
       │
       ▼
┌──────────────┐  Permission checks,
│   Service    │  Prisma queries,
│              │  transformers,
│              │  side effects
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  Prisma DB   │
└──────────────┘
```

If a service throws an exception, it bubbles up through the controller's `next(error)` call and is caught by the global `errorHandler` middleware registered at the bottom of `src/backend/index.ts`.

## File Locations

| Layer | Path | Naming |
|-------|------|--------|
| Entry point | `src/backend/index.ts` | — |
| Routes | `src/backend/src/routes/{feature}.routes.ts` | `{feature}Router` |
| Controllers | `src/backend/src/controllers/{feature}.controllers.ts` | `{Feature}Controller` class |
| Services | `src/backend/src/services/{feature}.services.ts` | `{Feature}Service` class |
| Validation | `src/backend/src/utils/validation.utils.ts` | Shared validators |
| Errors | `src/backend/src/utils/errors.utils.ts` | `HttpException` subclasses |
| Express types | `src/backend/custom.d.ts` | `currentUser` and `organization` on `Request` |

For query args and transformers, see the [query-args-and-transformers](./query-args-and-transformers) skill.

## How Endpoint URLs Work

The full URL path for any endpoint is the **combination** of the base path registered in `src/backend/index.ts` and the route path in the router file. This is a very common source of confusion.

For example, if `index.ts` registers:
```typescript
app.use('/calendar', calendarRouter);
```

And the router defines:
```typescript
calendarRouter.post('/shop/create', ...);
```

Then the actual endpoint URL is `POST /calendar/shop/create`. The base path `/calendar` comes from `index.ts`, and `/shop/create` comes from the route file. Always mentally concatenate these two when figuring out or defining an endpoint's URL.

## Step-by-Step: Adding a New Endpoint

This walkthrough adds a hypothetical `POST /calendar/shop/create` endpoint.

### Step 1: Define the Route

Add validation rules using `express-validator` and the helpers from `validation.utils.ts`. Always end the chain with `validateInputs` before the controller method.

```typescript
// src/backend/src/routes/calendar.routes.ts
import express from 'express';
import { body } from 'express-validator';
import {
  nonEmptyString,
  isDate,
  validateInputs
} from '../utils/validation.utils.js';
import CalendarController
  from '../controllers/calendar.controllers.js';

const calendarRouter = express.Router();

calendarRouter.post(
  '/shop/create',
  nonEmptyString(body('name')),
  nonEmptyString(body('description')),
  isDate(body('dateEstablished')),
  validateInputs,
  CalendarController.createShop
);

export default calendarRouter;
```

**Key rules for routes:**

- Use `GET` for all read operations. Use `POST` for all mutations (create, edit, delete). NEVER use `PUT`, `PATCH`, or `DELETE` HTTP methods.
- Delete endpoints follow the pattern `POST '/{entity}/:id/delete'`.
- Always call `validateInputs` as the last middleware before the controller.
- Use the shared validation helpers (`nonEmptyString`, `intMinZero`, `isDate`, etc.) instead of writing raw `express-validator` chains.
- For array fields, validate both the array and its items: `body('ids').isArray()` then `body('ids.*').isString()`.
- URL params use `param()`, query strings use `query()`, body fields use `body()`.

**When to abstract validators:** Keep validation inline in the route by default. Only extract validators into `validation.utils.ts` when:
- The request body contains a **nested object** that is itself a known entity (e.g., a work package embedded inside a project create payload). Create a named validator array like `workPackageProposedChangesValidators`.
- The **same set of validations** is repeated across multiple routes (e.g., `descriptionBulletsValidators` used in both work package and project routes).

For a simple endpoint with a few string/number/date fields, just write the validators inline.

### Step 2: Register the Router (if new feature)

If creating a brand new feature router, register it in `src/backend/index.ts`:

```typescript
// src/backend/index.ts
import calendarRouter
  from './src/routes/calendar.routes.js';

// ... after getUserAndOrganization middleware ...
app.use('/calendar', calendarRouter);
```

Remember: the full endpoint URL is `index.ts` base path + route path = `POST /calendar/shop/create`.

### Step 3: Write the Controller Method

Controllers follow a rigid structure: try/catch, extract request data, call service, return JSON, pass errors to `next`.

```typescript
// src/backend/src/controllers/calendar.controllers.ts
import { NextFunction, Request, Response } from 'express';
import CalendarService
  from '../services/calendar.services.js';

export default class CalendarController {
  static async createShop(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { name, description, dateEstablished }
        = req.body;

      // Parse date strings to Date objects
      // before passing to the service
      const parsedDate = new Date(dateEstablished);

      const shop = await CalendarService.createShop(
        req.currentUser,
        name,
        description,
        parsedDate,
        req.organization
      );

      res.status(200).json(shop);
    } catch (error: unknown) {
      next(error);
    }
  }
}
```

**Key rules for controllers:**

- Every method MUST be `static async` with signature `(req: Request, res: Response, next: NextFunction)`.
- Every method body MUST be wrapped in `try { ... } catch (error: unknown) { next(error); }`.
- NEVER handle errors directly in the controller. Always call `next(error)`.
- Extract URL params with: `const { id } = req.params as Record<string, string>;`
- **Parse date strings to `Date` objects in the controller** before passing to the service: `new Date(startTime)`.
- Always pass `req.currentUser` and `req.organization` to service methods that need them.
- Return `res.status(200).json(result)` for all successful responses.
- Controllers contain ZERO business logic — no permission checks, no database queries.

### Step 4: Write the Service Method

Services contain all business logic.

```typescript
// src/backend/src/services/calendar.services.ts
import { User, Shop, notGuest } from 'shared';
import prisma from '../prisma/prisma.js';
import {
  AccessDeniedGuestException,
  HttpException
} from '../utils/errors.utils.js';
import { shopTransformer }
  from '../transformers/calendar.transformer.js';
import { getShopQueryArgs }
  from '../prisma-query-args/shop.query-args.js';
import { userHasPermission }
  from '../utils/users.utils.js';
import { Organization } from '@prisma/client';

export default class CalendarService {
  /**
   * Creates a new shop.
   *
   * @param submitter the user creating the shop
   * @param name the name of the shop
   * @param description a description of the shop
   * @param dateEstablished when the shop was set up
   * @param organization the current organization
   * @returns the created Shop
   * @throws AccessDeniedGuestException if the
   *   submitter is a guest
   * @throws HttpException if a shop with the same
   *   name already exists
   */
  static async createShop(
    submitter: User,
    name: string,
    description: string,
    dateEstablished: Date,
    organization: Organization
  ): Promise<Shop> {
    // 1. Permission check
    if (
      !(await userHasPermission(
        submitter.userId,
        organization.organizationId,
        notGuest
      ))
    ) {
      throw new AccessDeniedGuestException(
        'create shops'
      );
    }

    // 2. Business rule validation (inline select)
    const duplicate = await prisma.shop.findFirst({
      where: {
        organizationId: organization.organizationId,
        dateDeleted: null,
        name: { equals: name, mode: 'insensitive' }
      },
      select: { shopId: true }
    });

    if (duplicate) {
      throw new HttpException(
        400,
        'A shop with that name already exists'
      );
    }

    // 3. Database write (query args for response)
    const created = await prisma.shop.create({
      data: {
        name,
        description,
        dateEstablished,
        organizationId: organization.organizationId,
        userCreatedId: submitter.userId
      },
      ...getShopQueryArgs(organization.organizationId)
    });

    // 4. Transform and return
    return shopTransformer(created);
  }
}
```

**Key rules for services:**

- Every method MUST be `static async`.
- Every mutation method MUST accept `submitter: User` and `organization: Organization`.
- Every read method MUST accept `organization: Organization` and filter by `organization.organizationId`.
- NEVER return raw Prisma objects. Always pass results through a transformer.
- Throw custom exceptions from `errors.utils.ts` — never throw plain `Error` objects.
- Add JSDoc comments with `@param`, `@returns`, and `@throws` tags.
- Multiple database writes MUST be wrapped in `prisma.$transaction()`.
- Check permissions early, before any database writes.
- ALWAYS filter `dateDeleted: null` on queries at both the top level and within nested includes/selects.
- Deleting an entity MUST be a soft delete (`dateDeleted: new Date()`), never `prisma.*.delete()`.

For query args and transformer patterns, see the [query-args-and-transformers](./query-args-and-transformers) skill.

### Step 5: Deciding the Access Level

Every write endpoint (and some sensitive reads) needs a permission check at the top of the service method. Use `userHasPermission` with the appropriate check function from `shared`:

```typescript
import {
  notGuest,      // members and above
  isLeadership,  // leads and above
  isHead,        // heads and above
  isAdmin        // admins and app-admins only
} from 'shared';

if (
  !(await userHasPermission(
    submitter.userId,
    organization.organizationId,
    isHead  // choose the right level
  ))
) {
  throw new AccessDeniedAdminOnlyException(
    'create event types'
  );
}
```

**How to choose the right level:**

The role hierarchy from lowest to highest is: Guest → Member → Leadership (leads) → Head → Admin → App Admin.

- **`notGuest` (members and up):** Most create operations on everyday entities. Members should be able to create things they interact with regularly (e.g., reimbursement requests, schedule confirmations, tasks). All writes should be at least this level — guests NEVER mutate data.
- **`isLeadership` (leads and up):** Creating higher-level entities and editing things the user created. Leads should be able to create basically anything, and edit their own creations.
- **`isHead` (heads and up):** Creating and editing general organizational objects not attached to a specific user (e.g., event types, calendars, shops, machinery).
- **`isAdmin` (admins only):** Org-wide configuration or destructive operations (e.g., deleting event types, managing organization settings, creating projects or work packages without a change request).

Match the exception class to the level: `AccessDeniedGuestException` for `notGuest`, `AccessDeniedMemberException` for `isLeadership`, `AccessDeniedException` with a descriptive message for `isHead`, `AccessDeniedAdminOnlyException` for `isAdmin`.

## Error Handling

Services throw exceptions from `src/backend/src/utils/errors.utils.ts`. The global `errorHandler` middleware catches them.

| Exception | Status | When to Use |
|-----------|--------|-------------|
| `HttpException(status, msg)` | any | General-purpose with custom status |
| `NotFoundException(name, id)` | 404 | Entity not found |
| `DeletedException(name, id)` | 404 | Entity is soft-deleted |
| `AccessDeniedException(msg?)` | 403 | Generic permission failure |
| `AccessDeniedAdminOnlyException(action)` | 403 | Non-admin attempting admin action |
| `AccessDeniedMemberException(action)` | 403 | Guest/member attempting restricted action |
| `AccessDeniedGuestException(action)` | 403 | Guest attempting non-guest action |
| `InvalidOrganizationException(item)` | 400 | Entity not in current org |

The `name` parameter for `NotFoundException` and `DeletedException` MUST be one of the values in the `ExceptionObjectNames` type union in `errors.utils.ts`. Add your entity to that type if it's not listed.

## Validation Helpers

`src/backend/src/utils/validation.utils.ts` provides reusable validation chains:

| Helper | Validates |
|--------|-----------|
| `nonEmptyString(body('x'))` | Non-empty string |
| `intMinZero(body('x'))` | Integer ≥ 0, not a string |
| `decimalMinZero(body('x'))` | Decimal ≥ 0 |
| `isDate(body('x'))` | Parseable date string |
| `isOptionalDate(body('x'))` | Optional parseable date |
| `isRole(body('x'))` | Valid `RoleEnum` value |
| `isStatus(body('x'))` | Valid `WbsElementStatus` |
| `isEventStatus(body('x'))` | Valid `Event_Status` |
| `validateInputs` | Runs validation, returns 400 |

For complex reusable validators, spread them: `...descriptionBulletsValidators`.

## Key Rules

- Every controller method MUST pass errors to `next(error)`.
- Every service method MUST filter by `organization.organizationId`.
- Use `GET` for reads, `POST` for all mutations. NEVER use `PUT`, `PATCH`, or `DELETE`.
- NEVER return raw Prisma objects from services. Always use transformers.
- Multiple database writes MUST be wrapped in `prisma.$transaction()`.
- Service and controller classes use `static` methods — never instantiated.
- Always use `.js` extensions in import paths (NodeNext module resolution).
- Import `prisma` from `../prisma/prisma.js`, never from `@prisma/client` directly.
- ALWAYS filter `dateDeleted: null` at both top level and in nested relations.
- Deleting an entity MUST be a soft delete (`dateDeleted: new Date()`).
- Parse date strings to `Date` objects in the controller.

## Common Mistakes

- **Handling errors in the controller** instead of calling `next(error)`.
- **Forgetting `organizationId`** in a Prisma query — leaks data across orgs.
- **Using `PUT` or `DELETE` HTTP methods.** Use `POST` for all mutations.
- **Writing business logic in the controller.** Anything beyond request extraction belongs in the service.
- **Forgetting `validateInputs`** as the last middleware before the controller.
- **Not adding your entity to `ExceptionObjectNames`** when using `NotFoundException` or `DeletedException`.
- **Confusing the endpoint URL.** Full path = `index.ts` base path + route path.
- **Forgetting to parse dates in the controller.** Convert with `new Date()` before passing to the service.
- **Forgetting `dateDeleted: null`** on queries or nested relations.

## Reference Files

- `src/backend/src/routes/calendar.routes.ts` — Comprehensive route file with many endpoint types
- `src/backend/src/controllers/calendar.controllers.ts` — Clean controller class with consistent try/catch/next
- `src/backend/src/services/calendar.services.ts` — Full-featured service with permissions, org validation, transactions
- `src/backend/src/utils/errors.utils.ts` — Custom exception classes and global error handler
- `src/backend/src/utils/validation.utils.ts` — Shared validation helpers
- `src/backend/index.ts` — Middleware ordering and route registration
- `src/backend/custom.d.ts` — TypeScript augmentation for `currentUser` and `organization`

## Checklist

- [ ] Route uses `GET` for reads, `POST` for mutations
- [ ] All body/param/query fields have validation rules
- [ ] `validateInputs` is the last middleware before the controller
- [ ] Full endpoint URL (index.ts base + route path) is correct
- [ ] Controller is `static async` with `try/catch/next(error)`
- [ ] Controller contains NO business logic
- [ ] Date strings parsed to `Date` objects in the controller
- [ ] Service has appropriate permission check (see access level guide)
- [ ] Service filters `organization.organizationId` on all queries
- [ ] Service throws custom exceptions, not plain `Error`
- [ ] Entity name added to `ExceptionObjectNames` if needed
- [ ] All queries filter `dateDeleted: null` at every level
- [ ] Delete operations are soft deletes
- [ ] Service returns transformed shared types (see [query-args-and-transformers](./query-args-and-transformers))
- [ ] Multiple writes wrapped in `prisma.$transaction()`
- [ ] All imports use `.js` extensions
- [ ] Router registered in `index.ts` (if new feature)

## Migration Notes

> New code MUST follow the patterns above. When modifying existing files, update them to match where practical.

`work-packages.routes.ts` contains one endpoint using the `DELETE` HTTP method (`workPackagesRouter.delete('/:wbsNum/delete', ...)`). This is legacy. The prescribed pattern is `POST` for all mutations including deletions. When touching this endpoint, migrate it to `POST`.
