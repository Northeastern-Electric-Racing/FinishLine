---
name: frontend-hooks-and-apis
description: Guide for creating React Query hooks and Axios API client functions in FinishLine. Covers query hooks, mutation hooks, API functions, query keys, cache invalidation, toast notifications, and frontend transformers. Use when creating new hooks, adding API calls, writing query or mutation hooks, working with React Query, implementing cache invalidation, or when asked how frontend data fetching works.
---

# Frontend Hooks and API Client Functions

> **Summary:** All server state in FinishLine flows through React Query hooks backed by Axios API functions. Query hooks fetch data, mutation hooks write data, and both follow strict patterns for cache invalidation and toast notifications.

## Overview

FinishLine uses React Query v3 for all server state management. Every API interaction follows a two-layer pattern: a **hook** (in `src/frontend/src/hooks/`) wraps a React Query `useQuery` or `useMutation` call, which delegates the actual HTTP request to an **API function** (in `src/frontend/src/apis/`). This separation keeps hooks focused on caching/state concerns and API functions focused on HTTP concerns.

The data flow for a **query** (read):

```
Component → useQuery hook → API function → Axios GET → Backend
                                              ↓
Component ← hook returns { data, isLoading } ← Axios response (transformed)
```

The data flow for a **mutation** (write):

```
Component → calls mutateAsync → useMutation hook → API function → Axios POST → Backend
                                      ↓
Component ← promise resolves ← hook invalidates cache + shows toast
```

A custom Axios instance (`src/frontend/src/utils/axios.ts`) automatically attaches the `organizationId` header on every request and converts backend error responses into JavaScript `Error` objects with meaningful messages.

## Architecture

```
┌──────────────┐     ┌──────────────┐
│  Component   │     │  useToast()  │
│  (page/modal)│     │  (context)   │
└──────┬───────┘     └──────▲───────┘
       │ calls hook          │ toast.success / error
       ▼                     │
┌──────────────────────────────────┐
│  Hook (useQuery / useMutation)   │
│  - query key management          │
│  - cache invalidation            │
│  - toast on success/error        │
│  - extracts .data from response  │
└──────────────┬───────────────────┘
               │ calls API fn
               ▼
┌──────────────────────────────────┐
│  API Function (Axios call)       │
│  - builds URL via apiUrls        │
│  - sets transformResponse        │
│  - returns AxiosResponse         │
└──────────────┬───────────────────┘
               │ HTTP request
               ▼
┌──────────────────────────────────┐
│  Backend (Express endpoint)      │
└──────────────────────────────────┘
```

## File Locations

- **Hooks:** `src/frontend/src/hooks/{feature}.hooks.ts`
- **API functions:** `src/frontend/src/apis/{feature}.api.ts`
- **Frontend transformers:** `src/frontend/src/apis/transformers/{feature}.transformer.ts`
- **URL builder:** `src/frontend/src/utils/urls.ts` (the `apiUrls` object)
- **Axios instance:** `src/frontend/src/utils/axios.ts`
- **Shared types:** `src/shared/src/types/{feature}-types.ts`
- **Toast hook:** `src/frontend/src/hooks/toasts.hooks.ts`

Naming conventions: hook files and API files MUST use the same feature name prefix. If the hooks file is `calendar.hooks.ts`, the API file is `calendar.api.ts`.

## Query Keys

Query keys are the backbone of React Query's caching and invalidation system. Every query MUST have a key that uniquely identifies the data it fetches, and mutation hooks MUST invalidate the correct keys so the UI stays in sync.

### Key Structure

Query keys are arrays. The first element identifies the entity type, and subsequent elements narrow the scope:

```typescript
// List query — base key
useQuery<Event[], Error>(['events'], ...)

// Detail query — appends ID
useQuery<Event, Error>(['events', id], ...)

// Filtered query — appends filter params
useQuery<Event[], Error>(
  ['filter-events', filterArgs],
  ...
)

// Scoped detail — appends multiple segments
useQuery<EventWithMembers, Error>(
  ['events', id, 'with-members'],
  ...
)
```

For keys that are reused across multiple hooks or need to be imported by other files for cross-feature invalidation, declare them as named constants at the top of the hooks file:

```typescript
export const EVENT_KEY = ['events'] as const;
export const EVENT_TYPE_KEY = ['event-types'] as const;
```

This is optional — inline arrays like `['events']` are equally valid. The important thing is that keys are **consistent** so that invalidation works correctly.

### Key Rules

