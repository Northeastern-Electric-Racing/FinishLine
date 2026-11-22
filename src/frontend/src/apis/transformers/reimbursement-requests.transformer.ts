/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import {
  BaseReimbursementRequest,
  Reimbursement,
  ReimbursementRequestData,
  ReimbursementRequestDetail,
  ReimbursementRequestExportRow,
  ReimbursementRequestTableItem,
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
  dateCreated: new Date(request.dateCreated)
});

const optionalDate = (date?: Date) => (date ? new Date(date) : undefined);

export const reimbursementRequestTableItemTransformer = (
  request: ReimbursementRequestTableItem
): ReimbursementRequestTableItem => ({
  ...baseReimbursementRequestTransformer(request),
  dateSubmittedToSabo: optionalDate(request.dateSubmittedToSabo)
});

export const reimbursementRequestDetailTransformer = (request: ReimbursementRequestDetail): ReimbursementRequestDetail => ({
  ...baseReimbursementRequestTransformer(request),
  dateOfExpense: optionalDate(request.dateOfExpense),
  dateDelivered: optionalDate(request.dateDelivered),
  comments: request.comments.map((comment) => ({ ...comment, dateCreated: new Date(comment.dateCreated) }))
});

export const reimbursementRequestExportRowTransformer = (
  request: ReimbursementRequestExportRow
): ReimbursementRequestExportRow => ({
  ...baseReimbursementRequestTransformer(request),
  dateDelivered: optionalDate(request.dateDelivered),
  dateSubmittedToSabo: optionalDate(request.dateSubmittedToSabo)
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
