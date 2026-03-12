---
title: Query Args and Transformers
description: Guide for Prisma query args and transformer functions in FinishLine. Query args define reusable select/include objects for Prisma queries. Transformers convert Prisma results into shared types for the API. Use when creating query args, writing transformers, fetching data from Prisma for API responses, or when asked how data flows from the database to the frontend.
skill: true
skill_name: query-args-and-transformers
---

# Query Args and Transformers

> **Summary:** Query args define what data Prisma fetches from the database. Transformers convert that Prisma data into the shared types sent to the frontend. Together they form the data-shaping layer between Prisma and the API response.

## Overview

When a service method needs to return data to the frontend, it goes through two steps:

1. **Query args** tell Prisma exactly which fields and relations to fetch. They are reusable `select`/`include` objects defined with `Prisma.validator`.
2. **Transformers** take the typed Prisma result and reshape it into a shared type (defined in `src/shared/`) that the frontend expects.

This separation exists because Prisma's auto-generated types (column names, nested relation shapes, enum values) often differ from the API contract. Transformers handle renaming fields, mapping enums, flattening relations, and filtering out internal data.

**Critical distinction:** Query args and transformers are ONLY for data being returned to the frontend. For internal queries in a service (validation checks, duplicate detection, permission lookups), use inline `select: {}` clauses directly in the Prisma call. See the "Internal Queries" section below.

## Architecture

```
  Service Method
       │
       │  uses query args to fetch
       ▼
┌──────────────┐
│  Prisma      │  returns typed result:
│  Query Args  │  Prisma.XGetPayload<Args>
└──────┬───────┘
       │
       │  passes result to transformer
       ▼
┌──────────────┐
│  Transformer │  returns shared type
│              │  (API contract)
└──────┬───────┘
       │
       ▼
  Controller sends as JSON
```

## File Locations

| Layer        | Path                                                        | Naming                 |
| ------------ | ----------------------------------------------------------- | ---------------------- |
| Query args   | `src/backend/src/prisma-query-args/{feature}.query-args.ts` | `get{Entity}QueryArgs` |
| Transformers | `src/backend/src/transformers/{feature}.transformer.ts`     | `{entity}Transformer`  |
| Shared types | `src/shared/src/types/{feature}-types.ts`                   | TypeScript interfaces  |

## Query Args

### Structure

Every query args file follows the same pattern: export a type alias using `ReturnType`, and export a function that returns a `Prisma.validator` call.

```typescript
// src/backend/src/prisma-query-args/shop.query-args.ts
import { Prisma } from '@prisma/client';
import { getUserQueryArgs } from './user.query-args.js';

export type ShopQueryArgs = ReturnType<typeof getShopQueryArgs>;

export const getShopQueryArgs = (organizationId: string) =>
  Prisma.validator<Prisma.ShopDefaultArgs>()({
    include: {
      userCreated: getUserQueryArgs(organizationId)
    }
  });
```

The type alias (`ShopQueryArgs`) is used by the transformer to type its input parameter via `Prisma.ShopGetPayload<ShopQueryArgs>`. This creates end-to-end type safety: if you change what the query fetches, the transformer's input type updates automatically and TypeScript will flag any mismatches.

### `select` vs `include`

**Always prefer `select` over `include`.** `include` fetches all columns on the relation plus the specified nested relations. `select` fetches only the fields you list.

```typescript
// GOOD — fetches only what's needed
teams: {
  select: {
    teamName: true,
    teamId: true
  }
}

// AVOID — fetches every column on Team
teams: true

// ALSO AVOID — include fetches all Team
// columns plus the nested relation
teams: {
  include: {
    teamType: true
  }
}
```

Use `include` only when the transformer genuinely needs all (or nearly all) columns from the relation AND also needs nested relations. The `getWorkPackageQueryArgs` function uses `include` on `wbsElement` because the transformer needs most of its fields plus several nested relations. But even within that, nested relations like `teams` use `select` when only a few fields are needed.

A good example of selective fetching is `getWorkPackagePreviewQueryArgs`, which uses `select` at every level to fetch the minimal data for a dropdown/list view:

