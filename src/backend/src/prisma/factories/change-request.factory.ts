import { Faker } from '@faker-js/faker';
import { Account_Code, CR_Type, WBS_Element_Status, Work_Package_Stage, Prisma } from '@prisma/client';
import { DateRange } from '../context.js';
import { clampDate, daysBetween } from '../dates.js';
import { addDaysToDate } from 'shared';
import { seedConfig } from '../seed-config.js';

export type SeedProposalBullet = { detail: string; descriptionBulletTypeId: string };
export type SeedProposalLink = { url: string; linkTypeId: string };

export type SeedCrParent = {
  wbsElementId: string;
  timeline: DateRange;
  leadId?: string;
  managerId?: string;
  name: string;
  status: WBS_Element_Status;
  descriptionBullets: SeedProposalBullet[];
  links: SeedProposalLink[];
  project?: { budget: number; summary: string; teamIds: string[] };
  workPackage?: { startDate: Date; duration: number; stage: Work_Package_Stage | null; blockedByWbsElementIds: string[] };
};

export type SeedCrActor = { userId: string };

type ReviewOutcome = 'APPROVED' | 'DENIED' | 'PENDING';

export type SeedCrOverrides = Partial<Prisma.Change_RequestCreateInput>;
export const WORK_PACKAGE_CR_TYPES: CR_Type[] = [CR_Type.ACTIVATION, CR_Type.STAGE_GATE];
export const PROJECT_CR_TYPES: CR_Type[] = [CR_Type.STANDARD, CR_Type.LEADERSHIP];

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

const NAME_REVISION_SUFFIXES = [' v2', ' (Updated)', ' - Rev B', ' (Revised)'];

const PROPOSED_SUMMARIES = [
  'Updated scope to reflect current progress',
  'Clarified deliverables based on team feedback',
  'Revised summary after design review',
  'Refined project scope and goals'
];

const BUDGET_DELTAS = [-1000, -500, -250, 250, 500, 1000, 1500];

const WORK_PACKAGE_STAGES: Work_Package_Stage[] = [
  Work_Package_Stage.RESEARCH,
  Work_Package_Stage.DESIGN,
  Work_Package_Stage.MANUFACTURING,
  Work_Package_Stage.INSTALL,
  Work_Package_Stage.TESTING
];

const maybeReviseName = (faker: Faker, currentName: string): string =>
  faker.datatype.boolean({ probability: 0.25 })
    ? `${currentName}${faker.helpers.arrayElement(NAME_REVISION_SUFFIXES)}`
    : currentName;

const maybeAdjustBudget = (faker: Faker, currentBudget: number): number =>
  faker.datatype.boolean({ probability: 0.4 })
    ? Math.max(0, currentBudget + faker.helpers.arrayElement(BUDGET_DELTAS))
    : currentBudget;

const maybeReviseSummary = (faker: Faker, currentSummary: string): string =>
  faker.datatype.boolean({ probability: 0.3 }) ? faker.helpers.arrayElement(PROPOSED_SUMMARIES) : currentSummary;

const maybeChangeStage = (faker: Faker, currentStage: Work_Package_Stage | null): Work_Package_Stage | null =>
  faker.datatype.boolean({ probability: 0.3 }) ? faker.helpers.arrayElement(WORK_PACKAGE_STAGES) : currentStage;

/**
 * Builds a real Wbs_Proposed_Changes (+ Project_Proposed_Changes / Work_Package_Proposed_Changes) record
 * for a STANDARD change request editing an existing project or work package. Description bullets and
 * links are copied through unchanged so an accepted CR never implies bullets/links were wiped out -
 * this seed only applies the fields it actually varies (name/lead/manager/budget/summary/stage).
 */
