---
title: Seeding
description: How the FinishLine seed system works and how to add seed data for a new entity, covering the process/factory/config split, the dependency-graph runner, and the seed-config.json volume knobs. Use when adding or changing seed data, writing a seed process or factory, tuning how much data the seed generates, scaffolding seed code for a new Prisma model, or debugging a failing or slow `prisma:seed`.
skill: true
skill_name: seed-process
---

# Seeding

> **Summary:** The seed is a set of independent **processes** (one per domain slice) wired together by declared dependencies and executed by a **runner** that resolves the graph. Row *shapes* come from pure **factories**; row *counts* come from **`seed-config.json`**. To add seed data for a new entity you write one factory, one process, one config slice, and register the process.

**Code location:** `src/backend/src/prisma/`

## 1. TL;DR

| I want to... | Command |
| --- | --- |
| Wipe the DB, re-run migrations, re-seed | `yarn prisma:reset` (add `:force` to skip the confirm prompt) |
| Re-run migrations without seeding | `yarn prisma:reset:no-seed` |
| Seed an already-migrated DB | `yarn prisma:seed` |
| Browse the seeded data | `yarn prisma:studio` |
| Same, inside Docker | `yarn docker:prisma:reset` |
| Change how much data gets seeded | edit `src/backend/src/prisma/seed-config.json`, then re-seed |

After seeding you can log in as the bootstrap App Admin: Google auth id `thomas-emrax`, email `admin@bootstrap.com`.

`yarn prisma:seed` runs `npx prisma db seed`, which Prisma resolves through `src/backend/prisma.config.ts`:

```ts
export default defineConfig({
  schema: './src/prisma/schema.prisma',
  migrations: { seed: 'tsx ./src/prisma/seed.ts' }
});
```

So the entry point is **`src/backend/src/prisma/seed.ts`**.

---

## 2. Mental model

The seed is not one big script. It is a set of independent **processes**, each responsible for one slice of the domain (users, cars, projects, sponsors, …), wired together by declared **dependencies**. A **runner** resolves the dependency graph, runs processes in parallel where it can, and passes each process the outputs of the processes it depends on.

Data shapes come from **factories** — pure functions that build `Prisma.XCreateInput` objects from a `Faker` instance. Factories never touch the database; processes never invent field values inline (beyond simple orchestration).

_How much_ data gets built is a third concern, pulled out of both: **`seed-config.json`** holds every volume knob (counts, per-parent counts, count distributions), and neither factories nor processes hardcode them.

```
seed.ts                      registers every process, runs the runner
seed-config.json             all volume/count knobs — the file you edit to get more or less data
seed-config.ts               the SeedConfig type + helper types, loads and casts the JSON
processes/seed-process.ts    SeedProcess abstract base class
processes/seed-runner.ts     dependency graph, scheduling, seeding of faker, progress output
seed/*.process.ts            one process per domain slice — does the DB writes
factories/*.factory.ts       pure data builders (faker in → Prisma create input out)
context.ts                   shared output/context types (OrganizationContext, CarOutput, ...)
dates.ts, names.ts           date/name helpers
utils/                       arrays.ts, strings.ts, common.factory.ts (connectUser, connectOrganization, ...)
```

### Why this shape

- **Parallelism.** Independent processes run concurrently instead of one 3,000-line sequential file.
- **Determinism.** Every process gets its own deterministically derived faker seed, so a given commit always produces the same database.
- **Isolation.** Adding sponsors cannot break how projects are seeded. Your process only sees the outputs it declared a dependency on.
- **Testability / reuse.** Factories are pure, so they can be reused and reasoned about without a DB.
- **Tunability.** Getting a big database for perf work, or a small one for a fast reset, is a JSON edit — not a hunt through twenty factories for the constant that controls it.

---

## 3. The runner

`SeedRunner` (`processes/seed-runner.ts`) is a small builder:

```ts
await new SeedRunner()
  .withPrisma(prisma)
  .register(new OrganizationProcess(), new CarProcess() /* ... */)
  .run();
```

Options: `.withSeed(n)` overrides the base seed (defaults to `GLOBAL_SEED = 1`), `.withMaxConcurrency(n)` overrides the default of **4** concurrent processes.

What `run()` does, in order:

