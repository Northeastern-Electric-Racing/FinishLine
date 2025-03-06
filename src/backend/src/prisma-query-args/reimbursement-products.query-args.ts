import { Prisma } from '@prisma/client';
import { getIndexCodeQueryArgs } from './index-code.query-args';
import { getUserQueryArgs } from './user.query-args';
import { getAccountCodeQueryArgs } from './account-code.query-args';

export type ReimbursementProductQueryArgs = ReturnType<typeof getReimbursementProductQueryArgs>;

export type ReimbursementProductReasonQueryArgs = ReturnType<typeof getReimbursementProductReasonQueryArgs>;

export const getReimbursementProductReasonQueryArgs = (organizationId: string) =>
  Prisma.validator<Prisma.Reimbursement_Product_ReasonDefaultArgs>()({
    include: {
      wbsElement: true,
      otherReason: {
        include: {
          userCreated: getUserQueryArgs(organizationId),
          indexCode: getIndexCodeQueryArgs(organizationId),
          accountCode: getAccountCodeQueryArgs(organizationId)
        }
      }
    }
  });

export const getReimbursementProductQueryArgs = (organizationId: string) =>
  Prisma.validator<Prisma.Reimbursement_ProductDefaultArgs>()({
    include: {
      reimbursementProductReason: getReimbursementProductReasonQueryArgs(organizationId)
    }
  });
