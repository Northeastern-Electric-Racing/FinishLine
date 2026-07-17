import { Faker } from '@faker-js/faker';
import { Account_Code, Index_Code, Material_Status, Prisma, Reimbursement_Status_Type } from '@prisma/client';
import { addDaysToDate } from 'shared';

// fraction of a past-year car's BOM items that get tied to a reimbursement request
export const PAST_YEAR_BOM_TIE_CHANCE = 0.6;
// fraction of the current-year car's BOM items that get tied to a reimbursement request
// (it's only halfway through its year, so fewer of its BOM items have been purchased yet)
export const CURRENT_YEAR_BOM_TIE_CHANCE = 0.3;
// of all reimbursement products generated, the fraction that should reference a BOM item
// vs. a general supply - the remainder (1 - this) are general supplies
export const BOM_PRODUCT_RATIO = 0.7;

export const ASSIGNEE_CHANCE = 0.75;
export const EXTRA_COMMENT_CHANCE = 0.15;
export const DELIVERY_CHANCE = 0.65;
export const REIMBURSEMENT_CHANCE_PER_RECIPIENT = 0.7;

const DENIED_CHANCE = 0.08;
const MIN_DAYS_PER_STAGE = 2;
const MAX_DAYS_PER_STAGE = 14;

const STAGE_ORDER: Reimbursement_Status_Type[] = [
  Reimbursement_Status_Type.PENDING_LEADERSHIP_APPROVAL,
  Reimbursement_Status_Type.LEADERSHIP_APPROVED,
  Reimbursement_Status_Type.PENDING_FINANCE,
  Reimbursement_Status_Type.PENDING_SABO_SUBMISSION,
  Reimbursement_Status_Type.SABO_SUBMITTED,
  Reimbursement_Status_Type.REIMBURSED
];

export const GENERAL_SUPPLY_PRODUCT_NAMES = [
  'Workshop Cleaning Supplies',
  'Safety Glasses',
  'Nitrile Gloves',
  'Zip Ties',
  'Duct Tape',
  'Shop Towels',
  'First Aid Supplies',
  'Whiteboard Markers',
  'Printer Paper',
  'Team Event Supplies',
  'Workshop Snacks',
  'Office Supplies',
  'Presentation Materials',
  'Recruitment Flyers',
  'Competition Travel Snacks',
  'Hand Tools Set',
  'Extension Cords',
  'Storage Bins',
  'Label Maker Tape',
  'Cleaning Solvents'
];

export type ReimbursementStatusStep = { type: Reimbursement_Status_Type; date: Date };

const INDEX_CODE_NAMES = ['CASH', 'BUDGET'] as const;

const ACCOUNT_CODE_NAMES_BY_INDEX_CODE: Record<(typeof INDEX_CODE_NAMES)[number], string[]> = {
  CASH: ['Subscriptions', 'Travel-Misc', 'Food', 'General Supplies/Tools'],
  BUDGET: [
    'Subscriptions',
    'Travel-Auto/Van Rental',
    'Travel-Misc',
    'Competition-Registration',
    'Food',
    'General Supplies/Tools'
  ]
};

export const chooseFundingSource = (
  faker: Faker,
  indexCodesByName: Record<string, Index_Code>,
  accountCodesByName: Record<string, Account_Code>
): { indexCode: Index_Code; accountCode: Account_Code } => {
  const indexCodeName = faker.helpers.arrayElement(INDEX_CODE_NAMES);
  const accountCodeName = faker.helpers.arrayElement(ACCOUNT_CODE_NAMES_BY_INDEX_CODE[indexCodeName]);

  const indexCode = indexCodesByName[indexCodeName];
  const accountCode = accountCodesByName[accountCodeName];

  if (!indexCode || !accountCode) {
    throw new Error(`Missing funding source for index code ${indexCodeName} / account code ${accountCodeName}`);
  }

  return { indexCode, accountCode };
};

/**
 * Generates a chronologically ordered status history for a reimbursement request, bounded by `now`.
 * Requests created more recently naturally stall earlier in the pipeline since fewer days
 * have elapsed for them to progress; older requests have had time to reach later stages.
 * A request may be denied at a random point instead of continuing to progress.
 */
