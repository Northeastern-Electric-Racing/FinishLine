import { Prisma } from '@prisma/client';
import { getReimbursementStatusQueryArgs } from './reimbursement-statuses.query-args.js';
import { getVendorQueryArgs } from './vendor.query-args.js';
import { getUserQueryArgs } from './user.query-args.js';
import { getReceiptQueryArgs } from './receipt-query.args.js';
import { getReimbursementProductQueryArgs } from './reimbursement-products.query-args.js';
import { getIndexCodeQueryArgs } from './index-code.query-args.js';
import { getAccountCodeQueryArgs } from './account-code.query-args.js';
import { getReimbursementRequestCommentQueryArgs } from './reimbursement-comment.query-args.js';

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
      notificationSlackThreads: true,
      reimbursementComments: {
        where: {
          dateDeleted: null
        },
        ...getReimbursementRequestCommentQueryArgs(organizationId)
      },
      assignee: getUserQueryArgs(organizationId)
    }
  });
