/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import {
  BaseReimbursementRequest,
  Reimbursement,
  ReimbursementRequestData,
  ReimbursementRequestDetail,
  SpendingBarData,
  Vendor
} from 'shared';

export const vendorTransformer = (vendor: Vendor): Vendor => {
  return {
    ...vendor,
    dateCreated: new Date(vendor.dateCreated)
  };
};

/** Converts the dates on any reimbursement request model; extended models spread it and convert what they add */
export const baseReimbursementRequestTransformer = <T extends BaseReimbursementRequest>(request: T): T => ({
  ...request,
  dateCreated: new Date(request.dateCreated),
  dateOfExpense: request.dateOfExpense ? new Date(request.dateOfExpense) : undefined,
  dateDelivered: request.dateDelivered ? new Date(request.dateDelivered) : undefined,
  dateSubmittedToSabo: request.dateSubmittedToSabo ? new Date(request.dateSubmittedToSabo) : undefined,
  reimbursementStatuses: request.reimbursementStatuses.map((status) => ({
    ...status,
    dateCreated: new Date(status.dateCreated)
  }))
});

export const reimbursementRequestDetailTransformer = (request: ReimbursementRequestDetail): ReimbursementRequestDetail => ({
  ...baseReimbursementRequestTransformer(request),
  comments: request.comments.map((comment) => ({ ...comment, dateCreated: new Date(comment.dateCreated) }))
});

export const reimbursementTransformer = (reimbursement: Reimbursement): Reimbursement => {
  return {
    ...reimbursement,
    dateCreated: new Date(reimbursement.dateCreated)
  };
};

export const reimbursementRequestDataTransformer = (
  reimbursementRequestData: ReimbursementRequestData
): ReimbursementRequestData => {
  return {
    ...reimbursementRequestData
  };
};

export const spendingBarDataTransformer = (spendingBarData: SpendingBarData): SpendingBarData => {
  return {
    ...spendingBarData,
    data: spendingBarData.data.map((spend) => ({
      title: spend.title,
      spendingInfo: reimbursementRequestDataTransformer(spend.spendingInfo)
    }))
  };
};
