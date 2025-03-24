/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Prisma } from '@prisma/client';
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
import { VendorQueryArgs } from '../prisma-query-args/vendor.query-args';
import { AccountCodeQueryArgs } from '../prisma-query-args/account-code.query-args';
import { IndexCodeQueryArgs } from '../prisma-query-args/index-code.query-args';
import { ReimbursementProductOtherReasonQueryArgs } from '../prisma-query-args/reimbursement-product-other-reason.query-args';

export const receiptTransformer = (receipt: Prisma.ReceiptGetPayload<ReceiptQueryArgs>): Receipt => {
  return {
    receiptId: receipt.receiptId,
    googleFileId: receipt.googleFileId,
    name: receipt.name,
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
    dateOfExpense: reimbursementRequest.dateOfExpense ?? undefined,
    reimbursementStatuses: reimbursementRequest.reimbursementStatuses.map(reimbursementStatusTransformer),
    recipient: userTransformer(reimbursementRequest.recipient),
    vendor: vendorTransformer(reimbursementRequest.vendor),
    account: indexCodeTransformer(reimbursementRequest.indexCode),
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
    cost: reimbursementProduct.cost,
    reimbursementProductReason: reimbursementProductReasonTransformer(reimbursementProduct.reimbursementProductReason)
  };
};

const reimbursementProductReasonTransformer = (
  reason: Prisma.Reimbursement_Product_ReasonGetPayload<ReimbursementProductReasonQueryArgs>
): ReimbursementProductReason => {
  return reason.wbsElement
    ? { wbsName: reason.wbsElement.name, wbsNum: wbsNumOf(reason.wbsElement) }
    : {
        otherProductReasonId: reason.otherReason!.otherReimbursementProductReasonId,
        name: reason.otherReason!.name,
        userCreated: userTransformer(reason.otherReason!.userCreated),
        dateCreated: reason.otherReason!.dateCreated,
        budget: reason.otherReason!.budget,
        indexCode: indexCodeTransformer(reason.otherReason!.indexCode)
      };
};

export const accountCodeTransformer = (accountCode: Prisma.Account_CodeGetPayload<AccountCodeQueryArgs>): AccountCode => {
  return {
    ...accountCode,
    allowedRefundSources: accountCode.allowedRefundSources.map(indexCodeTransformer)
  };
};

export const vendorTransformer = (vendor: Prisma.VendorGetPayload<VendorQueryArgs>): Vendor => {
  return {
    vendorId: vendor.vendorId,
    dateCreated: vendor.dateCreated,
    name: vendor.name,
    username: vendor.username,
    password: vendor.password, // to be decrypted? either decrypted here or in the hook itself
    discountCode: vendor.discountCode ?? undefined,
    twoFactorContact: vendor.twoFactorContact ? userTransformer(vendor.twoFactorContact) : undefined,
    notes: vendor.notes ?? undefined,
    addedBy: vendor.addedBy ? userTransformer(vendor.addedBy) : undefined
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

export const indexCodeTransformer = (indexCode: Prisma.Index_CodeGetPayload<IndexCodeQueryArgs>): IndexCode => {
  return {
    indexCodeId: indexCode.indexCodeId,
    name: indexCode.name,
    userCreated: userTransformer(indexCode.userCreated),
    dateCreated: indexCode.dateCreated,
    dateDeleted: indexCode.dateDeleted ?? undefined
  };
};

export const otherProductReasonTransformer = (
  otherProductReason: Prisma.Reimbursement_Product_Other_ReasonGetPayload<ReimbursementProductOtherReasonQueryArgs>
): OtherProductReason => {
  return {
    otherProductReasonId: otherProductReason.otherReimbursementProductReasonId,
    name: otherProductReason.name,
    userCreated: userTransformer(otherProductReason.userCreated),
    dateCreated: otherProductReason.dateCreated,
    budget: otherProductReason.budget,
    indexCode: indexCodeTransformer(otherProductReason.indexCode)
  };
};
