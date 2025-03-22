import { Prisma } from '@prisma/client';
import { getUserQueryArgs } from './user.query-args';
import { getIndexCodeQueryArgs } from './index-code.query-args';
import { getReimbursementProductQueryArgs } from './reimbursement-products.query-args';
import { getAccountCodeQueryArgs } from './account-code.query-args';

export type ReimbursementProductOtherReasonQueryArgs = ReturnType<typeof getReimbursementProductOtherReasonQueryArgs>;

export const getReimbursementProductOtherReasonQueryArgs = (organizationId: string) =>
  Prisma.validator<Prisma.Reimbursement_Product_Other_ReasonDefaultArgs>()({
    include: {
      userCreated: getUserQueryArgs(organizationId),
      reimbursementProductReasons: {
        include: {
          wbsElement: true,
          otherReason: true,
          reimbursementProduct: getReimbursementProductQueryArgs(organizationId)
        }
      },
      indexCode: getIndexCodeQueryArgs(organizationId),
      accountCodes: getAccountCodeQueryArgs(organizationId)
    }
  });
