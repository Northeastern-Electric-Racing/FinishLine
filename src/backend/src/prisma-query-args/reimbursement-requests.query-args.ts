import { Prisma } from '@prisma/client';
import { getBaseUserQueryArgs } from './user.query-args.js';

export type BaseReimbursementRequestQueryArgs = ReturnType<typeof getBaseReimbursementRequestQueryArgs>;
export type ReimbursementRequestTableItemQueryArgs = ReturnType<typeof getReimbursementRequestTableItemQueryArgs>;
export type BaseReimbursementProductReasonQueryArgs = ReturnType<typeof getBaseReimbursementProductReasonQueryArgs>;

// the minimum every consumer of a reimbursement request needs
export const getBaseReimbursementRequestQueryArgs = () =>
  Prisma.validator<Prisma.Reimbursement_RequestDefaultArgs>()({
    select: {
      reimbursementRequestId: true,
      identifier: true,
      saboId: true,
      dateCreated: true,
      dateOfExpense: true,
      dateDelivered: true,
      description: true,
      totalCost: true,
      // every table shows or searches the submitter, and the detail page checks permissions against them
      recipient: getBaseUserQueryArgs(),
      // one per status change (about 8 at most): gives the current status, the SABO submitted date, and every status check
      reimbursementStatuses: { select: { type: true, dateCreated: true }, orderBy: { dateCreated: 'asc' } }
    }
  });

// why a product was bought: the wbs element it's for, or an "other" reason
export const getBaseReimbursementProductReasonQueryArgs = () =>
  Prisma.validator<Prisma.Reimbursement_Product_ReasonDefaultArgs>()({
    select: {
      wbsElement: { select: { carNumber: true, projectNumber: true, workPackageNumber: true, name: true } },
      otherReason: { select: { otherReimbursementProductReasonId: true, name: true } }
    }
  });

// the My Requests, Assigned To Me, and All Requests tables
export const getReimbursementRequestTableItemQueryArgs = () =>
  Prisma.validator<Prisma.Reimbursement_RequestDefaultArgs>()({
    select: {
      ...getBaseReimbursementRequestQueryArgs().select,
      // the All Requests tab's Assigned To column
      assignee: getBaseUserQueryArgs(),
      // the products column, search, and project filter
      reimbursementProducts: {
        where: { dateDeleted: null },
        select: { name: true, reimbursementProductReason: getBaseReimbursementProductReasonQueryArgs() }
      }
    }
  });