1. **Indexes processes by class name.** Registering the same class twice throws `Duplicate process registered: X`.
2. **Validates dependencies.** Every class returned from `dependencies()` must also be registered, or it throws `Process X depends on Y, which was not registered.`
3. **Detects cycles.** A cycle throws `Dependency cycle detected: A → B → A`.
4. **Schedules.** Repeatedly launches any process whose dependencies have all completed, up to the concurrency cap. Order in `.register(...)` is _not_ execution order — the graph decides.
5. **Per process, before `run()`:** injects `this.prisma`, then calls `reseed(deriveSeed(baseSeed, processName))`.
6. **Builds the input object.** Merges the output objects of that process's dependencies into one object and passes it to `run()`. Two dependencies exporting the same key throws `Duplicate seed output keys from X: ...`.
7. **Reports.** Live per-process progress with timings, then a total. First failure aborts the run and rethrows.

### Determinism

```ts
export const GLOBAL_SEED = 1;

const deriveSeed = (baseSeed, processName) => {
  let hash = baseSeed >>> 0;
  for (let i = 0; i < processName.length; i++) hash = (Math.imul(hash, 31) + processName.charCodeAt(i)) >>> 0;
  return hash;
};
```

Each process's faker stream is seeded from `(baseSeed, class name)`. Consequences to keep in mind:

- **Never call `this.faker.seed(...)` yourself** — the runner owns seeding.
- Renaming a process class changes all of its generated data. That is expected, not a bug.
- Values derived from `new Date()` / `Date.now()` (used in several processes, e.g. sponsors) are _not_ deterministic across days. Prefer faker date helpers or `dates.ts` helpers where relative-to-today isn't required.
- Editing `seed-config.json` changes the data too. The config is an _input_ to the seed, not part of the seed derivation — same config + same commit = same database.

---

## 4. The seed config

**Files:** `src/backend/src/prisma/seed-config.json` (values) and `seed-config.ts` (types + loader)

Every count in the seed comes from one JSON file. To make the seed bigger or smaller, edit the JSON and re-seed — no TypeScript changes, no rebuild.

```ts
export const seedConfig: SeedConfig = JSON.parse(
  readFileSync(new URL('./seed-config.json', import.meta.url), 'utf-8')
) as SeedConfig;
```

`seed-config.ts` declares the `SeedConfig` interface, one slice per domain area (`car`, `user`, `team`, `project`, `workPackage`, `changeRequest`, `sponsor`, `organizationContent`, `graph`, `part`, `task`, `descriptionBullet`, `reimbursementRequest`), plus three helper types. Every knob is one of four shapes:

| Type | Shape | Use |
| --- | --- | --- |
| `number` | `5` | a fixed count (`car.carCount`, `user.totalUsers`) |
| `NumberRange` | `{ min, max }` | a random count in a range (`team.membersPerTeam`) |
| `WeightedValue<T>[]` | `[{ weight, value }, …]` | a weighted pick among fixed values (`workPackage.countWeights`) |
| `WeightedCount[]` | `[{ weight, value } \| { weight, min, max }, …]` | weighted buckets where a bucket may itself be a range (`task.countForProject`) |

```json
{
  "car": { "carCount": 5 },
  "user": { "totalUsers": 350 },
  "team": {
    "membersPerTeam": { "min": 8, "max": 20 }
  },
  "task": {
    "countForProject": [
      { "weight": 8, "value": 0 },
      { "weight": 67, "min": 6, "max": 24 },
      { "weight": 19, "min": 25, "max": 50 }
    ]
  }
}
```

### Reading the config

Import it with the usual `.js` extension. Factories and processes are both one directory down, so the path is the same from either:

```ts
import { seedConfig } from '../seed-config.js';
```

Three patterns are in use, all fine:

```ts
// 1. Inline, where it reads clearly (car.factory.ts, project.process.ts)
Array.from({ length: seedConfig.car.carCount }, ...)

// 2. Destructured at module scope (user.process.ts)
const { totalUsers } = seedConfig.user;

// 3. Re-exported as a named constant, when a process or another factory needs it
//    (sponsor.factory.ts, organization-content.factory.ts)
export const SPONSOR_COUNT = seedConfig.sponsor.sponsorCount;
```

Each shape has a canonical way to consume it:

```ts
// NumberRange — { min, max } is already the argument faker.number.int wants
export const graphCollectionCountForOrg = (faker: Faker): number =>
  faker.number.int(seedConfig.graph.graphCollectionsPerOrg);

// WeightedValue<number>[] — hand it straight to weightedArrayElement
export const generateWorkPackageCount = (faker: Faker): number =>
  faker.helpers.weightedArrayElement(seedConfig.workPackage.countWeights);

// WeightedCount[] — resolve range buckets to a number, then weight
export const taskCountForProject = (faker: Faker): number =>
  faker.helpers.weightedArrayElement(
    seedConfig.task.countForProject.map((option) => ({
      weight: option.weight,
      value: 'value' in option ? option.value : faker.number.int({ min: option.min, max: option.max })
    }))
  );
```

That last map appears in `change-request.factory.ts` (extracted as a local `weightedCount` helper), `parts.factory.ts`, and `tasks.factory.ts`. Copy the nearest one instead of inventing a fourth spelling.

### What belongs in the config, and what does not

| In `seed-config.json` | Stays in the factory |
| --- | --- |
| Counts (`sponsorCount`, `totalUsers`, `faqCount`) | Probabilities (`ACTIVE_SPONSOR_CHANCE`, `DELETED_CONTENT_CHANCE`) |
| Per-parent counts (`projectsPerCar`, `membersPerTeam`) | Fixture tables (`SPONSOR_TIER_FIXTURES`, comment pools) |
| Count distributions (`countWeights`, `countForProject`) | Value-distribution weights (priority, status, role mixes) |
|  | Write-concurrency constants (`SPONSOR_CONCURRENCY`) |

The dividing line: the config answers "how many rows," the factory answers "what does a row look like."

### Gotchas

- **The JSON is cast, not validated.** `JSON.parse(...) as SeedConfig` means TypeScript trusts you. A key that exists in the interface but not in the JSON is `undefined` at runtime, and the failure surfaces deep inside faker (`Cannot read properties of undefined`, or an empty `weightedArrayElement`). **Always edit both files together.**
- **Counts are load-bearing for other processes.** `user.totalUsers` splits into role buckets by fixed percentages (50% guests / 35% members / 10% leadership / 4% heads / remainder admins), and `TeamProcess` throws if the resulting pools are too thin: it needs `members.length ≥ team.membersPerTeam.min`, one head per team, and `leadCandidates.length ≥ teams × team.leadsPerTeam.min` (leads are drawn from heads + admins + leadership, and no user leads two teams). Dropping `totalUsers` too far fails the seed rather than producing a small database.
- **Some defaults are deliberately low.** `project.projectsPerCar` is 5, not the pre-config 30, so the default `prisma migrate reset` stays fast. Bump it locally when you need volume; don't commit the bump.
- **Weights don't need to sum to 100.** `weightedArrayElement` normalizes. The existing entries mostly sum to 100 as a readability convention.

---

## 5. Anatomy of a factory

**Path:** `src/backend/src/prisma/factories/<entity>.factory.ts`

A factory is a set of exported, pure functions. It receives a `Faker` and returns Prisma create inputs, plus any fixture tables and the probability constants that shape a row.

```ts
import { Faker } from '@faker-js/faker';
import { Prisma, Sponsor_Value_Type } from '@prisma/client';
import { seedConfig } from '../seed-config.js';

// Counts come from the config, re-exported so the process can read them.
export const SPONSOR_COUNT = seedConfig.sponsor.sponsorCount;
export const PROSPECTIVE_SPONSOR_COUNT = seedConfig.sponsor.prospectiveSponsorCount;

// Probabilities are row shape, not volume — they stay here.
export const ACTIVE_SPONSOR_CHANCE = 0.85;

// Fixed reference data lives here too.
export const SPONSOR_TIER_FIXTURES = [
  { name: 'Black Flag', colorHexCode: '#020202', minSupportValue: 1000 },
  { name: 'Bronze Pulse', colorHexCode: '#d7b657', minSupportValue: 2500 }
];

// Weighted / conditional value generators.
export const generateValueTypes = (faker: Faker): Sponsor_Value_Type[] =>
  faker.helpers.weightedArrayElement([
    { weight: 57, value: [Sponsor_Value_Type.MONETARY] },
    { weight: 22, value: [Sponsor_Value_Type.STOCK] }
  ]);

// One create-input builder per entity/variant.
export const sponsorCreateInput = (
  organizationId: string,
  name: string,
  contactId: string,
  sponsorTierId: string,
  sponsorValue: number
): Prisma.SponsorCreateInput => ({
  name,
  sponsorValue,
  organization: { connect: { organizationId } },
  contact: { connect: { sponsorContactId: contactId } },
  tier: { connect: { sponsorTierId } }
});
```

