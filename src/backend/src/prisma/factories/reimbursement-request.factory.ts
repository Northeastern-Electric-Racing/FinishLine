import { Faker } from '@faker-js/faker';
import { Account_Code, Index_Code, Prisma, Reimbursement_Status_Type } from '@prisma/client';
import { addDaysToDate } from 'shared';

export const REIMBURSEMENT_REQUESTS_PER_CAR = 150;

export const WBS_REASON_CHANCE = 0.7;
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

export const WBS_PRODUCT_NAMES = [
  'Carbon Fiber Sheets',
  'Aluminum Stock',
  'Epoxy Resin',
  'High Performance Battery Pack',
  'Sensor Components',
  'Microcontrollers',
  'PCB Manufacturing',
  '3D Printing Filament',
  'Machining Services',
  'Fasteners and Hardware',
  'Wiring Harness Materials',
  'Bearings',
  'Brake Pads',
  'Suspension Bushings',
  'Motor Controller Components',
  'Battery Testing Equipment',
  'CAD Software License',
  'Data Acquisition Sensors',
  'Tires',
  'Welding Supplies',
  'Powder Coating Service',
  'Custom Machined Brackets',
  'Heat Shrink Tubing',
  'Connectors and Terminals',
  'Composite Layup Materials',
  'Cooling System Components',
  'Steering Components',
  'Chassis Tubing',
  'Telemetry Hardware',
  'Prototype Enclosures'
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

const INDEX_CODE_NAMES = ['CASH', 'BUDGET'] as const;

const ACCOUNT_CODE_NAMES_BY_INDEX_CODE: Record<(typeof INDEX_CODE_NAMES)[number], string[]> = {
  CASH: ['Subscriptions', 'Travel-Misc', 'Food', 'General Supplies/Tools'],
  BUDGET: ['Subscriptions', 'Travel-Auto/Van Rental', 'Travel-Misc', 'Competition-Registration', 'Food', 'General Supplies/Tools']
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

export type ReimbursementStatusStep = { type: Reimbursement_Status_Type; date: Date };

/**
 * Generates a chronologically ordered status history for a reimbursement request, bounded by `now`.
 * Requests created more recently naturally stall earlier in the pipeline since fewer days
 * have elapsed for them to progress; older requests have had time to reach later stages.
 * A request may be denied at a random point instead of continuing to progress.
 */
export const generateReimbursementStatusHistory = (faker: Faker, dateCreated: Date, now: Date): ReimbursementStatusStep[] => {
  const history: ReimbursementStatusStep[] = [{ type: STAGE_ORDER[0], date: dateCreated }];

  const isDenied = faker.datatype.boolean({ probability: DENIED_CHANCE });
  const deniedAfterStageCount = isDenied ? faker.number.int({ min: 0, max: 2 }) : Infinity;

  let currentDate = dateCreated;

  for (let stageIndex = 1; stageIndex < STAGE_ORDER.length; stageIndex++) {
    if (stageIndex > deniedAfterStageCount) break;

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

export const generateProductCount = (faker: Faker): number =>
  faker.helpers.weightedArrayElement([
    { weight: 60, value: 1 },
    { weight: 30, value: 2 },
    { weight: 10, value: 3 }
  ]);

export const generateReimbursementRequestTotalCost = (faker: Faker): number => {
  const bucket = faker.number.int({ min: 1, max: 100 });

  const dollars =
    bucket <= 55
      ? faker.number.int({ min: 15, max: 300 })
      : bucket <= 90
        ? faker.number.int({ min: 300, max: 1500 })
        : faker.number.int({ min: 1500, max: 5000 });

  return dollars * 100;
};

/**
 * Splits a total cost (in cents) across `partCount` products, rounded to the nearest dollar,
 * with any rounding remainder applied to the last part so the parts always sum to the total.
 */
export const splitCost = (faker: Faker, totalCost: number, partCount: number): number[] => {
  if (partCount === 1) return [totalCost];

  const weights = Array.from({ length: partCount }, () => faker.number.float({ min: 0.5, max: 1.5 }));
  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);

  const parts = weights.map((weight) => Math.round((totalCost * weight) / totalWeight / 100) * 100);
  const difference = totalCost - parts.reduce((sum, part) => sum + part, 0);

  // apply the rounding remainder to the largest part so a small part can never be pushed to zero/negative
  const largestPartIndex = parts.reduce(
    (largestIndex, part, index) => (part > parts[largestIndex] ? index : largestIndex),
    0
  );
  parts[largestPartIndex] += difference;

  return parts;
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
  indexCodeId: string
): Prisma.Reimbursement_ProductCreateInput => ({
  name,
  cost,
  reimbursementRequest: { connect: { reimbursementRequestId } },
  reimbursementProductReason: { connect: { reimbursementProductReasonId } },
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
    return faker.date.recent({ days: faker.number.int({ min: 0, max: 10 }), refDate: dateCreated });
  }

  if (!approvalDate) return undefined;

  const latest = latestPossibleDate > approvalDate ? latestPossibleDate : addDaysToDate(approvalDate, 1);
  return faker.date.between({ from: approvalDate, to: latest });
};

export const systemCommentText = (firstName: string, lastName: string, action: string): string =>
  `${firstName}  ${lastName} ${action}`;

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