```typescript
export const getWorkPackagePreviewQueryArgs = () =>
  Prisma.validator<Prisma.Work_PackageDefaultArgs>()({
    select: {
      blockedBy: true,
      wbsElement: {
        select: {
          wbsElementId: true,
          carNumber: true,
          projectNumber: true,
          workPackageNumber: true,
          dateCreated: true,
          dateDeleted: true,
          name: true,
          lead: getUserPreviewQueryArgs(),
          manager: getUserPreviewQueryArgs(),
          status: true
        }
      },
      project: {
        select: {
          projectId: true,
          wbsElement: {
            select: {
              name: true,
              links: getLinkQueryArgs()
            }
          }
        }
      },
      startDate: true,
      duration: true,
      workPackageId: true,
      stage: true
    }
  });
```

### Nesting

Be very careful about nested query args. Every level of nesting adds database joins and increases query cost. Only include nested relations when the transformer actually needs that data to satisfy the shared type.

**Good reasons to nest:**

- The shared type has a `userCreated: User` field → nest `getUserQueryArgs`
- The shared type has a `teams: Team[]` field that needs team names → nest with `select: { teamName: true, teamId: true }`

**Bad reasons to nest:**

- "The frontend might need it eventually" — add it when it's actually needed
- Nesting three or more levels deep without confirming the transformer uses all that data

When nesting gets deep, consider whether a separate endpoint with its own query args would be better. For example, `getEventQueryArgs` and `getEventWithMembersQueryArgs` exist as two separate functions because the member-expanded version adds significant nesting that most callers don't need.

### `organizationId` Parameter

Many query args accept `organizationId` to scope nested relations. The most common case is filtering user roles to the current organization:

```typescript
export const getUserQueryArgs = (organizationId?: string) =>
  Prisma.validator<Prisma.UserDefaultArgs>()({
    select: {
      roles: organizationId ? { where: { organizationId } } : true,
      userId: true,
      firstName: true,
      lastName: true,
      email: true
    }
  });
```

Pass `organizationId` through from the service method. If your query args don't need to filter nested relations by org, the parameter can be omitted.

### Filtering Soft-Deleted Records

Query args MUST filter out soft-deleted records in nested relations using `where: { dateDeleted: null }`. This applies at every nesting level:

```typescript
export const getWorkPackageQueryArgs = (organizationId: string) =>
  Prisma.validator<Prisma.Work_PackageDefaultArgs>()({
    include: {
      blockedBy: {
        where: { dateDeleted: null }
      },
      events: {
        where: { dateDeleted: null },
        ...getEventQueryArgs(organizationId)
      },
      wbsElement: {
        include: {
          descriptionBullets: {
            where: { dateDeleted: null },
            ...getDescriptionBulletQueryArgs(organizationId)
          },
          changes: {
            where: {
              changeRequest: { dateDeleted: null }
            }
          },
          blocking: {
            where: {
              wbsElement: { dateDeleted: null }
            }
          }
        }
      }
    }
  });
```

Note: the top-level `dateDeleted: null` filter is applied in the service's `where` clause, not in the query args. Query args handle nested relation filtering.

### Circular Dependencies

The `user.query-args.ts` file has a comment: `// DO NOT CALL ANY OTHER QUERY ARGS FROM HERE TO AVOID CIRCULAR DEPENDENCIES`. Because user query args are nested into almost every other query args file, they sit at the bottom of the dependency tree. If user query args imported from, say, `event.query-args.ts`, it would create a circular import. Keep this in mind when adding new nesting.

## Transformers

### Structure

A transformer is a pure function that takes a Prisma result (typed using the query args) and returns a shared type.

```typescript
// src/backend/src/transformers/calendar.transformer.ts
import { Prisma } from '@prisma/client';
import { Shop } from 'shared';
import { ShopQueryArgs } from '../prisma-query-args/shop.query-args.js';
import { userTransformer } from './user.transformer.js';

export const shopTransformer = (shop: Prisma.ShopGetPayload<ShopQueryArgs>): Shop => {
  return {
    shopId: shop.shopId,
    name: shop.name,
    description: shop.description,
    dateCreated: shop.dateCreated,
    userCreated: userTransformer(shop.userCreated)
  };
};
```

**The input type** is always `Prisma.{Model}GetPayload<{QueryArgs}>`. This gives you a type that exactly matches what Prisma returns when using those query args.