### Factory rules

- **No Prisma client.** Import the `Prisma` _types_ from `@prisma/client`; never import or call the client. Factories are pure.
- **`Faker` is a parameter**, always. Never construct a `Faker` inside a factory.
- **Return `Prisma.XCreateInput`** (or `Prisma.XCreateManyInput` for bulk helpers) so the compiler checks the shape against the schema.
- **Named function exports**, not classes, not default exports.
- **`.js` extension on every local import** — the backend is ESM (`"type": "module"`). `../context.js`, `../utils/arrays.js`, etc. Omitting it fails at runtime, not compile time.
- Allowed imports: `@prisma/client`, `@faker-js/faker`, `shared`, and local `../seed-config.js` / `../context.js` / `../dates.js` / `../utils/*.js`.
- **No hardcoded counts.** Anything answering "how many" comes from `seedConfig` (see §4). Probabilities, fixtures, and value weights stay in the factory.
- Use `connectUser(userId)` / `connectOrganization(organizationId)` from `utils/common.factory.js` instead of hand-writing `{ connect: { ... } }` for those two.
- Realism comes from faker's weighted helpers: `faker.helpers.weightedArrayElement`, `faker.helpers.arrayElement`, `faker.datatype.boolean({ probability })`, `faker.date.between`, `faker.number.int`.

---

## 6. Anatomy of a process

**Path:** `src/backend/src/prisma/seed/<entity>.process.ts`

```ts
import { Sponsor } from '@prisma/client';
import { SeedProcess } from '../processes/seed-process.js';
import { OrganizationOutput, OrganizationProcess } from './organization.process.js';
import { UsersOutput, UsersProcess } from './user.process.js';
import { SPONSOR_COUNT, sponsorCreateInput } from '../factories/sponsor.factory.js';

// Input = intersection of every dependency's output type.
type SponsorInput = OrganizationOutput & UsersOutput;

// Output = what downstream processes may consume. Exported.
export type SponsorOutput = {
  sponsors: Sponsor[];
};

export class SponsorProcess extends SeedProcess<SponsorInput, SponsorOutput> {
  dependencies() {
    return [OrganizationProcess, UsersProcess]; // constructors, not instances
  }

  async run({ organization, members }: SponsorInput): Promise<SponsorOutput> {
    const { organizationId } = organization;

    const sponsors = await Promise.all(
      Array.from({ length: SPONSOR_COUNT }, () =>
        this.prisma.sponsor.create({
          data: sponsorCreateInput(organizationId /* ... */)
        })
      )
    );

    return { sponsors };
  }
}
```

The base class gives you exactly two things:

```ts
export abstract class SeedProcess<TInput, TOutput> {
  public faker: Faker; // pre-seeded by the runner
  public prisma!: PrismaClient; // injected by the runner
  abstract dependencies(): SeedProcessConstructor<any, any>[];
  abstract run(deps: TInput): Promise<TOutput>;
}
```

### Process rules

- **Always supply both generics.** `SeedProcess<SponsorInput, SponsorOutput>` — untyped generics defeat the whole design.
- **`dependencies()` returns constructors**, e.g. `[OrganizationProcess]`, never `new OrganizationProcess()`.
- **`TInput` must be the intersection of the dependency output types**, otherwise destructuring in `run()` won't type-check.
- **Export the `Output` type** so downstream processes can build their own input types from it.
- **Output keys are globally unique** across the whole run. If another process already exports `tasks`, name yours `sponsorTasks`, or the runner throws at merge time.
- **Use `this.prisma`**, never the shared `prisma.ts` singleton.
- **Use `this.faker`**, never a new `Faker` and never `Math.random()`.
- **Counts come from `seedConfig`**, either directly (`seedConfig.project.projectsPerCar`) or through a factory constant that reads it (`SPONSOR_COUNT`). Never a literal in the process.
- **Validate config minimums that are invariants.** `TeamProcess` checks its member pool against `seedConfig.team.membersPerTeam.min` and throws quoting both the configured minimum and what it actually found — so a bad config edit produces a readable error instead of a foreign-key failure twelve processes later.
- **Plan, then write.** The larger processes (sponsors, change requests) build plain "planned" objects first, then write them in batches. This keeps random-value generation in one deterministic pass and the DB writes in another — easier to read and to batch.
- **Batch large parallel writes.** `Promise.all` over 25 records is fine; over thousands it will exhaust the connection pool. `SponsorProcess` chunks writes at 8 at a time (`SPONSOR_CONCURRENCY`) — copy that pattern for anything large.
- **Fail loudly.** Throw a descriptive error when an invariant is violated (`throw new Error('SponsorProcess requires at least one user for task assignment.')`). The runner surfaces the first failure and aborts.

