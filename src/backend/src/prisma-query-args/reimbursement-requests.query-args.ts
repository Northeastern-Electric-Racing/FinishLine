import { Prisma } from '@prisma/client';
import reimbursementStatusQueryArgs from './reimbursement-statuses.query-args';
import receiptQueryArgs from './receipt-query.args';
import { reimbursementProductQueryArgs } from './reimbursement-products.query-args';

const reimbursementRequestQueryArgs = Prisma.validator<Prisma.Reimbursement_RequestArgs>()({
  include: {
    recipient: true,
    vendor: true,
    expenseType: true,
    receiptPictures: receiptQueryArgs,
    reimbursementStatuses: reimbursementStatusQueryArgs,
    reimbursementProducts: {
      where: {
        dateDeleted: null
      },
      ...reimbursementProductQueryArgs
    }
  }
});

export default reimbursementRequestQueryArgs;