**The return type** is always the shared type from `src/shared/`. The transformer's job is to bridge any gap between the two.

### Common Transformer Operations

**Renaming fields** — when Prisma column names differ from the shared type:

```typescript
color: calendar.colorHexCode,
```

**Mapping enums** — Prisma enums and shared enums are separate types. Create a mapping:

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

**Converting nulls to undefined** — Prisma uses `null` for optional fields, but shared types often use `undefined`:

```typescript
location: event.location ?? undefined,
zoomLink: event.zoomLink ?? undefined,
```

**Transforming nested relations** — call other transformers for nested objects:

```typescript
requiredMembers:
  event.requiredMembers.map(userTransformer),
teams: event.teams.map((team) => ({
  ...team,
  members: team.members.map(userTransformer),
  leads: team.leads.map(userTransformer),
  head: userTransformer(team.head)
})),
```

**Computing derived fields** — some shared types have fields that don't exist in the database:

```typescript
endDate: calculateEndDate(
  wpInput.startDate, wpInput.duration
),
deleted: wpInput.wbsElement.dateDeleted !== null,
```

### Composing Transformers

Transformers compose naturally. A `shopMachineryTransformer` calls `shopTransformer`, which calls `userTransformer`:

```typescript
export const shopMachineryTransformer = (sm: Prisma.Shop_MachineryGetPayload<ShopMachineryQueryArgs>): ShopMachinery => {
  return {
    shopMachineryId: sm.shopMachineryId,
    shop: shopTransformer(sm.shop),
    quantity: sm.quantity
  };
};
```

This mirrors the nesting in query args: `getMachineryQueryArgs` includes `getShopMachineryQueryArgs`, which includes `getShopQueryArgs`. The transformer chain matches the query args chain.

### Preview Transformers

When the frontend needs a lightweight version of an entity (for dropdowns, lists, or cards), create a separate "preview" query args and transformer pair:

```typescript
// Query args: minimal select
export const getWorkPackagePreviewQueryArgs = () =>
  Prisma.validator<Prisma.Work_PackageDefaultArgs>()({
    select: {
      /* only essential fields */
    }
  });

// Transformer: maps to preview type
export const workPackagePreviewTransformer = (
  wp: Prisma.Work_PackageGetPayload<WorkPackagePreviewQueryArgs>
): WorkPackagePreview => {
  return {
    /* minimal fields */
  };
};
```

This avoids fetching heavyweight data (nested changes, description bullets, events) when all the frontend needs is a name and ID.

## Internal Queries (Not for API Response)

When a service method queries the database for validation, permission checks, duplicate detection, or calculations — NOT to return data to the frontend — do NOT use query args. Write inline `select` clauses:

```typescript
// Checking for duplicates: only need the ID
const duplicate = await prisma.shop.findFirst({
  where: {
    organizationId: organization.organizationId,
    dateDeleted: null,
    name: { equals: name, mode: 'insensitive' }
  },
  select: { shopId: true }
});

// Counting members: only need the count
const team = await prisma.team.findUnique({
  where: { teamId },
  select: {
    _count: { select: { members: true } }
  }
});

// Checking existence and org ownership
const calendar = await prisma.calendar.findUnique({
  where: { calendarId },
  select: {
    calendarId: true,
    organizationId: true,
    dateDeleted: true
  }
});
```

The principle is simple: query args exist to satisfy shared types via transformers. Everything else should fetch the minimum data needed.

## How It All Connects in a Service

Here's the full flow in a service method:

```typescript
static async getSingleShop(
  shopId: string,
  organization: Organization
): Promise<Shop> {
  // 1. Fetch with query args (for API response)
  const shop = await prisma.shop.findUnique({
    where: { shopId },
    ...getShopQueryArgs(organization.organizationId)
  });

  // 2. Validate existence
  if (!shop) throw new NotFoundException(
    'Shop', shopId
  );
  if (shop.dateDeleted)
    throw new DeletedException('Shop', shopId);
  if (
    shop.organizationId !==
    organization.organizationId
  )
    throw new InvalidOrganizationException('Shop');

  // 3. Transform and return
  return shopTransformer(shop);
}
```

