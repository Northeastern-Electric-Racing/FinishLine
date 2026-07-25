import { Faker } from '@faker-js/faker';
import { Account_Code, CR_Type, Prisma } from '@prisma/client';
import { DateRange } from '../context.js';
import { clampDate, daysBetween } from '../dates.js';
import { addDaysToDate } from 'shared';

export type SeedCrParent = {
  wbsElementId: string;
  timeline: DateRange;
  leadId?: string;
  managerId?: string;
};

export type SeedCrActor = { userId: string };

export type SeedCrOverrides = Partial<Prisma.Change_RequestCreateInput>;
export const WORK_PACKAGE_CR_TYPES: CR_Type[] = [CR_Type.ACTIVATION, CR_Type.STAGE_GATE];
export const PROJECT_CR_TYPES: CR_Type[] = [CR_Type.STANDARD, CR_Type.LEADERSHIP];

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

const BUDGET_AMOUNTS = [500, 1000, 1500, 2000, 2500, 5000];

type CrLink = { kind: 'wbs'; wbsElementId: string } | { kind: 'accountCode'; accountCodeId: string };

const AUTO_ACCEPTED_TYPES: CR_Type[] = [CR_Type.ACTIVATION, CR_Type.STAGE_GATE, CR_Type.LEADERSHIP];

const isAutoAccepted = (type: CR_Type): boolean => AUTO_ACCEPTED_TYPES.includes(type);

const crTypeForParent = (faker: Faker, isWorkPackage: boolean): CR_Type => {
  if (isWorkPackage) {
    return faker.helpers.weightedArrayElement([
      { weight: 51, value: CR_Type.ACTIVATION },
      { weight: 49, value: CR_Type.STAGE_GATE }
    ]);
  }

  return faker.helpers.weightedArrayElement([
    { weight: 97, value: CR_Type.STANDARD },
    { weight: 3, value: CR_Type.LEADERSHIP }
  ]);
};

const latestOutcome = (faker: Faker): ReviewOutcome =>
  faker.helpers.weightedArrayElement([
    { weight: 57, value: 'APPROVED' as const },
    { weight: 39, value: 'PENDING' as const },
    { weight: 4, value: 'DENIED' as const }
  ]);

const resolvedOutcome = (faker: Faker): ReviewOutcome =>
  faker.helpers.weightedArrayElement([
    { weight: 93, value: 'APPROVED' as const },
    { weight: 7, value: 'DENIED' as const }
  ]);

const pickDifferentActor = (faker: Faker, actors: SeedCrActor[], excludedIds: string[]): string => {
  const candidates = actors.filter(({ userId }) => !excludedIds.includes(userId));

  if (candidates.length === 0) {
    throw new Error('Change request requires an available replacement actor.');
  }

  return faker.helpers.arrayElement(candidates).userId;
};

const subtypeCreateInput = (
  faker: Faker,
  type: CR_Type,
  parent: SeedCrParent | undefined,
  submittedDate: Date,
  ownerCandidates: SeedCrActor[]
): Pick<
  Prisma.Change_RequestCreateInput,
  'budgetChangeRequest' | 'stageGateChangeRequest' | 'activationChangeRequest' | 'leadershipChangeRequest'
> => {
  switch (type) {
    case CR_Type.BUDGET:
      return {
        budgetChangeRequest: {
          create: { proposedBudget: faker.helpers.arrayElement(BUDGET_AMOUNTS) }
        }
      };
    case CR_Type.STAGE_GATE:
      return {
        stageGateChangeRequest: {
          create: { leftoverBudget: 0, confirmDone: true }
        }
      };
    case CR_Type.ACTIVATION: {
      const currentLeadId = parent?.leadId;
      const currentManagerId = parent?.managerId;

      if (!currentLeadId || !currentManagerId) {
        throw new Error('Activation change request requires a lead and manager on the parent work package.');
      }

      const leadId = pickDifferentActor(faker, ownerCandidates, [currentLeadId, currentManagerId]);
      const managerId = pickDifferentActor(faker, ownerCandidates, [currentLeadId, currentManagerId, leadId]);

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
    }
    case CR_Type.LEADERSHIP: {
      const currentLeadId = parent?.leadId;
      const currentManagerId = parent?.managerId;

      const leadId = pickDifferentActor(
        faker,
        ownerCandidates,
        [currentLeadId, currentManagerId].filter((id): id is string => id !== undefined)
      );

      const managerId = pickDifferentActor(
        faker,
        ownerCandidates,
        [currentLeadId, currentManagerId, leadId].filter((id): id is string => id !== undefined)
      );

      return {
        leadershipChangeRequest: {
          create: {
            lead: { connect: { userId: leadId } },
            manager: { connect: { userId: managerId } }
          }
        }
      };
    }
    case CR_Type.STANDARD:
    default:
      return {};
  }
};

