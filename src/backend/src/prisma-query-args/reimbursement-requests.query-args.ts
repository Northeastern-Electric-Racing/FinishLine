import { Prisma } from '@prisma/client';

const reimbursementRequestQueryArgs = Prisma.validator<Prisma.Reimbursement_RequestArgs>()({
  include: {
    recepient: true,
    vendor: true,
    expenseType: true,
    reimbursementsStatuses: true,
    reimbursementProducts: {
      where: {
        dateDeleted: null
      },
      include: {
        wbsElement: true
      }
    }
  }
});

export default reimbursementRequestQueryArgs;