---

## 7. Registering the process

Add the import and one `new XProcess()` to `src/backend/src/prisma/seed.ts`:

```ts
import { SponsorProcess } from './seed/sponsor.process.js';

await new SeedRunner()
  .withPrisma(prisma)
  .register(
    new OrganizationProcess(),
    // ...
    new SponsorProcess()
  )
  .run();
```

Registration order does not control execution order — the runner topologically schedules on `dependencies()`. Keeping the list roughly in dependency order is only a readability convention. A process that is written but never registered simply never runs; a process that depends on an unregistered one throws.

---

## 8. Current process graph

| Process | Depends on | Config slice |
| --- | --- | --- |
| `OrganizationProcess` | — (root: bootstrap user + organization) | — |
| `CarProcess` | Organization | `car` |
| `UsersProcess` | Organization | `user` |
| `ConfigDataProcess` | Organization, Users | — |
| `TeamProcess` | Organization, Users, ConfigData | `team` |
| `TeamJoinRequestProcess` | Organization, Users, Team | — |
| `SchedulingProcess` | Organization, Users, TeamJoinRequest | — |
| `ShopProcess` | Organization, Users | — |
| `SponsorProcess` | Organization, Users, TeamJoinRequest | `sponsor` |
| `OrganizationContentProcess` | Organization, Users, ConfigData | `organizationContent` |
| `GraphProcess` | Organization, Users, Car | `graph` |
| `ProjectProcess` | Organization, Car, Users, Team, ConfigData | `project` |
| `WorkPackageProcess` | Organization, Users, Project | `workPackage` |
| `DescriptionBulletProcess` | Organization, ConfigData, WorkPackage | `descriptionBullet` |
| `TaskProcess` | Organization, Users, WorkPackage, TeamJoinRequest | `task` |
| `PartProcess` | Organization, Users, WorkPackage, TeamJoinRequest | `part` |
| `BOMProcess` | Organization, Users, ConfigData, WorkPackage, Car | — |
| `EventProcess` | Organization, Users, ConfigData, Team, TeamJoinRequest, Car, Project | — |
| `ChangeRequestProcess` | Organization, Project, Users, WorkPackage, ConfigData, Team, TeamJoinRequest, DescriptionBullet | `changeRequest` |
| `ReimbursementRequestProcess` | Organization, Users, ConfigData, Team, TeamJoinRequest, Car, WorkPackage, BOM | `reimbursementRequest` |

Roughly: `Organization` → (`Users`, `Car`) → `ConfigData` → `Team` → `TeamJoinRequest` → `Project` → `WorkPackage` → everything else.

`TeamJoinRequestProcess` promotes some guests to members, so every process that picks assignees from the `members` pool depends on it — not for data it exports, but to guarantee those promotions have landed first. Each of those `dependencies()` arrays carries a comment saying so; keep it when you add another.

Volumes are all in `seed-config.json`. At the committed defaults: **350** users (50% guests, 35% members, 10% leadership, 4% heads, remainder admins, plus the bootstrap App Admin), **5** cars, **5** projects per car, 25 sponsors and 25 prospective sponsors.

---

## 9. Adding data for a new entity

The procedure below is what the `seed-process` skill follows. For an entity named `foo-bar`:

| Thing | Name |
| --- | --- |
| Factory file | `factories/foo-bar.factory.ts` |
| Process file | `seed/foo-bar.process.ts` |
| Config key | `fooBar` (in `SeedConfig` and `seed-config.json`) |
| Create-input builder | `fooBarCreateInput` |
| Process class | `FooBarProcess` |
| Input type | `FooBarInput` (not exported) |
| Output type | `FooBarOutput` (exported) |

### Step 0 — Migrate first

Add the model to `schema.prisma`, run `yarn prisma:migrate:dev`, then `yarn prisma:generate`. Nothing below type-checks until the Prisma client knows about the model.

### Step 1 — Read context

Before writing any files:

1. Read `processes/seed-process.ts` to confirm the `SeedProcess` base class API.
2. Read `seed.ts` to see registered processes and their import pattern.
3. Read `context.ts` to understand existing output/context types.
4. Read `seed-config.ts` (the `SeedConfig` interface and helper types) and `seed-config.json` (the values).
5. Scan existing factories and processes for one or two that are closest to the new entity, so you can mirror their style.

### Step 2 — Resolve the open questions

Determine, from the schema and surrounding code where possible, and ask otherwise:

- Which existing processes does the new process depend on? (e.g. `OrganizationProcess`, `UsersProcess`)
- What fields does the entity have that need to be faked? (ids, names, dates, enums)
- How many records should be seeded, and is the count fixed, a range, or a weighted distribution? This becomes the config slice.
- If the process picks assignees from the `members` pool, it also needs `TeamJoinRequestProcess` as a dependency (see §8).

### Step 3 — Add the config slice

Volume knobs are configuration, not code. Add them in **both** files, in the same edit:

1. `seed-config.ts` — add a slice to the `SeedConfig` interface, keyed by the camelCase entity name:

```ts
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

2. `seed-config.json` — add the matching values under the same key.

Rules:

- The JSON is cast, not validated (see §4 Gotchas). A key in the interface with no entry in the JSON is `undefined` at runtime. **Never edit one file without the other.**
- Reuse the existing helper types — `NumberRange`, `WeightedValue<T>`, `WeightedCount` — instead of inventing new shapes.
- Only volume knobs go in the config: counts, per-parent counts, count distributions. Probabilities, write-concurrency constants, and fixture tables stay in the factory.
- Keep counts low enough that the default `yarn prisma:reset` stays fast. Add a comment in `seed-config.ts` if a value is deliberately lower than realistic (see `project.projectsPerCar`).

### Step 4 — Write the factory

Path: `factories/foo-bar.factory.ts`. Follow §5 and its rules exactly.

```ts
import { Prisma } from '@prisma/client';
import { Faker } from '@faker-js/faker';
import { seedConfig } from '../seed-config.js';

// Counts come from seed-config, never hardcoded here.
export const FOO_BAR_COUNT = seedConfig.fooBar.fooBarCount;

// Probabilities and fixtures stay local to the factory.
export const FOO_BAR_ACTIVE_CHANCE = 0.85;

// One exported function per meaningful creation variant.
// Always accept (faker: Faker, organizationId: string, ...extras) as the first params.
// Keep functions pure — no prisma calls inside factories.
export const fooBarCreateInput = (
  faker: Faker,
  organizationId: string
  // add extra params as needed
): Prisma.FooBarCreateInput => ({
  // populate fields using faker
});
```

For the `WeightedCount` shape, copy the resolve-then-weight map from the nearest of `change-request.factory.ts`, `parts.factory.ts`, or `tasks.factory.ts` rather than inventing a different spelling:

```ts
export const fooBarCountForProject = (faker: Faker): number =>
  faker.helpers.weightedArrayElement(
    seedConfig.fooBar.countForProject.map((option) => ({
      weight: option.weight,
      value: 'value' in option ? option.value : faker.number.int({ min: option.min, max: option.max })
    }))
  );
```

### Step 5 — Write the process

Path: `seed/foo-bar.process.ts`. Follow §6 and its rules exactly.

```ts
import { SeedProcess } from '../processes/seed-process.js';
import { OrganizationProcess, OrganizationOutput } from './organization.process.js';
import { fooBarCreateInput } from '../factories/foo-bar.factory.js';
import { seedConfig } from '../seed-config.js';
// import other dependency processes and their output types

// Destructure the process's config slice at module scope when it is used repeatedly.
const { fooBarCount } = seedConfig.fooBar;

// Combine dependency output types with intersection (&)
type FooBarInput = OrganizationOutput /* & OtherOutput */;

