import { Prisma } from '@prisma/client';

const reimbursementRequestQueryArgs = Prisma.validator<Prisma.Reimbursement_RequestArgs>()({
  include: {
    saboId: true,
    totalCost: true,
    dateOfExpense: true,
    dateDelivered: true,
    reimbursementStatuses: {
      where: {
        dateDeleted: null
      },
      include: {
        type: true
      }
    }
  }
});

export default reimbursementRequestQueryArgs;