const changesCreateInput = (
  faker: Faker,
  implementerId: string,
  link: CrLink,
  dateImplemented: Date
): Prisma.ChangeCreateWithoutChangeRequestInput[] => {
  const count = faker.number.int({ min: 1, max: 4 });

  return Array.from({ length: count }, () => ({
    detail: faker.helpers.arrayElement(CHANGE_DETAILS),
    dateImplemented,
    implementer: { connect: { userId: implementerId } },
    ...(link.kind === 'wbs'
      ? { wbsElement: { connect: { wbsElementId: link.wbsElementId } } }
      : { accountCode: { connect: { accountCodeId: link.accountCodeId } } })
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

export const crCountForAccountCode = (faker: Faker): number =>
  faker.helpers.weightedArrayElement([
    { weight: 40, value: 0 },
    { weight: 40, value: faker.number.int({ min: 1, max: 3 }) },
    { weight: 20, value: faker.number.int({ min: 4, max: 6 }) }
  ]);

type BuildChangeRequestArgs = {
  faker: Faker;
  identifier: number;
  organizationId: string;
  type: CR_Type;
  parent?: SeedCrParent;
  link: CrLink;
  submitterId: string;
  reviewerId: string;
  reviewerIsHeadOrAdmin: boolean;
  ownerCandidates?: SeedCrActor[];
  dateSubmitted: Date;
  outcome: ReviewOutcome;
  reviewWindowEnd: Date;
  overrides?: SeedCrOverrides;
};

const buildChangeRequest = ({
  faker,
  identifier,
  organizationId,
  type,
  parent,
  link,
  submitterId,
  reviewerId,
  reviewerIsHeadOrAdmin,
  ownerCandidates = [],
  dateSubmitted,
  outcome,
  reviewWindowEnd,
  overrides = {}
}: BuildChangeRequestArgs): Prisma.Change_RequestCreateInput => {
  const reviewed = outcome !== 'PENDING';
  const accepted = outcome === 'APPROVED';

  const dateReviewed = reviewed
    ? clampDate(addDaysToDate(dateSubmitted, faker.number.int({ min: 1, max: 10 })), {
        start: dateSubmitted,
        end: reviewWindowEnd
      })
    : undefined;

  const baseLink =
    link.kind === 'wbs'
      ? { wbsElement: { connect: { wbsElementId: link.wbsElementId } } }
      : { accountCode: { connect: { accountCodeId: link.accountCodeId } } };

  // reviewChangeRequest only allows a non-head/admin reviewer if they're a requested reviewer,
  // so it's mandatory whenever the reviewer doesn't satisfy isHead; otherwise it's an optional
  // field a submitter may or may not have set.
  const hasRequestedReviewer = !reviewerIsHeadOrAdmin || faker.datatype.boolean({ probability: 0.25 });

  return {
    identifier,
    type,
    dateSubmitted,
    why: type === CR_Type.BUDGET ? faker.helpers.arrayElement(BUDGET_WHY) : faker.helpers.arrayElement(STANDARD_WHY),
    organization: { connect: { organizationId } },
    submitter: { connect: { userId: submitterId } },
    ...(hasRequestedReviewer ? { requestedReviewers: { connect: { userId: reviewerId } } } : {}),
    ...baseLink,
    ...subtypeCreateInput(faker, type, parent, dateSubmitted, ownerCandidates),
    ...(reviewed
      ? {
          reviewer: { connect: { userId: reviewerId } },
          dateReviewed,
          accepted,
          reviewNotes: accepted ? faker.helpers.arrayElement(APPROVED_NOTES) : faker.helpers.arrayElement(DENIED_NOTES),
          ...(accepted
            ? {
                changes: {
                  create: changesCreateInput(faker, reviewerId, link, dateReviewed ?? dateSubmitted)
                }
              }
            : {})
        }
      : {}),
    ...overrides
  };
};

const outcomesForOrderedCrs = (faker: Faker, types: CR_Type[]): ReviewOutcome[] => {
  const lastReviewableIndex = types.reduce((last, type, index) => (isAutoAccepted(type) ? last : index), -1);

  return types.map((type, index) => {
    if (isAutoAccepted(type)) return 'APPROVED';

    const outcome = index === lastReviewableIndex ? latestOutcome(faker) : resolvedOutcome(faker);

    if (type === CR_Type.STANDARD && outcome === 'APPROVED') {
      return 'DENIED';
    }

    return outcome;
  });
};

const cappedWindow = (timeline: DateRange): DateRange => ({
  start: timeline.start,
  end: new Date(Math.min(timeline.end.getTime(), Date.now()))
});

const orderedSubmissionDates = (faker: Faker, window: DateRange, count: number): Date[] =>
  Array.from({ length: count }, () =>
    clampDate(addDaysToDate(new Date(window.start), faker.number.int({ min: 0, max: daysBetween(window) })), window)
  ).sort((a, b) => a.getTime() - b.getTime());

const pickActor = (faker: Faker, actors: SeedCrActor[]): string => faker.helpers.arrayElement(actors).userId;

export const buildWbsChangeRequests = (
  faker: Faker,
  parent: SeedCrParent,
  isWorkPackage: boolean,
  identifiers: number[],
  organizationId: string,
  submitters: SeedCrActor[],
  reviewers: SeedCrActor[],
  headOrAdminUserIds: Set<string>
): Prisma.Change_RequestCreateInput[] => {
  if (identifiers.length === 0) return [];

  const window = cappedWindow(parent.timeline);
  const dates = orderedSubmissionDates(faker, window, identifiers.length);
  const types = identifiers.map(() => crTypeForParent(faker, isWorkPackage));
  const outcomes = outcomesForOrderedCrs(faker, types);

  return identifiers.map((identifier, index) => {
    const submitterId = pickActor(faker, submitters);
    // A reviewer who isn't head/admin rank can't review their own change request, so the
    // reviewer must differ from the submitter whenever the pools overlap.
    const reviewerId = pickDifferentActor(faker, reviewers, [submitterId]);

    return buildChangeRequest({
      faker,
      identifier,
      organizationId,
      type: types[index],
      parent,
      link: { kind: 'wbs', wbsElementId: parent.wbsElementId },
      submitterId,
      reviewerId,
      reviewerIsHeadOrAdmin: headOrAdminUserIds.has(reviewerId),
      ownerCandidates: reviewers,
      dateSubmitted: dates[index],
      outcome: outcomes[index],
      reviewWindowEnd: window.end
    });
  });
};

export const buildAccountCodeChangeRequests = (
  faker: Faker,
  accountCode: Account_Code,
  timeline: DateRange,
  identifiers: number[],
  organizationId: string,
  submitters: SeedCrActor[],
  reviewers: SeedCrActor[],
  headOrAdminUserIds: Set<string>
): Prisma.Change_RequestCreateInput[] => {
  if (identifiers.length === 0) return [];

  const window = cappedWindow(timeline);
  const dates = orderedSubmissionDates(faker, window, identifiers.length);
  const types = identifiers.map(() => CR_Type.BUDGET);
  const outcomes = outcomesForOrderedCrs(faker, types);

  return identifiers.map((identifier, index) => {
    const submitterId = pickActor(faker, submitters);
    const reviewerId = pickDifferentActor(faker, reviewers, [submitterId]);

    return buildChangeRequest({
      faker,
      identifier,
      organizationId,
      type: CR_Type.BUDGET,
      link: { kind: 'accountCode', accountCodeId: accountCode.accountCodeId },
      submitterId,
      reviewerId,
      reviewerIsHeadOrAdmin: headOrAdminUserIds.has(reviewerId),
      dateSubmitted: dates[index],
      outcome: outcomes[index],
      reviewWindowEnd: window.end
    });
  });
};