- Detail keys MUST include the entity ID as the second element
- Filter/variant keys MUST include the filter params or variant name
- Keys MUST use lowercase hyphen-separated strings (e.g., `'filter-events'`, `'event-types'`)
- NEVER use the same key for two different queries
- If a key is used for invalidation in another hook file, export it as a named constant

## Step-by-Step: Adding a New Query Hook

### Step 1: Add the URL to `apiUrls`

In `src/frontend/src/utils/urls.ts`, add a URL builder function and export it:

```typescript
// Near other calendar endpoints
const calendarShops = () => `${calendar()}/shops`;

// In the apiUrls export object
export const apiUrls = {
  // ...existing urls
  calendarShops
};
```

### Step 2: Write the API Function

In `src/frontend/src/apis/{feature}.api.ts`:

```typescript
import axios from '../utils/axios';
import { apiUrls } from '../utils/urls';
import { Shop } from 'shared';

export const getAllShops = () => {
  return axios.get<Shop[]>(apiUrls.calendarShops(), {
    transformResponse: (data) => JSON.parse(data) as Shop[]
  });
};
```

Key rules for API functions:

- ALWAYS return the `AxiosResponse` directly (i.e., `return axios.get(...)` — do NOT extract `.data` inside the API function)
- Use `transformResponse` to parse JSON and apply frontend transformers when the response contains dates or nested objects that need transformation
- Import types from `shared`, not from local definitions
- Function names MUST match the HTTP semantics: `get*` for GET, `post*` / `create*` / `edit*` / `delete*` for POST/PUT/DELETE

### Step 3: Write the Frontend Transformer (if needed)

If the response contains `Date` fields (which arrive as strings from JSON) or nested objects that need transformation, create a transformer in `src/frontend/src/apis/transformers/{feature}.transformer.ts`:

```typescript
import { Event } from 'shared';

export const eventTransformer = (event: Event): Event => {
  if (!event || !event.scheduledTimes) return event;
  return {
    ...event,
    dateCreated: new Date(event.dateCreated),
    scheduledTimes: event.scheduledTimes.map((slot) => ({
      ...slot,
      startTime: new Date(slot.startTime),
      endTime: new Date(slot.endTime)
    }))
  };
};
```

Then use it in the API function's `transformResponse`:

```typescript
import { eventTransformer } from './transformers/calendar.transformer';

export const getAllEvents = () => {
  return axios.get(apiUrls.calendarEvents(), {
    transformResponse: (data) => JSON.parse(data).map(eventTransformer)
  });
};
```

See the [query-args-and-transformers skill](../../general-practices/query-args-and-transformers/SKILL.md) for detailed transformer patterns.

### Step 4: Write the Query Hook

In `src/frontend/src/hooks/{feature}.hooks.ts`:

```typescript
import { useQuery } from 'react-query';
import { Shop } from 'shared';
import { getAllShops } from '../apis/calendar.api';

export const useAllShops = () =>
  useQuery<Shop[], Error>(['shops'], async () => {
    const { data } = await getAllShops();
    return data;
  });
```

For detail queries that take an ID parameter, use the `enabled` option to prevent fetching when the ID is undefined:

```typescript
export const useSingleEvent = (id?: string) => {
  return useQuery<Event, Error>(
    ['events', id],
    async () => {
      const { data } = await getSingleEvent(id!);
      return data;
    },
    { enabled: !!id }
  );
};
```

### Query Hook Rules

- The query function MUST destructure `{ data }` from the API response and return `data`
- Type the hook as `useQuery<ResponseType, Error>`
- Use `enabled` to conditionally skip queries when required params are missing
- Use `keepPreviousData: true` for filter/pagination queries to avoid UI flicker

## Step-by-Step: Adding a New Mutation Hook

### Step 1: Add the URL and API Function

Same as query steps 1-2, but using `axios.post` (or `.put`, `.delete`):

```typescript
export const postCreateShop = (payload: { name: string; description: string }) => {
  return axios.post<Shop>(apiUrls.calendarCreateShop(), payload, {
    transformResponse: (data) => JSON.parse(data) as Shop
  });
};
```

### Step 2: Write the Mutation Hook

Every mutation hook MUST:

1. Get the query client for cache invalidation
2. Return `useMutation` with explicit type parameters
3. Invalidate all relevant query keys on success
4. Show a toast on both success and error

