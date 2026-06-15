import { Prisma } from '@prisma/client';
import { getReimbursementProductOtherReasonQueryArgs } from './reimbursement-product-other-reason.query-args.js';
import { getIndexCodeQueryArgs } from './index-code.query-args.js';

export type ReimbursementProductQueryArgs = ReturnType<typeof getReimbursementProductQueryArgs>;
export type RefundSourceQueryArgs = ReturnType<typeof getRefundSourceQueryArgs>;
export type ReimbursementProductReasonQueryArgs = ReturnType<typeof getReimbursementProductReasonQueryArgs>;

export const getReimbursementProductReasonQueryArgs = (organizationId: string) =>
  Prisma.validator<Prisma.Reimbursement_Product_ReasonDefaultArgs>()({
    include: {
      wbsElement: true,
      otherReason: getReimbursementProductOtherReasonQueryArgs(organizationId)
    }
  });

export const getRefundSourceQueryArgs = (organizationId: string) =>
  Prisma.validator<Prisma.Refund_SourceDefaultArgs>()({
    include: {
      indexCode: getIndexCodeQueryArgs(organizationId)
    }
  });

export const getReimbursementProductQueryArgs = (organizationId: string) =>
  Prisma.validator<Prisma.Reimbursement_ProductDefaultArgs>()({
    include: {
      refundSources: getRefundSourceQueryArgs(organizationId),
      reimbursementProductReason: getReimbursementProductReasonQueryArgs(organizationId),
      material: true
    }
  });
