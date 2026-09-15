import { Prisma } from '@prisma/client';
import { getUserQueryArgs } from './user.query-args.js';

export type ReimbursementRequestCommentQueryArgs = ReturnType<typeof getReimbursementRequestCommentQueryArgs>;

export const getReimbursementRequestCommentQueryArgs = (organizationId: string) =>
  Prisma.validator<Prisma.Reimbursement_Request_CommentDefaultArgs>()({
    include: {
      userCreated: getUserQueryArgs(organizationId)
    }
  });
