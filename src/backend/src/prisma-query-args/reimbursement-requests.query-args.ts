import { Prisma } from '@prisma/client';
import { getReimbursementStatusQueryArgs } from './reimbursement-statuses.query-args';
import { getVendorQueryArgs } from './vendor.query-args';
import { getUserQueryArgs } from './user.query-args';
import { getReceiptQueryArgs } from './receipt-query.args';
import { getReimbursementProductQueryArgs } from './reimbursement-products.query-args';
import { getIndexCodeQueryArgs } from './index-code.query-args';
import { getAccountCodeQueryArgs } from './account-code.query-args';

export type ReimbursementRequestQueryArgs = ReturnType<typeof getReimbursementRequestQueryArgs>;

export const getReimbursementRequestQueryArgs = (organizationId: string) =>
  Prisma.validator<Prisma.Reimbursement_RequestDefaultArgs>()({
    include: {
      recipient: getUserQueryArgs(organizationId),
      vendor: getVendorQueryArgs(organizationId),
      indexCode: getIndexCodeQueryArgs(organizationId),
      accountCode: getAccountCodeQueryArgs(organizationId),
      receiptPictures: getReceiptQueryArgs(organizationId),
      reimbursementStatuses: getReimbursementStatusQueryArgs(organizationId),
      reimbursementProducts: {
        where: {
          dateDeleted: null
        },
        ...getReimbursementProductQueryArgs(organizationId)
      },
      notificationSlackThreads: true
    }
  });