export type FooBarOutput = {
  fooBars: FooBar[]; // use the appropriate Prisma type
};

export class FooBarProcess extends SeedProcess<FooBarInput, FooBarOutput> {
  dependencies() {
    // Constructors (not instances) of every process this one depends on.
    // The runner merges all dependency outputs and passes them to run().
    return [OrganizationProcess /* , OtherProcess */];
  }

  async run({ organization /* , other dep fields */ }: FooBarInput): Promise<FooBarOutput> {
    const { organizationId } = organization;

    // this.prisma for DB calls; this.faker for randomness (already seeded by the runner).
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

When a config minimum is an invariant, validate it and throw a message that quotes the configured value, so a bad config edit produces a readable error.

### Step 6 — Register in seed.ts

Add the import and `new FooBarProcess()` inside `.register(...)`, after its dependencies. See §7 — order is a readability convention, not execution order.

### Step 7 — Verify

1. `yarn prisma:reset:force`, then eyeball the data in `yarn prisma:studio` or the running app.
2. **Sanity-check the knob.** Bump your config value, re-seed, confirm the row count moves with it — then revert to the committed default.
3. `yarn lint && yarn prettier-check && yarn tsc-check`.

Then summarize: files created or modified (including both `seed-config` files), the process class and its dependencies, the config keys added, and anything left for the reader to customize.

---

## 10. Troubleshooting

| Error / symptom | Cause and fix |
| --- | --- |
| `Duplicate process registered: X` | Same class registered twice in `seed.ts`. |
| `Process X depends on Y, which was not registered.` | Add `new Y()` to `.register(...)`. |
| `Dependency cycle detected: A → B → A` | Two processes depend on each other. Split the shared piece into a third process, or fold one into the other. |
| `Duplicate seed output keys from X: tasks` | Two processes export the same output key. Rename yours to something entity-specific. |
| `Missing output for dependency: Y` | `dependencies()` and the `TInput` type disagree — usually a dependency added to the type but not the array. |
| `Seed could not complete. Unreachable processes: …` | A process's dependencies never completed, typically after another failure. Read the first error in the log. |
| `Cannot find module '../factories/foo.factory'` | Missing `.js` extension on a local import (ESM). |
| Connection pool timeouts / very slow process | Too many concurrent writes. Chunk your `Promise.all` (see `SPONSOR_CONCURRENCY`), or lower `.withMaxConcurrency(...)`. |
| Data changed without a code change to the entity | You renamed a process class (changes its derived seed), edited `seed-config.json`, or the process uses `new Date()` for relative dates. |
| Foreign-key violation on a connect | You're connecting to a record owned by a process you didn't declare as a dependency, so it may not exist yet. |
| `Cannot read properties of undefined (reading 'min' / 'weight' / 'length')` in a factory | A `SeedConfig` key has no matching entry in `seed-config.json`. The JSON is cast, not validated, so the type-checker won't catch it. |
| `weightedArrayElement` throws, or always returns the same value | An empty or malformed weights array in the JSON — check for a missing `weight`, or `min`/`max` misspelled on a `WeightedCount` bucket. |
| `TeamProcess requires at least N member candidates, but only found M` | `user.totalUsers` is too low to fill one team. Raise `totalUsers` or lower `team.membersPerTeam.min`. |
| `Not enough unique lead candidates (N) for M teams` | `teams × team.leadsPerTeam.min` exceeds the heads + admins + leadership pool. Raise `totalUsers` or lower `leadsPerTeam.min`. |
| Seed suddenly takes minutes | Someone committed a bumped config value. Check `git diff` on `seed-config.json`. |

---

## 11. Related files

- Entry point — `src/backend/src/prisma/seed.ts`
- Config values — `src/backend/src/prisma/seed-config.json`
- Config types + loader — `src/backend/src/prisma/seed-config.ts`
- Base class — `src/backend/src/prisma/processes/seed-process.ts`
- Runner — `src/backend/src/prisma/processes/seed-runner.ts`
- Shared context types — `src/backend/src/prisma/context.ts`
- Prisma seed wiring — `src/backend/prisma.config.ts`
- Ad-hoc DB scripts (not seeding) — `src/backend/src/prisma/manual.ts`, run with `yarn prisma:manual`
