/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

/**
 * The seed generates a lot of data relative to "now" -- project timelines, work package and task
 * statuses, change request submission windows. Reading the real clock for that makes the whole
 * dataset a function of the moment it was generated, which is what made the system tests flaky:
 * `shouldExist` in project.factory.ts short-circuits on past start dates *without* consuming a
 * faker draw, so as start dates drift past the current time the draw count shifts and every
 * downstream assignment (project lead, manager, teams) reshuffles. Identical code produced
 * different data on every CI run, and roughly one day in seven left Thomas Emrax with nothing to
 * show under "Projects I'm Leading".
 *
 * So nothing under src/prisma reads `new Date()` directly. Processes use `this.now`, factories
 * take a `now` argument, and both trace back to here.
 */
export const SEED_REFERENCE_DATE = new Date('2026-06-15T12:00:00.000Z');

/**
 * Resolves the instant the seed should treat as "now". Set SEED_NOW (any string `Date` can parse)
 * to generate data relative to a different moment -- useful for producing fresher-looking dev data
 * without touching the pinned default that CI depends on.
 */
export const resolveSeedNow = (): Date => {
  const override = process.env.SEED_NOW;

  if (!override) return new Date(SEED_REFERENCE_DATE);

  const parsed = new Date(override);

  if (Number.isNaN(parsed.getTime())) {
    throw new Error(`SEED_NOW is not a date Date can parse: "${override}"`);
  }

  return parsed;
};

/**
 * The real wall clock -- the deliberate exception to the rule above.
 *
 * A few endpoints filter relative to the real clock no matter when the data was seeded:
 * `getApprovedChangeRequests` only returns change requests reviewed in the last five days, so a
 * review timestamp anchored to SEED_REFERENCE_DATE falls outside that window and the section
 * renders empty. Timestamps like that have to stay real-clock-relative.
 *
 * This is safe precisely because such values are written straight onto a record: they consume no
 * faker draws and don't decide what gets created, so they can't shift the generated dataset the
 * way reading the clock in `shouldExist` did. Only use it for that -- never to decide whether or
 * how much of something to generate.
 */
export const realNow = (): Date => new Date();
