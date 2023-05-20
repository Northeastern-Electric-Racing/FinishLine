import { Prisma } from '@prisma/client';
import { ReimbursementRequest } from 'shared';
import { wbsNumOf } from '../utils/utils';
import userTransformer from './user.transformer';

const reimbursementRequestTransformer = (
  reimbursementRequest: Prisma.reimbursementRequestGetPayload<typeof reimbursementRequestQueryArgs>
): ReimbursementRequest => {
  const wbsNum = wbsNumOf(reimbursementRequest.wbsElement);
  return {
    taskId: task.taskId,
    wbsNum,
    title: task.title,
    notes: task.notes,
    deadline: task.deadline,
    priority: convertTaskPriority(task.priority),
    status: convertTaskStatus(task.status),
    createdBy: userTransformer(task.createdBy),
    assignees: task.assignees,
    dateDeleted: task.dateDeleted ?? undefined,
    dateCreated: task.dateCreated,
    deletedBy: task.deletedBy ? userTransformer(task.deletedBy) : undefined
  };
};

export default reimbursementRequestTransformer;
