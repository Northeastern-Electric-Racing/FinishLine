import { Prisma } from '@prisma/client';

export type ReimbursementProductQueryArgs = ReturnType<typeof getReimbursementProductQueryArgs>;

export type ReimbursementProductReasonQueryArgs = ReturnType<typeof getReimbursementProductReasonQueryArgs>;

export const getReimbursementProductReasonQueryArgs = (_organizationId: string) =>
  Prisma.validator<Prisma.Reimbursement_Product_ReasonDefaultArgs>()({
    include: {
      wbsElement: true
    }
  });

export const getReimbursementProductQueryArgs = (organizationId: string) =>
  Prisma.validator<Prisma.Reimbursement_ProductDefaultArgs>()({
    include: {
      reimbursementProductReason: getReimbursementProductReasonQueryArgs(organizationId)
    }
  });
