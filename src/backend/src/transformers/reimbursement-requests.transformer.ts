/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Prisma } from '@prisma/client';
import {
  AccountCode,
  BaseReimbursementRequest,
  IndexCode,
  OtherProductReason,
  Reimbursement,
  ReimbursementProductReasonPreview,
  ReimbursementRequestTableItem,
  ReimbursementStatusType,
  Vendor
} from 'shared';

import { wbsNumOf } from '../utils/utils.js';
import { baseUserTransformer, userTransformer } from './user.transformer.js';
import {
  BaseReimbursementProductReasonQueryArgs,
  BaseReimbursementRequestQueryArgs,
  ReimbursementRequestTableItemQueryArgs
} from '../prisma-query-args/reimbursement-requests.query-args.js';
import { ReimbursementQueryArgs } from '../prisma-query-args/reimbursement.query-args.js';
import { VendorQueryArgs } from '../prisma-query-args/vendor.query-args.js';
import { AccountCodeQueryArgs } from '../prisma-query-args/account-code.query-args.js';
import { IndexCodeQueryArgs } from '../prisma-query-args/index-code.query-args.js';
import { ReimbursementProductOtherReasonQueryArgs } from '../prisma-query-args/reimbursement-product-other-reason.query-args.js';
import { decrypt } from '../utils/encryption.utils.js';

export const baseReimbursementRequestTransformer = (
  reimbursementRequest: Prisma.Reimbursement_RequestGetPayload<BaseReimbursementRequestQueryArgs>
): BaseReimbursementRequest => {
  // the query returns statuses oldest first
  const statusTypes = reimbursementRequest.reimbursementStatuses.map((status) => status.type as ReimbursementStatusType);
  return {
    reimbursementRequestId: reimbursementRequest.reimbursementRequestId,
    identifier: reimbursementRequest.identifier,
    saboId: reimbursementRequest.saboId ?? undefined,
    dateCreated: reimbursementRequest.dateCreated,
    description: reimbursementRequest.description,
    totalCost: reimbursementRequest.totalCost,
    recipient: baseUserTransformer(reimbursementRequest.recipient),
    statusTypes,
    // every request is created with a status, so there's always one
    currentStatus: statusTypes[statusTypes.length - 1] ?? ReimbursementStatusType.PENDING_LEADERSHIP_APPROVAL
  };
};

/** When a request was marked SABO submitted, from statuses selected with reimbursementStatusesWithDatesSelect */
export const dateSubmittedToSaboOf = (statuses: { type: string; dateCreated: Date }[]): Date | undefined =>
  statuses.find((status) => status.type === ReimbursementStatusType.SABO_SUBMITTED)?.dateCreated;

export const reimbursementProductReasonPreviewTransformer = (
  reason: Prisma.Reimbursement_Product_ReasonGetPayload<BaseReimbursementProductReasonQueryArgs>
): ReimbursementProductReasonPreview =>
  reason.wbsElement
    ? { wbsName: reason.wbsElement.name, wbsNum: wbsNumOf(reason.wbsElement) }
    : { otherProductReasonId: reason.otherReason!.otherReimbursementProductReasonId, name: reason.otherReason!.name };

export const reimbursementRequestTableItemTransformer = (
  reimbursementRequest: Prisma.Reimbursement_RequestGetPayload<ReimbursementRequestTableItemQueryArgs>
): ReimbursementRequestTableItem => ({
  ...baseReimbursementRequestTransformer(reimbursementRequest),
  dateSubmittedToSabo: dateSubmittedToSaboOf(reimbursementRequest.reimbursementStatuses),
  assignee: reimbursementRequest.assignee ? baseUserTransformer(reimbursementRequest.assignee) : undefined,
  reimbursementProducts: reimbursementRequest.reimbursementProducts.map((product) => ({
    name: product.name ?? undefined,
    reimbursementProductReason: reimbursementProductReasonPreviewTransformer(product.reimbursementProductReason)
  }))
});

export const accountCodeTransformer = (accountCode: Prisma.Account_CodeGetPayload<AccountCodeQueryArgs>): AccountCode => {
  return {
    ...accountCode,
    amount: accountCode.amount ?? undefined,
    indexCodes: accountCode.indexCodes.map(indexCodeTransformer)
  };
};

export const vendorTransformer = (vendor: Prisma.VendorGetPayload<VendorQueryArgs>): Vendor => {
  return {
    ...vendor,
    password: vendor.password ? decrypt(vendor.password) : undefined,
    discountCode: vendor.discountCode ? vendor.discountCode : undefined,
    username: vendor.username ? vendor.username : undefined,
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
