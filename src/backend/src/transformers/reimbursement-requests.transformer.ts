import { Prisma } from '@prisma/client';
import { ReimbursementRequest } from 'shared';
import reimbursementRequestQueryArgs from '../prisma-query-args/reimbursement-requests.query-args';
import expenseTypeTransformer from './expense-type.transformer';
import reimbursementProductTransformer from './reimbursement-products.transformer';
import reimbursementStatusTransformer from './reimbursement-statuses.transformer';
import userTransformer from './user.transformer';
import vendorTransformer from './vendor.transformer';

const reimbursementRequestTransformer = (
  reimbursementRequest: Prisma.Reimbursement_RequestGetPayload<typeof reimbursementRequestQueryArgs>
): ReimbursementRequest => {
  return {
    reimbursementRequestId: reimbursementRequest.reimbursementRequestId,
    saboId: reimbursementRequest.saboId ?? undefined,
    dateCreated: reimbursementRequest.dateCreated,
    dateDeleted: reimbursementRequest.dateDeleted ?? undefined,
    dateOfExpense: reimbursementRequest.dateOfExpense,
    reimbursementsStatuses: reimbursementRequest.reimbursementsStatuses.map(reimbursementStatusTransformer),
    recepient: userTransformer(reimbursementRequest.recepient),
    vendor: vendorTransformer(reimbursementRequest.vendor),
    account: reimbursementRequest.account,
    totalCost: reimbursementRequest.totalCost,
    receiptPictures: reimbursementRequest.receiptPictures,
    reimbursementProducts: reimbursementRequest.reimbursementProducts.map(reimbursementProductTransformer),
    dateDelivered: reimbursementRequest.dateDelivered ?? undefined,
    expenseType: expenseTypeTransformer(reimbursementRequest.expenseType)
  };
};

export default reimbursementRequestTransformer;
