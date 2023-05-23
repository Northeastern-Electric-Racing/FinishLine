import { Prisma } from '@prisma/client';
import { ReimbursementRequest } from 'shared';
import reimbursementRequestQueryArgs from '../prisma-query-args/reimbursement-requests.query-args';
import { wbsNumOf } from '../utils/utils';
import userTransformer from './user.transformer';

const reimbursementRequestTransformer = (
  reimbursementRequest: Prisma.Reimbursement_RequestGetPayload<typeof reimbursementRequestQueryArgs>
): ReimbursementRequest => {
  const { vendor, expenseType } = reimbursementRequest;
  return {
    reimbursementRequestId: reimbursementRequest.reimbursementRequestId,
    saboId: reimbursementRequest.saboId ?? undefined,
    dateCreated: reimbursementRequest.dateCreated,
    dateDeleted: reimbursementRequest.dateDeleted ?? undefined,
    dateOfExpense: reimbursementRequest.dateOfExpense,
    reimbursementsStatuses: reimbursementRequest.reimbursementsStatuses.map((reimbursementStatus) => ({
      reimbursementStatusId: reimbursementStatus.reimbursementStatusId,
      type: reimbursementStatus.type,
      user: userTransformer(reimbursementStatus.user),
      dateCreated: reimbursementStatus.dateCreated
    })),
    recepient: userTransformer(reimbursementRequest.recepient),
    vendor: {
      vendorId: vendor.vendorId,
      dateCreated: vendor.dateCreated,
      name: vendor.name
    },
    account: reimbursementRequest.account,
    totalCost: reimbursementRequest.totalCost,
    receiptPictures: reimbursementRequest.receiptPictures,
    reimbursementProducts: reimbursementRequest.reimbursementProducts.map((reimbursementProduct) => ({
      reimbursementProductId: reimbursementProduct.reimbursementProductId,
      name: reimbursementProduct.name,
      dateDeleted: reimbursementProduct.dateDeleted,
      cost: reimbursementProduct.cost,
      wbsNum: wbsNumOf(reimbursementProduct.wbsNum)
    })),
    dateDelivered: reimbursementRequest.dateDelivered ?? undefined,
    expenseType: {
      expenseTypeId: expenseType.expenseTypeId,
      name: expenseType.name,
      code: expenseType.code,
      allowed: expenseType.allowed
    }
  };
};

export default reimbursementRequestTransformer;