```typescript
import { useMutation, useQueryClient } from 'react-query';
import { Shop } from 'shared';
import { postCreateShop } from '../apis/calendar.api';
import { useToast } from './toasts.hooks';

export const useCreateShop = () => {
  const queryClient = useQueryClient();
  const toast = useToast();
  return useMutation<Shop, Error, { name: string; description: string }>(
    async (payload) => {
      const { data } = await postCreateShop(payload);
      return data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['shops']);
        toast.success('Shop created successfully!');
      },
      onError: (error) => {
        toast.error(error.message, 5000);
      }
    }
  );
};
```

### Step 3: Use the Hook in a Component

Components call mutation hooks and use `mutateAsync` for async/await control:

```typescript
const CreateShopModal: React.FC<Props> = ({ open, onClose }) => {
  const { mutateAsync: createShop } = useCreateShop();

  const handleSubmit = async (payload: ShopFormData) => {
    try {
      await createShop(payload);
      onClose();
    } catch (e) {
      // Error toast is handled by the hook's onError.
      // Re-throw only if the component needs to react
      // further (e.g., keep modal open).
    }
  };

  return <ShopForm onSubmit={handleSubmit} />;
};
```

### Mutation Keys

Unlike query hooks, mutation hooks do NOT require an explicit mutation key. You can optionally add one as the first argument to `useMutation` if you need to reference the mutation elsewhere (e.g., for `useMutationState` or devtools tracking):

```typescript
// Without mutation key (standard)
useMutation<Shop, Error, CreateShopPayload>(
  async (payload) => { ... },
  { onSuccess: () => { ... } }
);

// With optional mutation key
useMutation<Shop, Error, CreateShopPayload>(
  ['shops', 'create'],
  async (payload) => { ... },
  { onSuccess: () => { ... } }
);
```

### Mutation Type Parameters

`useMutation` takes three type parameters: `<TData, TError, TVariables>`:

- `TData` — the type returned by the mutation function (what the backend sends back)
- `TError` — always `Error`
- `TVariables` — the type of the argument passed to `mutateAsync(arg)`

```typescript
useMutation<Shop, Error, { name: string; description: string }>(...);
//          ^TData ^TError  ^TVariables
```

### Cache Invalidation Rules

Invalidation MUST cover all queries that could be affected by the mutation:

- **Create** → invalidate the list key (`['shops']`) and any filtered variants (`['filter-shops']`)
- **Edit** → invalidate both the list key AND the specific detail key (`['shops', id]`)
- **Delete** → invalidate the list key and any filtered variants

For cross-feature invalidation, import keys from other hook files:

```typescript
import { EVENT_KEY } from './calendar.hooks';

export const useDeleteProject = () => {
  const queryClient = useQueryClient();
  const toast = useToast();
  return useMutation<{ message: string }, Error, string>(
    async (projectId) => {
      const { data } = await deleteProject(projectId);
      return data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['projects']);
        queryClient.invalidateQueries(EVENT_KEY);
        toast.success('Project deleted successfully!');
      },
      onError: (error) => {
        toast.error(error.message, 5000);
      }
    }
  );
};
```

### Mutations Without Cache Invalidation

Some mutations don't affect cached data (e.g., file uploads, Slack notifications). These still MUST show toasts but can skip invalidation:

```typescript
export const useSlackUpcomingDeadlines = () => {
  const toast = useToast();
  return useMutation<{ message: string }, Error, Date>(
    async (deadline) => {
      const { data } = await slackUpcomingDeadlines(deadline);
      return data;
    },
    {
      onSuccess: () => {
        toast.success('Deadlines sent to Slack!');
      },
      onError: (error) => {
        toast.error(error.message, 5000);
      }
    }
  );
};
```

## Toast Notifications

The `useToast` hook (from `src/frontend/src/hooks/toasts.hooks.ts`) provides four methods:

```typescript
const toast = useToast();
toast.success('Created successfully!');
toast.error('Something went wrong', 5000);
toast.info('Processing...');
toast.warning('This action is irreversible');
```

The second argument is an optional `autoHideDuration` in milliseconds. Error toasts SHOULD use `5000` to give users time to read the error. Success toasts use the default duration (no second argument).

### Toast Message Conventions

- **Success**: Past-tense action description — `'Shop created successfully!'`, `'Event updated successfully!'`
- **Error**: Use `error.message` from the caught error, which contains the backend's error message. Fall back to a generic message: `'Failed to create shop'`

## Key Rules

