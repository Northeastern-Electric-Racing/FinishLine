import { ReimbursementProduct, ReimbursementRequest, ReimbursementStatusType, wbsPipe } from 'shared';

export const getUniqueWbsElementsWithProductsFromReimbursementRequest = (
  reimbursementRequest: ReimbursementRequest
): Map<string, ReimbursementProduct[]> => {
  const uniqueWbsElementsWithProducts = new Map<string, ReimbursementProduct[]>();
  reimbursementRequest.reimbursementProducts.forEach((product) => {
    const wbs = wbsPipe(product.wbsNum);
    if (uniqueWbsElementsWithProducts.has(wbs)) {
      const products = uniqueWbsElementsWithProducts.get(wbs);
      products?.push(product);
    } else {
      uniqueWbsElementsWithProducts.set(wbs, [product]);
    }
  });
  return uniqueWbsElementsWithProducts;
};

export const cleanReimbursementRequestStatus = (status: ReimbursementStatusType) => {
  switch (status) {
    case ReimbursementStatusType.ADVISOR_APPROVED: {
      return 'Advisor Approved';
    }
    case ReimbursementStatusType.PENDING_FINANCE: {
      return 'Pending Finance Team';
    }
    case ReimbursementStatusType.REIMBURSED: {
      return 'Reimbursed';
    }
    case ReimbursementStatusType.SABO_SUBMITTED: {
      return 'Submitted to Sabo';
    }
  }
};
