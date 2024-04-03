import { Prisma } from '@prisma/client';
import { Task } from 'shared';
import { wbsNumOf } from '../utils/utils';
import taskQueryArgs from '../prisma-query-args/tasks.query-args';
import { convertTaskPriority, convertTaskStatus } from '../utils/tasks.utils';
import { userTransformer } from './user.transformer';

const taskTransformer = (task: Prisma.TaskGetPayload<typeof taskQueryArgs>): Task => {
  const wbsNum = wbsNumOf(task.wbsElement);
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

export default taskTransformer;
