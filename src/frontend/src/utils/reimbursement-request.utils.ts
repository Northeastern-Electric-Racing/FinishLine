import { ReimbursementProduct, ReimbursementRequest, wbsPipe } from 'shared';

export interface ReimbursementRequestProps {
  reimbursementRequest: ReimbursementRequest;
}

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
