import { Prisma } from '@prisma/client';
import reimbursementProductQueryArgs from './reimbursement-products.query-args';
import reimbursementStatusQueryArgs from './reimbursement-statuses.query-args';

const reimbursementRequestQueryArgs = Prisma.validator<Prisma.Reimbursement_RequestArgs>()({
  include: {
    recepient: true,
    vendor: true,
    expenseType: true,
    reimbursementsStatuses: {
      ...reimbursementStatusQueryArgs
    },
    reimbursementProducts: {
      where: {
        dateDeleted: null
      },
      ...reimbursementProductQueryArgs
    }
  }
});

export default reimbursementRequestQueryArgs;
