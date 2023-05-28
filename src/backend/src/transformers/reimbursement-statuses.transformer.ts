import { Prisma } from '@prisma/client';
import { ReimbursementStatus } from 'shared';
import reimbursementStatusQueryArgs from '../prisma-query-args/reimbursement-statuses.query-args';
import userTransformer from './user.transformer';

const reimbursementStatusTransformer = (
  reimbursementStatus: Prisma.Reimbursement_StatusGetPayload<typeof reimbursementStatusQueryArgs>
): ReimbursementStatus => {
  return {
    reimbursementStatusId: reimbursementStatus.reimbursementStatusId,
    type: reimbursementStatus.type,
    user: userTransformer(reimbursementStatus.user),
    dateCreated: reimbursementStatus.dateCreated,
    reimbursementRequestId: reimbursementStatus.reimbursementRequestId
  };
};

export default reimbursementStatusTransformer;
