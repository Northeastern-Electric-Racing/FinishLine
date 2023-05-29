import { Prisma } from '@prisma/client';
import { ReimbursementProduct } from 'shared';
import reimbursementProductQueryArgs from '../prisma-query-args/reimbursement-products.query-args';
import { wbsNumOf } from '../utils/utils';

const reimbursementProductTransformer = (
  reimbursementProduct: Prisma.Reimbursement_ProductGetPayload<typeof reimbursementProductQueryArgs>
): ReimbursementProduct => {
  return {
    reimbursementProductId: reimbursementProduct.reimbursementProductId,
    name: reimbursementProduct.name,
    dateDeleted: reimbursementProduct.dateDeleted ?? undefined,
    cost: reimbursementProduct.cost,
    wbsNum: wbsNumOf(reimbursementProduct.wbsElement),
    wbsName: reimbursementProduct.wbsElement.name
  };
};

export default reimbursementProductTransformer;
