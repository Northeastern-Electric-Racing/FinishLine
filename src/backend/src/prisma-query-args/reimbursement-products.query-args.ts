import { Prisma } from '@prisma/client';

export const reimbursementProductReasonQueryArgs = Prisma.validator<Prisma.Reimbursement_Product_ReasonArgs>()({
  include: {
    wbsElement: true
  }
});

export const reimbursementProductQueryArgs = Prisma.validator<Prisma.Reimbursement_ProductArgs>()({
  include: {
    reimbursementProductReason: { ...reimbursementProductReasonQueryArgs }
  }
});
