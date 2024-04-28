import { Prisma } from '@prisma/client';
import teamQueryArgs from './teams.query-args';

export const reimbursementProductReasonQueryArgs = Prisma.validator<Prisma.Reimbursement_Product_ReasonArgs>()({
  include: {
    wbsElement: {
      include: {
        project: {
          include: {
            teams: teamQueryArgs
          }
        }
      }
    }
  }
});

export const reimbursementProductQueryArgs = Prisma.validator<Prisma.Reimbursement_ProductArgs>()({
  include: {
    reimbursementProductReason: { ...reimbursementProductReasonQueryArgs }
  }
});
