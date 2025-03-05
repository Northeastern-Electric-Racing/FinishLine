/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Index_Code, Prisma } from '@prisma/client';
import {
  AccountCode,
  IndexCode,
  OtherProductReason,
  Receipt,
  Reimbursement,
  ReimbursementProduct,
  ReimbursementProductReason,
  ReimbursementRequest,
  ReimbursementStatus,
  ReimbursementStatusType,
  Vendor
} from 'shared';

import { wbsNumOf } from '../utils/utils';
import { userTransformer } from './user.transformer';
import { ReceiptQueryArgs } from '../prisma-query-args/receipt-query.args';
import { ReimbursementRequestQueryArgs } from '../prisma-query-args/reimbursement-requests.query-args';
import { ReimbursementStatusQueryArgs } from '../prisma-query-args/reimbursement-statuses.query-args';
import {
  ReimbursementProductQueryArgs,
  ReimbursementProductReasonQueryArgs
} from '../prisma-query-args/reimbursement-products.query-args';
import { ReimbursementQueryArgs } from '../prisma-query-args/reimbursement.query-args';
import { AccountCodeQueryArgs } from '../prisma-query-args/account-code.query.args';

export const receiptTransformer = (receipt: Prisma.ReceiptGetPayload<ReceiptQueryArgs>): Receipt => {
  return {
    receiptId: receipt.receiptId,
    googleFileId: receipt.googleFileId,
    name: receipt.name,
    dateDeleted: receipt.dateDeleted ?? undefined,
    deletedBy: receipt.deletedBy ? userTransformer(receipt.deletedBy) : undefined
  };
};

export const reimbursementRequestTransformer = (
  reimbursementRequest: Prisma.Reimbursement_RequestGetPayload<ReimbursementRequestQueryArgs>
): ReimbursementRequest => {
  return {
    reimbursementRequestId: reimbursementRequest.reimbursementRequestId,
    identifier: reimbursementRequest.identifier,
    saboId: reimbursementRequest.saboId ?? undefined,
    dateCreated: reimbursementRequest.dateCreated,
    dateDeleted: reimbursementRequest.dateDeleted ?? undefined,
    dateOfExpense: reimbursementRequest.dateOfExpense ?? undefined,
    reimbursementStatuses: reimbursementRequest.reimbursementStatuses.map(reimbursementStatusTransformer),
    recipient: userTransformer(reimbursementRequest.recipient),
    vendor: vendorTransformer(reimbursementRequest.vendor),
    account: indexCodeTransformer(reimbursementRequest.account as Index_Code),
    totalCost: reimbursementRequest.totalCost,
    receiptPictures: reimbursementRequest.receiptPictures.filter((receipt) => !receipt.dateDeleted).map(receiptTransformer),
    reimbursementProducts: reimbursementRequest.reimbursementProducts.map(reimbursementProductTransformer),
    dateDelivered: reimbursementRequest.dateDelivered ?? undefined,
    accountCode: accountCodeTransformer(reimbursementRequest.accountCode)
  };
};

export const reimbursementStatusTransformer = (
  reimbursementStatus: Prisma.Reimbursement_StatusGetPayload<ReimbursementStatusQueryArgs>
): ReimbursementStatus => {
  return {
    reimbursementStatusId: reimbursementStatus.reimbursementStatusId,
    type: reimbursementStatus.type as ReimbursementStatusType,
    user: userTransformer(reimbursementStatus.user),
    dateCreated: reimbursementStatus.dateCreated
  };
};

export const reimbursementProductTransformer = (
  reimbursementProduct: Prisma.Reimbursement_ProductGetPayload<ReimbursementProductQueryArgs>
): ReimbursementProduct => {
  return {
    reimbursementProductId: reimbursementProduct.reimbursementProductId,
    name: reimbursementProduct.name,
    dateDeleted: reimbursementProduct.dateDeleted ?? undefined,
    cost: reimbursementProduct.cost,
    reimbursementProductReason: reimbursementProductReasonTransformer(reimbursementProduct.reimbursementProductReason)
  };
};

const reimbursementProductReasonTransformer = (
  reason: Prisma.Reimbursement_Product_ReasonGetPayload<ReimbursementProductReasonQueryArgs>
): ReimbursementProductReason => {
  return reason.wbsElement
    ? { wbsName: reason.wbsElement?.name, wbsNum: wbsNumOf(reason.wbsElement) }
    : (otherProductReasonTransformer(reason.otherReason!) as OtherProductReason);
};

export const accountCodeTransformer = (accountCode: Prisma.Account_CodeGetPayload<AccountCodeQueryArgs>): AccountCode => {
  return {
    ...accountCode,
    allowedRefundSources: accountCode.allowedRefundSources.map(indexCodeTransformer) as IndexCode[],
    //dateDeleted: accountCode.dateDeleted ?? undefined
  };
};

export const vendorTransformer = (vendor: Prisma.VendorGetPayload<null>): Vendor => {
  return {
    vendorId: vendor.vendorId,
    dateCreated: vendor.dateCreated,
    dateDeleted: vendor.dateDeleted ?? undefined,
    name: vendor.name
  };
};

export const reimbursementTransformer = (
  reimbursement: Prisma.ReimbursementGetPayload<ReimbursementQueryArgs>
): Reimbursement => {
  return {
    reimbursementId: reimbursement.reimbursementId,
    dateCreated: reimbursement.dateCreated,
    amount: reimbursement.amount,
    userSubmitted: userTransformer(reimbursement.userSubmitted)
  };
};

function indexCodeTransformer(arg0: { indexCodeId: string; name: string; dateCreated: Date; dateDeleted: Date | null; userCreatedId: string; userDeletedId: string | null; }): IndexCode {
  throw new Error('Function not implemented.');
}

function otherProductReasonTransformer(arg0: { dateDeleted: Date | null; dateCreated: Date; name: string; budget: number; indexCodeId: string; accountCodeId: string; userCreatedId: string; userDeletedId: string | null; otherReimbursementProductReasonId: string; }): OtherProductReason {
  throw new Error('Function not implemented.');
}