export const generateReimbursementStatusHistory = (
  faker: Faker,
  dateCreated: Date,
  now: Date
): ReimbursementStatusStep[] => {
  const history: ReimbursementStatusStep[] = [{ type: STAGE_ORDER[0], date: dateCreated }];

  const isDenied = faker.datatype.boolean({ probability: DENIED_CHANCE });
  const deniedAfterStageIndex = isDenied ? faker.number.int({ min: 0, max: 2 }) : STAGE_ORDER.length;

  let currentDate = dateCreated;

  for (let stageIndex = 1; stageIndex < STAGE_ORDER.length; stageIndex++) {
    if (stageIndex > deniedAfterStageIndex) break;

    const nextDate = addDaysToDate(currentDate, faker.number.int({ min: MIN_DAYS_PER_STAGE, max: MAX_DAYS_PER_STAGE }));
    if (nextDate > now) break;

    history.push({ type: STAGE_ORDER[stageIndex], date: nextDate });
    currentDate = nextDate;
  }

  if (isDenied && history[history.length - 1].type !== Reimbursement_Status_Type.REIMBURSED) {
    const deniedDate = addDaysToDate(currentDate, faker.number.int({ min: 1, max: MAX_DAYS_PER_STAGE }));
    if (deniedDate <= now) {
      history.push({ type: Reimbursement_Status_Type.DENIED, date: deniedDate });
    }
  }

  return history;
};

export const hasReachedStage = (history: ReimbursementStatusStep[], stage: Reimbursement_Status_Type): boolean =>
  history.some((step) => step.type === stage);

/**
 * createReimbursementProducts (reimbursement-requests.utils.ts) unconditionally forces a tied
 * material's status to READY_TO_ORDER, and updateMaterialStatusesOnPayment bumps it to ORDERED
 * the moment the request reaches PENDING_FINANCE (even if later DENIED) - so NOT_READY_TO_ORDER
 * is never reachable for a tied material, and ORDERED is guaranteed once PENDING_FINANCE happens.
 * RECEIVED once REIMBURSED isn't automatic in the app, but is the realistic real-world follow-through.
 */
export const deriveMaterialStatusAfterTie = (history: ReimbursementStatusStep[]): Material_Status => {
  if (hasReachedStage(history, Reimbursement_Status_Type.REIMBURSED)) return Material_Status.RECEIVED;
  if (hasReachedStage(history, Reimbursement_Status_Type.PENDING_FINANCE)) return Material_Status.ORDERED;
  return Material_Status.READY_TO_ORDER;
};

export const generateProductCount = (faker: Faker): number =>
  faker.helpers.weightedArrayElement([
    { weight: 60, value: 1 },
    { weight: 30, value: 2 },
    { weight: 10, value: 3 }
  ]);

/** Independently rolls each material against `tieChance` to decide which ones get a reimbursement product. */
export const selectMaterialsToTie = <T>(faker: Faker, materials: T[], tieChance: number): T[] =>
  materials.filter(() => faker.datatype.boolean({ probability: tieChance }));

/** How many general-supply products to generate so the overall BOM-vs-general-supply split lands on `BOM_PRODUCT_RATIO`. */
export const generalSupplyCountForTiedMaterials = (tiedMaterialCount: number): number =>
  Math.round(tiedMaterialCount * ((1 - BOM_PRODUCT_RATIO) / BOM_PRODUCT_RATIO));

/** Fallback cost (in cents) for a BOM-tied product whose material has no price set. */
export const generateFallbackMaterialCost = (faker: Faker): number => faker.number.int({ min: 500, max: 20000 });

export type ReimbursementProductSpec<T> = { material: T } | { generalSupply: true };

export const buildProductSpecs = <T>(tiedMaterials: T[], generalSupplyCount: number): ReimbursementProductSpec<T>[] => [
  ...tiedMaterials.map((material) => ({ material })),
  ...Array.from({ length: generalSupplyCount }, () => ({ generalSupply: true as const }))
];

/** Shuffles then chunks items into groups sized by `generateGroupSize` (e.g. `generateProductCount`), used to split a batch of products across individual reimbursement requests. */
export const chunkIntoGroups = <T>(faker: Faker, items: T[], generateGroupSize: (faker: Faker) => number): T[][] => {
  const shuffled = faker.helpers.shuffle(items);
  const groups: T[][] = [];

  let index = 0;
  while (index < shuffled.length) {
    const groupSize = Math.min(generateGroupSize(faker), shuffled.length - index);
    groups.push(shuffled.slice(index, index + groupSize));
    index += groupSize;
  }

  return groups;
};

