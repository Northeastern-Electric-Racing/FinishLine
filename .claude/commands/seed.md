---
description: Scaffold a seed factory and/or seed process for a new entity
argument-hint: <entity-name> [--factory-only | --process-only]
allowed-tools: [Read, Write, Edit, Glob, Grep]
---

# Seed Scaffold Command

Scaffold a factory file, a seed process file, or both for a new entity in the FinishLine seed system, along with the `seed-config` entries that drive their volumes.

## Arguments

The user invoked this command with: $ARGUMENTS

Parse the arguments:

- First positional argument: the entity name (e.g. `sponsor`, `event`, `reimbursement-request`)
- `--factory-only`: only create the factory file
- `--process-only`: only create the process file
- If no flag is given, create both

If no entity name is provided, ask the user for one before proceeding.

## Naming Conventions

Given entity name `foo-bar`:

- Factory file: `src/backend/src/prisma/factories/foo-bar.factory.ts`
- Process file: `src/backend/src/prisma/seed/foo-bar.process.ts`
- Factory function prefix: `fooBar` (camelCase)
- Process class name: `FooBarProcess` (PascalCase)
- Output type name: `FooBarOutput` (PascalCase)
- Seed config key: `fooBar` (camelCase) in `SeedConfig` / `seed-config.json`
- Prisma model name: infer from entity name or ask the user (e.g. `foo_bar` or `FooBar`)

## Step 1 — Read Context

Before generating any files:

1. Read `src/backend/src/prisma/processes/seed-process.ts` to confirm the `SeedProcess` base class API.
2. Read `src/backend/src/prisma/seed.ts` to see registered processes and their import pattern.
3. Read `src/backend/src/prisma/context.ts` to understand existing output/context types.
4. Read `src/backend/src/prisma/seed-config.ts` (the `SeedConfig` interface and helper types) and `src/backend/src/prisma/seed-config.json` (the values) — volume/count knobs live there, not hardcoded in factories.
5. Scan existing factories (`src/backend/src/prisma/factories/*.factory.ts`) and processes (`src/backend/src/prisma/seed/*.process.ts`) for one or two that are closest to the new entity, so you can mirror their style.

## Step 2 — Ask clarifying questions (if needed)

Ask the user only if these cannot be inferred:

- Which existing processes does the new process depend on? (e.g. `OrganizationProcess`, `UsersProcess`)
- What fields does the entity have that need to be faked? (high-level: ids, names, dates, enums)
- How many records should be seeded, and is the count fixed, a range, or a weighted distribution? (this becomes the `seed-config` entry)
- Should the process register itself in `seed.ts`? (default: yes)

## Step 3 — Add the config entry

Volume knobs are configuration, not code. Add them in **both** files, in the same edit:

1. `src/backend/src/prisma/seed-config.ts` — add a slice to the `SeedConfig` interface, keyed by the camelCase entity name:

```typescript
export interface SeedConfig {
  // ...existing slices
  fooBar: {
    fooBarCount: number; // fixed count
    fooBarsPerProject: NumberRange; // { min, max }
    countWeights: WeightedValue<number>[]; // fixed values, weighted
    countForProject: WeightedCount[]; // weighted, each option a value OR a min/max range
  };
}
```

2. `src/backend/src/prisma/seed-config.json` — add the matching values under the same key.

Rules:

- The JSON is read with `readFileSync` and `JSON.parse`, then **cast** to `SeedConfig`. There is no runtime validation, so a key present in the interface but missing from the JSON is `undefined` at runtime and fails deep inside faker. Never edit one file without the other.
- Reuse the existing helper types — `NumberRange` (`{ min, max }`), `WeightedValue<T>` (`{ weight, value }`), `WeightedCount` (`{ weight, value }` **or** `{ weight, min, max }`) — instead of inventing new shapes.
- Only volume/shape knobs a dev would plausibly want to turn go in the config: counts, per-parent counts, count distributions. Probabilities/`*_CHANCE` constants, write-concurrency constants, and fixture tables stay in the factory.
- Keep counts low enough that the default `yarn prisma:reset` stays fast. Add a comment in `seed-config.ts` if a value is deliberately lower than realistic (see `project.projectsPerCar`).

## Step 4 — Create the factory file

Path: `src/backend/src/prisma/factories/{entity-name}.factory.ts`

Follow these conventions exactly:

```typescript
import { Prisma } from '@prisma/client';
import { Faker } from '@faker-js/faker';
import { seedConfig } from '../seed-config.js';

// Counts come from seed-config, never hardcoded here.
export const FOO_BAR_COUNT = seedConfig.fooBar.fooBarCount;

// Probabilities and fixtures stay local to the factory.
export const FOO_BAR_ACTIVE_CHANCE = 0.85;

// One exported function per meaningful creation variant.
// Always accept (faker: Faker, organizationId: string, ...extras) as the first params.
// Return a Prisma.XCreateInput (or Prisma.XCreateManyInput for bulk helpers).
// Keep functions pure — no prisma calls inside factories.

export const fooBarCreateInput = (
  faker: Faker,
  organizationId: string
  // add extra params as needed
): Prisma.FooBarCreateInput => ({
  // populate fields using faker
});
```