const buildStandardProposedChanges = (
  faker: Faker,
  parent: SeedCrParent,
  submitterId: string,
  ownerCandidates: SeedCrActor[]
): Pick<Prisma.Change_RequestCreateInput, 'wbsProposedChanges'> => {
  const keepSameActors = ownerCandidates.length === 0 || faker.datatype.boolean({ probability: 0.7 });

  const leadId = keepSameActors
    ? parent.leadId
    : pickDifferentActor(
        faker,
        ownerCandidates,
        [parent.leadId, parent.managerId].filter((id): id is string => id !== undefined)
      );

  const managerId =
    keepSameActors && leadId !== parent.managerId
      ? parent.managerId
      : pickDifferentActor(
          faker,
          ownerCandidates,
          [parent.leadId, parent.managerId, leadId].filter((id): id is string => id !== undefined)
        );

  const baseWbsProposal = {
    name: maybeReviseName(faker, parent.name),
    status: parent.status,
    ...(leadId ? { lead: { connect: { userId: leadId } } } : {}),
    ...(managerId ? { manager: { connect: { userId: managerId } } } : {}),
    links: {
      create: parent.links.map((link) => ({
        url: link.url,
        linkType: { connect: { id: link.linkTypeId } },
        creator: { connect: { userId: submitterId } }
      }))
    },
    proposedDescriptionBulletChanges: {
      create: parent.descriptionBullets.map((bullet) => ({
        detail: bullet.detail,
        descriptionBulletType: { connect: { id: bullet.descriptionBulletTypeId } }
      }))
    }
  };

  if (parent.project) {
    return {
      wbsProposedChanges: {
        create: {
          ...baseWbsProposal,
          projectProposedChanges: {
            create: {
              budget: maybeAdjustBudget(faker, parent.project.budget),
              summary: maybeReviseSummary(faker, parent.project.summary),
              teams: { connect: parent.project.teamIds.map((teamId) => ({ teamId })) }
            }
          }
        }
      }
    };
  }

  if (parent.workPackage) {
    return {
      wbsProposedChanges: {
        create: {
          ...baseWbsProposal,
          workPackageProposedChanges: {
            create: {
              startDate: parent.workPackage.startDate,
              duration: parent.workPackage.duration,
              stage: maybeChangeStage(faker, parent.workPackage.stage),
              blockedBy: { connect: parent.workPackage.blockedByWbsElementIds.map((wbsElementId) => ({ wbsElementId })) }
            }
          }
        }
      }
    };
  }

  throw new Error('Standard change request parent must be a project or a work package.');
};

type CrLink = { kind: 'wbs'; wbsElementId: string } | { kind: 'accountCode'; accountCodeId: string };

const AUTO_ACCEPTED_TYPES: CR_Type[] = [CR_Type.ACTIVATION, CR_Type.STAGE_GATE, CR_Type.LEADERSHIP];

const isAutoAccepted = (type: CR_Type): boolean => AUTO_ACCEPTED_TYPES.includes(type);

const crTypeForParent = (faker: Faker, isWorkPackage: boolean): CR_Type => {
  if (isWorkPackage) {
    return faker.helpers.weightedArrayElement([
      { weight: 45, value: CR_Type.ACTIVATION },
      { weight: 40, value: CR_Type.STAGE_GATE },
      { weight: 15, value: CR_Type.STANDARD }
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
  ownerCandidates: SeedCrActor[],
  submitterId: string
): Pick<
  Prisma.Change_RequestCreateInput,
  | 'budgetChangeRequest'
  | 'stageGateChangeRequest'
  | 'activationChangeRequest'
  | 'leadershipChangeRequest'
  | 'wbsProposedChanges'
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
    case CR_Type.STANDARD: {
      if (!parent) {
        throw new Error('Standard change request requires a parent WBS element.');
      }
      return buildStandardProposedChanges(faker, parent, submitterId, ownerCandidates);
    }
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

const weightedCount = (faker: Faker, options: typeof seedConfig.changeRequest.projectCountWeights): number =>
  faker.helpers.weightedArrayElement(
    options.map((option) => ({
      weight: option.weight,
      value:
        'value' in option
          ? option.value
          : faker.number.int({
              min: option.min,
              max: option.max
            })
    }))
  );

export const crCountForProject = (faker: Faker): number =>
  weightedCount(faker, seedConfig.changeRequest.projectCountWeights);

export const crCountForWorkPackage = (faker: Faker): number =>
  faker.helpers.weightedArrayElement(seedConfig.changeRequest.workPackageCountWeights);

export const crCountForAccountCode = (faker: Faker): number =>
  weightedCount(faker, seedConfig.changeRequest.accountCodeCountWeights);

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
    ...subtypeCreateInput(faker, type, parent, dateSubmitted, ownerCandidates, submitterId),
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

    return index === lastReviewableIndex ? latestOutcome(faker) : resolvedOutcome(faker);
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
