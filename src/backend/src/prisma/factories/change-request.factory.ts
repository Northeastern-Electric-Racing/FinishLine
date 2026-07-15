import { Faker } from '@faker-js/faker';
import { CR_Type, Prisma } from '@prisma/client';
import { DateRange } from '../context.js';
import { clampDate, daysBetween } from '../dates.js';
import { addDaysToDate } from 'shared';

export type SeedCrParent = {
  wbsElementId: string;
  timeline: DateRange;
  leadId?: string;
  managerId?: string;
};

export type SeedCrOverrides = Partial<Prisma.Change_RequestCreateInput>;
export const WORK_PACKAGE_CR_TYPES: CR_Type[] = [CR_Type.ACTIVATION, CR_Type.STAGE_GATE];
export const PROJECT_CR_TYPES: CR_Type[] = [CR_Type.STANDARD, CR_Type.BUDGET, CR_Type.LEADERSHIP];

type ReviewOutcome = 'APPROVED' | 'DENIED' | 'PENDING';

const STANDARD_WHY = [
  'Initial change request',
  'Scope adjustment after design review',
  'Updating the timeline to reflect current progress',
  'Reassigning ownership after a lead change',
  'Correcting budget to match the latest quote',
  'Adding deliverables identified during research',
  'Pulling in schedule after blocker was resolved',
  'Documentation cleanup and status update'
];

const BUDGET_WHY = [
  'Requesting additional budget for consumables',
  'Budget increase to cover competition costs',
  'Reallocating funds after a quote came in higher',
  'Additional budget needed for tools and equipment'
];

const APPROVED_NOTES = ['LGTM', 'Approved!', 'Looks good to me!', 'Approved, nice work', 'LGTM!', 'Good to go'];
const DENIED_NOTES = [
  'Needs more detail before this can be approved',
  'Please revise the scope and resubmit',
  'Budget is too high, tighten this up',
  'Talk to the project lead before resubmitting',
  'Not ready yet'
];

const CHANGE_DETAILS = [
  'New Project Created',
  'New Work Package Created',
  'Changed budget from "0" to "3500"',
  'Added manager',
  'Changed Project Lead',
  'Added new Deliverables',
  'Changed start date',
  'Changed duration',
  'Updated status'
];

const crTypeForParent = (faker: Faker, isWorkPackage: boolean): CR_Type => {
  if (isWorkPackage) {
    return faker.helpers.weightedArrayElement([
      { weight: 51, value: CR_Type.ACTIVATION },
      { weight: 49, value: CR_Type.STAGE_GATE }
    ]);
  }

  return faker.helpers.weightedArrayElement([
    { weight: 94, value: CR_Type.STANDARD },
    { weight: 3, value: CR_Type.BUDGET },
    { weight: 3, value: CR_Type.LEADERSHIP }
  ]);
};

const reviewOutcome = (faker: Faker): ReviewOutcome =>
  faker.helpers.weightedArrayElement([
    { weight: 57, value: 'APPROVED' as const },
    { weight: 39, value: 'PENDING' as const },
    { weight: 4, value: 'DENIED' as const }
  ]);

const subtypeCreateInput = (
  faker: Faker,
  type: CR_Type,
  parent: SeedCrParent,
  submittedDate: Date
): Pick<
  Prisma.Change_RequestCreateInput,
  'budgetChangeRequest' | 'stageGateChangeRequest' | 'activationChangeRequest' | 'leadershipChangeRequest'
> => {
  const { leadId, managerId } = parent;

  switch (type) {
    case CR_Type.BUDGET:
      return {
        budgetChangeRequest: {
          create: { proposedBudget: faker.helpers.arrayElement([500, 1000, 1500, 2000, 2500, 5000]) }
        }
      };
    case CR_Type.STAGE_GATE:
      return {
        stageGateChangeRequest: {
          create: { leftoverBudget: 0, confirmDone: true }
        }
      };
    case CR_Type.ACTIVATION:
      if (!leadId || !managerId) {
        throw new Error('Activation change request requires a lead and manager on the parent work package.');
      }
      return {
        activationChangeRequest: {
          create: {
            startDate: submittedDate,
            confirmDetails: true,
            lead: { connect: { userId: leadId } },
            manager: { connect: { userId: managerId } }
          }
        }
      };
    case CR_Type.LEADERSHIP:
      return {
        leadershipChangeRequest: {
          create: {
            ...(leadId ? { lead: { connect: { userId: leadId } } } : {}),
            ...(managerId ? { manager: { connect: { userId: managerId } } } : {})
          }
        }
      };
    case CR_Type.STANDARD:
    default:
      return {};
  }
};

