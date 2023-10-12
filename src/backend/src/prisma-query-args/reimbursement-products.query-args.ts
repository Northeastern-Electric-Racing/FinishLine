import { Prisma } from '@prisma/client';

const reimbursementProductQueryArgs = Prisma.validator<Prisma.Reimbursement_ProductArgs>()({
  include: {
    reimbursementProductReason: true
  }
});

export default reimbursementProductQueryArgs;
