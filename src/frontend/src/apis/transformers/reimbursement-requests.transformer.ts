/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { Receipt, Reimbursement, ReimbursementProduct, ReimbursementRequest, ReimbursementStatus, Vendor } from 'shared';

const reimbursementStatusTransformer = (status: ReimbursementStatus): ReimbursementStatus => {
  return {
    ...status,
    dateCreated: new Date(status.dateCreated)
  };
};

export const vendorTransformer = (vendor: Vendor): Vendor => {
  return {
    ...vendor,
    dateCreated: new Date(vendor.dateCreated)
  };
};

const receiptTransformer = (receipt: Receipt): Receipt => {
  return {
    ...receipt
  };
};

const reimbursementProductTransformer = (product: ReimbursementProduct): ReimbursementProduct => {
  return {
    ...product
  };
};

export const reimbursementRequestTransformer = (request: ReimbursementRequest): ReimbursementRequest => {
  return {
    ...request,
    dateCreated: new Date(request.dateCreated),
    dateOfExpense: request.dateOfExpense ? new Date(request.dateOfExpense) : undefined,
    reimbursementStatuses: request.reimbursementStatuses.map(reimbursementStatusTransformer),
    vendor: vendorTransformer(request.vendor),
    receiptPictures: request.receiptPictures.map(receiptTransformer),
    reimbursementProducts: request.reimbursementProducts.map(reimbursementProductTransformer),
    dateDelivered: request.dateDelivered ? new Date(request.dateDelivered) : undefined
  };
};

export const reimbursementTransformer = (reimbursement: Reimbursement): Reimbursement => {
  return {
    ...reimbursement,
    dateCreated: new Date(reimbursement.dateCreated)
  };
};
