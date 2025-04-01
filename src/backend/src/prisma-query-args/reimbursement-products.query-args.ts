import { Prisma } from '@prisma/client';
import { getReimbursementProductOtherReasonQueryArgs } from './reimbursement-product-other-reason.query-args';

export type ReimbursementProductQueryArgs = ReturnType<typeof getReimbursementProductQueryArgs>;

export type ReimbursementProductReasonQueryArgs = ReturnType<typeof getReimbursementProductReasonQueryArgs>;

export const getReimbursementProductReasonQueryArgs = (organizationId: string) =>
  Prisma.validator<Prisma.Reimbursement_Product_ReasonDefaultArgs>()({
    include: {
      wbsElement: true,
      otherReason: getReimbursementProductOtherReasonQueryArgs(organizationId)
    }
  });

export const getReimbursementProductQueryArgs = (organizationId: string) =>
  Prisma.validator<Prisma.Reimbursement_ProductDefaultArgs>()({
    include: {
      reimbursementProductReason: getReimbursementProductReasonQueryArgs(organizationId)
    }
  });
