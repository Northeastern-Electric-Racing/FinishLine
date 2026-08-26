import { Faker } from '@faker-js/faker';
import { Prisma } from '@prisma/client';
import { addDaysToDate } from 'shared';
import { DateRange } from '../context.js';
import { clampDate } from '../dates.js';
import { seedConfig } from '../seed-config.js';

const SUFFIX_CHANCE = 0.5;
const MAX_DATE_ADDED_OFFSET_DAYS = 14;

const BULLET_VERBS = [
  'Design',
  'Research',
  'Validate',
  'Manufacture',
  'Test',
  'Install',
  'Review',
  'Document',
  'Analyze',
  'Fabricate',
  'Complete',
  'Verify',
  'Finalize',
  'Assemble',
  'Inspect'
];

const BULLET_SUFFIXES = [
  'confluence page',
  'FEA',
  'design review',
  'drawings',
  'CAD model',
  'BOM',
  'sign off',
  'and validate',
  'with FEA',
  'manufacturing plan',
  'test report',
  'specifications'
];

export const generateDescriptionBulletCount = (faker: Faker): number =>
  faker.helpers.weightedArrayElement(seedConfig.descriptionBullet.countWeights);

export const generateDescriptionBulletText = (faker: Faker, wbsElementName: string): string => {
  const verb = faker.helpers.arrayElement(BULLET_VERBS);

  const suffix = faker.helpers.maybe(() => faker.helpers.arrayElement(BULLET_SUFFIXES), {
    probability: SUFFIX_CHANCE
  });

  return suffix ? `${verb} ${wbsElementName} ${suffix}` : `${verb} ${wbsElementName}`;
};

/**
 * Expected activities are defined when a WBS element is set up, so this lands near the start of
 * its timeline rather than spread uniformly across it - never later than `now`, and never later
 * than the WBS element's own timeline end.
 */
export const generateDescriptionBulletDateAdded = (faker: Faker, timeline: DateRange, now: Date): Date => {
  const end = clampDate(
    addDaysToDate(
      timeline.start,
      faker.number.int({
        min: 0,
        max: MAX_DATE_ADDED_OFFSET_DAYS
      })
    ),
    timeline
  );

  return end > now ? now : end;
};

export const descriptionBulletCreateInput = (
  detail: string,
  descriptionBulletTypeId: string,
  wbsElementId: string,
  dateAdded: Date
): Prisma.Description_BulletCreateInput => ({
  detail,
  dateAdded,
  descriptionBulletType: {
    connect: { id: descriptionBulletTypeId }
  },
  wbsElement: {
    connect: { wbsElementId }
  }
});