For mutations that need both internal lookups and a final return:

```typescript
static async editShop(
  submitter: User,
  shopId: string,
  name: string,
  description: string,
  organization: Organization
): Promise<Shop> {
  // Internal lookup — inline select
  const existing = await prisma.shop.findUnique({
    where: { shopId },
    select: {
      shopId: true,
      organizationId: true,
      dateDeleted: true
    }
  });

  if (!existing) throw new NotFoundException(
    'Shop', shopId
  );
  // ... more validation ...

  // Write + fetch for response — query args
  const updated = await prisma.shop.update({
    where: { shopId },
    data: { name, description },
    ...getShopQueryArgs(organization.organizationId)
  });

  return shopTransformer(updated);
}
```

## Key Rules

- Query args are ONLY for data returned to the frontend via transformers. Use inline `select` for internal queries.
- Always prefer `select` over `include` to avoid over-fetching.
- Only add nested query args when the transformer actually needs that data for the shared type.
- Export a type alias using `ReturnType<typeof getFunction>` for every query args function.
- Transformer input MUST be typed as `Prisma.{Model}GetPayload<{QueryArgs}>`.
- Transformer return type MUST be a shared type from `src/shared/`.
- NEVER return raw Prisma objects from a service. Always transform.
- Filter `dateDeleted: null` in nested relations within query args.
- Convert Prisma `null` to `undefined` when the shared type uses optional fields.
- Map Prisma enums to shared enums explicitly — do not assume they are the same type.
- Do not import other query args from `user.query-args.ts` to avoid circular dependencies.

## Common Mistakes

- **Using query args for internal lookups.** Fetching full nested relations just to check if a record exists wastes database resources. Use `select: { id: true }`.
- **Using `include: true`** on a relation when only a few fields are needed. Switch to `select` with specific fields.
- **Adding deep nesting "just in case."** Every nested level adds joins. Only nest what the transformer uses.
- **Forgetting `dateDeleted: null`** in nested `where` clauses within query args. This returns soft-deleted child records.
- **Returning Prisma objects directly** without a transformer. Even if the shapes look identical today, they can diverge when the schema or shared types change.
- **Forgetting `?? undefined`** on nullable Prisma fields that map to optional shared type fields. TypeScript will catch this, but it's easy to miss.
- **Not creating a preview variant** when a lightweight version exists. If the frontend has both a detail view and a list view, make separate query args and transformers for each.

## Reference Files

- `src/backend/src/prisma-query-args/work-packages.query-args.ts` — Shows both a full query args (with `include`) and a preview query args (with `select` throughout)
- `src/backend/src/prisma-query-args/event.query-args.ts` — Two variants (`getEventQueryArgs` and `getEventWithMembersQueryArgs`) for different data needs
- `src/backend/src/prisma-query-args/user.query-args.ts` — Base-level query args with `select`-first approach, org-scoped role filtering, and circular dependency warning
- `src/backend/src/transformers/calendar.transformer.ts` — Comprehensive transformer file showing enum mapping, null-to-undefined conversion, nested transformers, and soft-delete filtering
- `src/backend/src/transformers/work-packages.transformer.ts` — Demonstrates computed fields (`endDate`, `deleted`) and full/preview transformer pair

## Checklist

When adding query args and a transformer for a new entity:

- [ ] Query args function uses `Prisma.validator<Prisma.{Model}DefaultArgs>()`
- [ ] Type alias exported as `ReturnType<typeof getFunction>`
- [ ] `organizationId` parameter included if nested relations need org scoping
- [ ] `select` preferred over `include` at every level
- [ ] Nested relations filtered with `where: { dateDeleted: null }` where applicable
- [ ] No unnecessary deep nesting
- [ ] No circular dependency on `user.query-args.ts`
- [ ] Transformer input typed as `Prisma.{Model}GetPayload<{QueryArgs}>`
- [ ] Transformer return type is the shared type from `src/shared/`
- [ ] All nullable Prisma fields converted with `?? undefined` if shared type uses optional
- [ ] Prisma enums mapped to shared enums explicitly
- [ ] Nested relations transformed using their respective transformer functions
- [ ] Soft-deleted nested records filtered if not handled in query args
- [ ] Preview variant created if a lightweight view is needed