export const reimbursementRequestCreateInput = (
  organizationId: string,
  identifier: number,
  recipientId: string,
  vendorId: string,
  indexCodeId: string,
  accountCodeId: string,
  totalCost: number,
  dateCreated: Date,
  dateOfExpense: Date | undefined,
  description: string
): Prisma.Reimbursement_RequestCreateInput => ({
  identifier,
  totalCost,
  dateCreated,
  dateOfExpense: dateOfExpense ?? null,
  description,
  recipient: { connect: { userId: recipientId } },
  vendor: { connect: { vendorId } },
  indexCode: { connect: { indexCodeId } },
  accountCode: { connect: { accountCodeId } },
  organization: { connect: { organizationId } },
  reimbursementStatuses: {
    create: {
      type: Reimbursement_Status_Type.PENDING_LEADERSHIP_APPROVAL,
      userId: recipientId,
      dateCreated
    }
  }
});

export const wbsReimbursementProductReasonCreateInput = (
  wbsElementId: string
): Prisma.Reimbursement_Product_ReasonCreateInput => ({
  wbsElement: { connect: { wbsElementId } }
});

export const otherReimbursementProductReasonCreateInput = (
  otherReasonId: string
): Prisma.Reimbursement_Product_ReasonCreateInput => ({
  otherReason: { connect: { otherReimbursementProductReasonId: otherReasonId } }
});

export const reimbursementProductCreateInput = (
  name: string,
  cost: number,
  reimbursementRequestId: string,
  reimbursementProductReasonId: string,
  indexCodeId: string,
  materialId?: string
): Prisma.Reimbursement_ProductCreateInput => ({
  name,
  cost,
  reimbursementRequest: { connect: { reimbursementRequestId } },
  reimbursementProductReason: { connect: { reimbursementProductReasonId } },
  ...(materialId ? { material: { connect: { materialId } } } : {}),
  refundSources: {
    create: {
      amount: cost,
      indexCode: { connect: { indexCodeId } }
    }
  }
});

export const receiptCreateInput = (
  reimbursementRequestId: string,
  createdByUserId: string,
  identifier: number,
  dateCreated: Date
): Prisma.ReceiptCreateInput => ({
  googleFileId: `seed-receipt-${identifier}`,
  name: `receipt-${identifier}.pdf`,
  dateCreated,
  createdBy: { connect: { userId: createdByUserId } },
  reimbursementRequest: { connect: { reimbursementRequestId } }
});

/**
 * Only a Head+ recipient can set their date of expense right at creation (the "Date of Expense"
 * field is hidden from everyone else on the create form). Anyone else has to wait until their
 * request is leadership-approved, then adds it themselves via "Add Purchase Details" once they've
 * actually bought the item - so their date of expense must fall on or after that approval date.
 */
export const generateDateOfExpense = (
  faker: Faker,
  recipientCanSetAtCreation: boolean,
  dateCreated: Date,
  approvalDate: Date | undefined,
  latestPossibleDate: Date
): Date | undefined => {
  if (recipientCanSetAtCreation) {
    return faker.date.recent({ days: faker.number.int({ min: 1, max: 10 }), refDate: dateCreated });
  }

  if (!approvalDate) return undefined;

  const latest = latestPossibleDate > approvalDate ? latestPossibleDate : addDaysToDate(approvalDate, 1);
  return faker.date.between({ from: approvalDate, to: latest });
};

export const systemCommentText = (firstName: string, lastName: string, action: string): string =>
  `${firstName} ${lastName} ${action}`;

export const reimbursementRequestCommentCreateInput = (
  reimbursementRequestId: string,
  userCreatedId: string,
  comment: string,
  dateCreated: Date
): Prisma.Reimbursement_Request_CommentCreateInput => ({
  comment,
  dateCreated,
  reimbursementRequest: { connect: { reimbursementRequestId } },
  userCreated: { connect: { userId: userCreatedId } }
});

export const reimbursementCreateInput = (
  organizationId: string,
  purchaserId: string,
  amount: number,
  dateCreated: Date
): Prisma.ReimbursementCreateInput => ({
  amount,
  dateCreated,
  purchaser: { connect: { userId: purchaserId } },
  userSubmitted: { connect: { userId: purchaserId } },
  organization: { connect: { organizationId } }
});
