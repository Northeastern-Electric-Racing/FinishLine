import { Prisma } from '@prisma/client';

export type ReimbursementProductQueryArgs = ReturnType<typeof getReimbursementProductQueryArgs>;

export type ReimbursementProductReasonQueryArgs = ReturnType<typeof getReimbursementProductReasonQueryArgs>;

export const getReimbursementProductReasonQueryArgs = (_organizationId: string) =>
  Prisma.validator<Prisma.Reimbursement_Product_ReasonArgs>()({
    include: {
      wbsElement: true
    }
  });

export const getReimbursementProductQueryArgs = (organizationId: string) =>
  Prisma.validator<Prisma.Reimbursement_ProductArgs>()({
    include: {
      reimbursementProductReason: getReimbursementProductReasonQueryArgs(organizationId)
    }
  });
