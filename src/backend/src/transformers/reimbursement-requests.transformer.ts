import { Prisma } from '@prisma/client';
import {
  ClubAccount,
  ExpenseType,
  ReimbursementProduct,
  ReimbursementRequest,
  ReimbursementStatus,
  ReimbursementStatusType,
  Vendor
} from 'shared';
import reimbursementRequestQueryArgs from '../prisma-query-args/reimbursement-requests.query-args';
import userTransformer from './user.transformer';
import reimbursementStatusQueryArgs from '../prisma-query-args/reimbursement-statuses.query-args';
import reimbursementProductQueryArgs from '../prisma-query-args/reimbursement-products.query-args';
import { wbsNumOf } from '../utils/utils';

export const reimbursementRequestTransformer = (
  reimbursementRequest: Prisma.Reimbursement_RequestGetPayload<typeof reimbursementRequestQueryArgs>
): ReimbursementRequest => {
  return {
    reimbursementRequestId: reimbursementRequest.reimbursementRequestId,
    saboId: reimbursementRequest.saboId ?? undefined,
    dateCreated: reimbursementRequest.dateCreated,
    dateDeleted: reimbursementRequest.dateDeleted ?? undefined,
    dateOfExpense: reimbursementRequest.dateOfExpense,
    reimbursementsStatuses: reimbursementRequest.reimbursementsStatuses.map(reimbursementStatusTransformer),
    recipient: userTransformer(reimbursementRequest.recipient),
    vendor: vendorTransformer(reimbursementRequest.vendor),
    account: reimbursementRequest.account as ClubAccount,
    totalCost: reimbursementRequest.totalCost,
    receiptPictures: reimbursementRequest.receiptPictures,
    reimbursementProducts: reimbursementRequest.reimbursementProducts.map(reimbursementProductTransformer),
    dateDelivered: reimbursementRequest.dateDelivered ?? undefined,
    expenseType: expenseTypeTransformer(reimbursementRequest.expenseType)
  };
};

export const reimbursementStatusTransformer = (
  reimbursementStatus: Prisma.Reimbursement_StatusGetPayload<typeof reimbursementStatusQueryArgs>
): ReimbursementStatus => {
  return {
    reimbursementStatusId: reimbursementStatus.reimbursementStatusId,
    type: reimbursementStatus.type as ReimbursementStatusType,
    user: userTransformer(reimbursementStatus.user),
    dateCreated: reimbursementStatus.dateCreated
  };
};

export const reimbursementProductTransformer = (
  reimbursementProduct: Prisma.Reimbursement_ProductGetPayload<typeof reimbursementProductQueryArgs>
): ReimbursementProduct => {
  return {
    reimbursementProductId: reimbursementProduct.reimbursementProductId,
    name: reimbursementProduct.name,
    dateDeleted: reimbursementProduct.dateDeleted ?? undefined,
    cost: reimbursementProduct.cost,
    wbsNum: wbsNumOf(reimbursementProduct.wbsElement),
    wbsName: reimbursementProduct.wbsElement.name
  };
};

export const expenseTypeTransformer = (expenseType: Prisma.Expense_TypeGetPayload<null>): ExpenseType => {
  return {
    expenseTypeId: expenseType.expenseTypeId,
    name: expenseType.name,
    code: expenseType.code,
    allowed: expenseType.allowed
  };
};

export const vendorTransformer = (vendor: Prisma.VendorGetPayload<null>): Vendor => {
  return {
    vendorId: vendor.vendorId,
    dateCreated: vendor.dateCreated,
    name: vendor.name
  };
};