- Every query MUST have a key that uniquely identifies its data; use named constants for keys shared across files
- API functions MUST return `AxiosResponse` — NEVER extract `.data` inside the API function
- Query hooks MUST destructure `{ data }` from the API response
- Every mutation hook MUST call `useToast()` and show toasts in `onSuccess` and `onError`
- Every mutation hook MUST invalidate all relevant query keys on success
- Mutation hooks MUST return the `useMutation` result directly (the component uses `mutateAsync`)
- Types for API responses MUST come from the `shared` package
- Payload/input types that are unique to the frontend (e.g., form-specific types) MAY be defined in the hooks or API file

## Common Mistakes

- **Extracting `.data` inside the API function** — This breaks the pattern and makes the return type ambiguous. API functions MUST return `AxiosResponse`. The hook extracts `.data`.
- **Forgetting `transformResponse` for date fields** — JSON serialization turns `Date` objects into strings. Any response with date fields MUST use a transformer in `transformResponse`.
- **Using a plain string as a query key** — `useQuery('events', ...)` is fragile and doesn't support partial invalidation. Always use an array: `useQuery(['events'], ...)` or `useQuery(['events', id], ...)`.
- **Not invalidating filtered/variant queries** — If you have both `['events']` and a filter query (`['filter-events', args]`), a mutation that changes events MUST invalidate both.
- **Handling toasts in the component instead of the hook** — New code MUST handle toasts in the hook's `onSuccess`/`onError`. Components should NOT call `toast.success/error` for standard mutation outcomes.
- **Adding unnecessary mutation keys** — Mutation keys are optional and only needed if you have a specific use case for them. Don't add them by default.

## Reference Files

These files demonstrate the patterns well:

- `src/frontend/src/hooks/calendar.hooks.ts` — Comprehensive example with query hooks, mutation hooks, query key exports, and cross-feature invalidation
- `src/frontend/src/apis/calendar.api.ts` — API functions with `transformResponse` and transformer usage
- `src/frontend/src/hooks/work-packages.hooks.ts` — Query hooks with parameter-based keys and mutation hooks
- `src/frontend/src/apis/work-packages.api.ts` — API functions using `workPackageTransformer` in `transformResponse`
- `src/frontend/src/apis/transformers/calendar.transformer.ts` — Frontend transformers for date conversion and nested object handling
- `src/frontend/src/hooks/toasts.hooks.ts` — The toast hook API
- `src/frontend/src/pages/CalendarPage/Components/CreateEventModal.tsx` — Example of consuming a mutation hook in a component

## Checklist

- [ ] Query keys are arrays that uniquely identify the data being fetched
- [ ] API function returns `AxiosResponse` (not extracted `.data`)
- [ ] Hook destructures `{ data }` from the API response
- [ ] `transformResponse` is set with appropriate transformer for responses containing dates
- [ ] Query hooks use `enabled` when parameters may be undefined
- [ ] Mutation hooks call `useToast()` and show toasts in `onSuccess` and `onError`
- [ ] Mutation hooks invalidate all affected query keys (list, detail, filtered variants)
- [ ] Response types are imported from `shared`
- [ ] URL is added to `apiUrls` in `src/frontend/src/utils/urls.ts`
- [ ] Hook and API files share the same feature-name prefix

## Migration Notes

> This section describes how this pattern differs from older code in the codebase. New code MUST follow the patterns above. When modifying existing files, update them to match these patterns where practical.

**Toast notifications:** Many existing mutation hooks (e.g., `useCreateShop`, `useEditCalendar` in `calendar.hooks.ts`) do not include toast notifications. Instead, toasts were handled at the component level. The prescribed pattern moves toasts into the hook's `onSuccess`/`onError` callbacks so that every consumer of the hook gets consistent feedback without duplicating toast logic. When adding new mutations, always include toasts in the hook. When modifying existing mutation hooks, add `useToast()` and the `onSuccess`/`onError` toast callbacks.

**API function return values:** Some existing API functions (e.g., `postCreateMachinery`, `postEditMachinery` in `calendar.api.ts`) extract `.data` from the Axios response and return the raw data instead of the `AxiosResponse`. The prescribed pattern is for API functions to always return `AxiosResponse`. When touching existing API functions that extract `.data`, refactor them to return the full response and update the corresponding hook to extract `.data`.

**Mutation keys:** Some existing mutation hooks include an explicit mutation key as the first argument to `useMutation`. This is optional — new code does not need mutation keys unless there is a specific reason (e.g., tracking mutation state externally). Either approach is fine.