Rules:

- Import only from `@prisma/client`, `@faker-js/faker`, `shared`, `../seed-config.js`, `../context.js`, `../dates.js`, `../utils/arrays.js`, `../utils/strings.js`
- No `prisma` client usage — factories are pure data builders
- Use `.js` extension on all local imports
- Export each variant as a named function (not a class)
- Use `faker.helpers.arrayElement`, `faker.helpers.weightedArrayElement`, `faker.date.*`, `faker.string.*`, etc. for realistic values
- Read every count from `seedConfig`. Either use it inline (`seedConfig.car.carCount`) or re-export it as a named constant (`export const SPONSOR_COUNT = seedConfig.sponsor.sponsorCount;`) when a process or another factory needs it — both patterns exist; prefer the re-export when the value is referenced more than once.

### Consuming each config shape

```typescript
// number — use directly
Array.from({ length: seedConfig.car.carCount }, ...)

// NumberRange — the { min, max } shape is already what faker.number.int takes
export const graphCollectionCountForOrg = (faker: Faker): number =>
  faker.number.int(seedConfig.graph.graphCollectionsPerOrg);

// WeightedValue<number>[] — pass straight to weightedArrayElement
export const generateWorkPackageCount = (faker: Faker): number =>
  faker.helpers.weightedArrayElement(seedConfig.workPackage.countWeights);

// WeightedCount[] — resolve range options to a number first, then weight
export const fooBarCountForProject = (faker: Faker): number =>
  faker.helpers.weightedArrayElement(
    seedConfig.fooBar.countForProject.map((option) => ({
      weight: option.weight,
      value: 'value' in option ? option.value : faker.number.int({ min: option.min, max: option.max })
    }))
  );
```

The `WeightedCount` resolve-then-weight map is currently repeated in `change-request.factory.ts` (as a local `weightedCount` helper), `parts.factory.ts`, and `tasks.factory.ts`. Copy the nearest one rather than inventing a different shape.

## Step 5 — Create the process file

Path: `src/backend/src/prisma/seed/{entity-name}.process.ts`

Follow this structure exactly:

```typescript
import { SeedProcess } from '../processes/seed-process.js';
import { OrganizationProcess, OrganizationOutput } from './organization.process.js';
import { seedConfig } from '../seed-config.js';
// import other dependency processes and their output types

// Destructure the process's config slice at module scope when it is used repeatedly.
const { fooBarCount } = seedConfig.fooBar;

// Combine dependency output types with intersection (&) or union
type FooBarInput = OrganizationOutput /* & OtherOutput */;

export type FooBarOutput = {
  fooBars: FooBar[]; // use the appropriate Prisma type
  // add other exported values the process produces
};

export class FooBarProcess extends SeedProcess<FooBarInput, FooBarOutput> {
  dependencies() {
    // Return constructors (not instances) of every process this one depends on.
    // The runner merges all dependency outputs and passes them to run().
    return [OrganizationProcess /* , OtherProcess */];
  }

  async run({ organization /* , other dep fields */ }: FooBarInput): Promise<FooBarOutput> {
    const { organizationId } = organization;

    // Use this.prisma for DB calls.
    // Use this.faker for randomness — already seeded deterministically by the runner.
    // Use factory functions from the corresponding factory file.

    const fooBars = await Promise.all(
      Array.from({ length: fooBarCount }, () =>
        this.prisma.fooBar.create({
          data: fooBarCreateInput(this.faker, organizationId)
        })
      )
    );

    return { fooBars };
  }
}
```

Rules:

- Extend `SeedProcess<TInput, TOutput>` — always provide concrete generic types
- `dependencies()` returns an array of process **constructors** (e.g. `[OrganizationProcess]`), never instances
- The `TInput` type must be the intersection/union of all dependency output types so destructuring works
- Do NOT seed `this.faker` yourself — the runner calls `reseed()` per process automatically
- Use `this.prisma` for all DB access; never import `prisma` directly
- Use `Promise.all` for parallel inserts when records are independent
- Export the `Output` type so downstream processes can import it
- Use `.js` extension on all local imports
- Never hardcode a count in a process. Read it from `seedConfig` (or from a factory constant that reads `seedConfig`) — see `user.process.ts`, `project.process.ts`, and `team.process.ts` for the three shapes: destructured at module scope, referenced inline, and used as a validation floor
- When a config minimum is an invariant (e.g. the process needs at least `membersPerTeam.min` candidates), validate it and throw a message that quotes the configured value, so a bad config edit produces a readable error

## Step 6 — Register in seed.ts (unless --factory-only)

Edit `src/backend/src/prisma/seed.ts`:

1. Add an import for `FooBarProcess` from `./seed/foo-bar.process.js`
2. Add `new FooBarProcess()` inside the `.register(...)` call, after all its dependencies

The order in `.register(...)` matters only insofar as dependencies must appear before dependents. The runner handles topological execution, but duplicates or missing registrations throw errors.

## Step 7 — Confirm and summarize

After creating/editing files, print a short summary:

- Files created or modified (including the two `seed-config` files)
- The process class name and its dependencies
- The config keys added, and where to tune them
- Any fields or behaviors the user should customize before running `yarn prisma:seed`
