import { Receipt, Reimbursement, ReimbursementProduct, ReimbursementRequest, ReimbursementStatus, Vendor } from 'shared';

const reimbursementStatusTransformer = (status: ReimbursementStatus) => {
  return {
    ...status,
    dateCreated: new Date(status.dateCreated)
  };
};

const vendorTransformer = (vendor: Vendor) => {
  return {
    ...vendor,
    dateCreated: new Date(vendor.dateCreated)
  };
};

const receiptTransformer = (receipt: Receipt) => {
  return {
    ...receipt,
    dateDeleted: receipt.dateDeleted ? new Date(receipt.dateDeleted) : undefined
  };
};

const reimbursementProductTransformer = (product: ReimbursementProduct) => {
  return {
    ...product,
    dateDeleted: product.dateDeleted ? new Date(product.dateDeleted) : undefined
  };
};

export const reimbursementRequestTransformer = (request: ReimbursementRequest) => {
  return {
    ...request,
    dateCreated: new Date(request.dateCreated),
    dateDeleted: request.dateDeleted ? new Date(request.dateDeleted) : undefined,
    dateOfExpense: new Date(request.dateOfExpense),
    reimbursementStatuses: request.reimbursementStatuses.map(reimbursementStatusTransformer),
    vendor: vendorTransformer(request.vendor),
    receiptPictures: request.receiptPictures.map(receiptTransformer),
    reimbursementProducts: request.reimbursementProducts.map(reimbursementProductTransformer),
    dateDelivered: request.dateDelivered ? new Date(request.dateDelivered) : undefined
  };
};

export const reimbursementTransformer = (reimbursement: Reimbursement) => {
  return {
    ...reimbursement,
    dateCreated: new Date(reimbursement.dateCreated)
  };
};
