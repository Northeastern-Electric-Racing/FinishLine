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
  ReimbursementRequestComment,
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
import { decryptPassword } from '../utils/encryption.utils';
import { NotFoundException } from '../utils/errors.utils';
import { AccountCodeQueryArgs } from '../prisma-query-args/account-code.query-args';
import { IndexCodeQueryArgs } from '../prisma-query-args/index-code.query-args';
import { ReimbursementProductOtherReasonQueryArgs } from '../prisma-query-args/reimbursement-product-other-reason.query-args';
import { ReimbursementRequestCommentQueryArgs } from '../prisma-query-args/reimbursement-comment.query-args';

export const receiptTransformer = (receipt: Prisma.ReceiptGetPayload<ReceiptQueryArgs>): Receipt => {
  return { receiptId: receipt.receiptId, googleFileId: receipt.googleFileId, name: receipt.name };
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
    indexCode: indexCodeTransformer(reimbursementRequest.indexCode),
    totalCost: reimbursementRequest.totalCost,
    receiptPictures: reimbursementRequest.receiptPictures.filter((receipt) => !receipt.dateDeleted).map(receiptTransformer),
    reimbursementProducts: reimbursementRequest.reimbursementProducts.map(reimbursementProductTransformer),
    dateDelivered: reimbursementRequest.dateDelivered ?? undefined,
    accountCode: accountCodeTransformer(reimbursementRequest.accountCode),
    comments: reimbursementRequest.reimbursementComments.map(reimbursementRequestCommentTransformer)
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
        indexCode: indexCodeTransformer(reason.otherReason!.indexCode),
        accountCodes: reason.otherReason!.accountCodes.map(accountCodeTransformer)
      };
};

export const accountCodeTransformer = (accountCode: Prisma.Account_CodeGetPayload<AccountCodeQueryArgs>): AccountCode => {
  return { ...accountCode, indexCodes: accountCode.indexCodes.map(indexCodeTransformer) };
};

export const vendorTransformer = (vendor: Prisma.VendorGetPayload<VendorQueryArgs>): Vendor => {
  if (!process.env.ENCRYPTION_KEY) {
    throw new NotFoundException('Encryption Key', 'Encryption key not found in environment variables');
  }
  return {
    ...vendor,
    password: decryptPassword(vendor.password),
    discountCode: vendor.discountCode ?? undefined,
    twoFactorContacts: vendor.twoFactorContacts.map(userTransformer),
    notes: vendor.notes ?? undefined,
    addedBy: userTransformer(vendor.addedBy)
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
  return { ...indexCode, userCreated: userTransformer(indexCode.userCreated) };
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
    indexCode: indexCodeTransformer(otherProductReason.indexCode),
    accountCodes: otherProductReason.accountCodes.map(accountCodeTransformer)
  };
};

export const reimbursementRequestCommentTransformer = (
  reimbursementRequestComment: Prisma.Reimbursement_Request_CommentGetPayload<ReimbursementRequestCommentQueryArgs>
): ReimbursementRequestComment => {
  return { ...reimbursementRequestComment, userCreated: userTransformer(reimbursementRequestComment.userCreated) };
};