const changesCreateInput = (
  faker: Faker,
  implementerId: string,
  link: { wbsElementId: string } | { categoryId: string }
): Prisma.ChangeCreateWithoutChangeRequestInput[] => {
  const count = faker.number.int({ min: 1, max: 4 });

  return Array.from({ length: count }, () => ({
    detail: faker.helpers.arrayElement(CHANGE_DETAILS),
    implementer: { connect: { userId: implementerId } },
    ...('wbsElementId' in link
      ? { wbsElement: { connect: { wbsElementId: link.wbsElementId } } }
      : { category: { connect: { otherReimbursementProductReasonId: link.categoryId } } })
  }));
};

export const crCountForProject = (faker: Faker): number =>
  faker.helpers.weightedArrayElement([
    { weight: 15, value: 0 },
    { weight: 45, value: faker.number.int({ min: 1, max: 3 }) },
    { weight: 30, value: faker.number.int({ min: 4, max: 8 }) },
    { weight: 10, value: faker.number.int({ min: 9, max: 15 }) }
  ]);

export const crCountForWorkPackage = (faker: Faker): number =>
  faker.helpers.weightedArrayElement([
    { weight: 20, value: 0 },
    { weight: 55, value: 1 },
    { weight: 20, value: 2 },
    { weight: 5, value: 3 }
  ]);

export const createSeedChangeRequest = (
  faker: Faker,
  parent: SeedCrParent,
  isWorkPackage: boolean,
  identifier: number,
  organizationId: string,
  submitterId: string,
  reviewerId: string,
  budgetReasonId: string | undefined,
  overrides: SeedCrOverrides = {}
): Prisma.Change_RequestCreateInput => {
  const { timeline, wbsElementId } = parent;
  const type = crTypeForParent(faker, isWorkPackage);

  const useCategory = type === CR_Type.BUDGET && budgetReasonId !== undefined;
  const baseLink = useCategory
    ? { category: { connect: { otherReimbursementProductReasonId: budgetReasonId as string } } }
    : { wbsElement: { connect: { wbsElementId } } };
  const changeLink = useCategory ? { categoryId: budgetReasonId as string } : { wbsElementId };

  const dateSubmitted = clampDate(
    addDaysToDate(new Date(timeline.start), faker.number.int({ min: 0, max: daysBetween(timeline) })),
    { start: timeline.start, end: timeline.end }
  );

  const outcome = reviewOutcome(faker);
  const reviewed = outcome !== 'PENDING';
  const accepted = outcome === 'APPROVED';

  const dateReviewed = reviewed
    ? clampDate(addDaysToDate(dateSubmitted, faker.number.int({ min: 1, max: 10 })), {
        start: dateSubmitted,
        end: timeline.end
      })
    : undefined;

  return {
    identifier,
    type,
    dateSubmitted,
    why: type === CR_Type.BUDGET ? faker.helpers.arrayElement(BUDGET_WHY) : faker.helpers.arrayElement(STANDARD_WHY),
    organization: { connect: { organizationId } },
    submitter: { connect: { userId: submitterId } },
    ...baseLink,
    ...subtypeCreateInput(faker, type, parent, dateSubmitted),
    ...(reviewed
      ? {
          reviewer: { connect: { userId: reviewerId } },
          dateReviewed,
          accepted,
          reviewNotes: accepted ? faker.helpers.arrayElement(APPROVED_NOTES) : faker.helpers.arrayElement(DENIED_NOTES),

          ...(accepted ? { changes: { create: changesCreateInput(faker, reviewerId, changeLink) } } : {})
        }
      : {}),
    ...overrides
  };
};
