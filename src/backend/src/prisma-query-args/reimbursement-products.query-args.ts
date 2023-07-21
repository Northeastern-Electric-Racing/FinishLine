import { Prisma } from '@prisma/client';

const reimbursementProductQueryArgs = Prisma.validator<Prisma.Reimbursement_ProductArgs>()({
  include: {
    wbsElement: true
  }
});

export default reimbursementProductQueryArgs;
