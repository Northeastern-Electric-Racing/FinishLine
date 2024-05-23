import { Prisma } from '@prisma/client';
import { Task } from 'shared';
import { wbsNumOf } from '../utils/utils';
import { convertTaskPriority, convertTaskStatus } from '../utils/tasks.utils';
import { userTransformer } from './user.transformer';
import { TaskQueryArgs } from '../prisma-query-args/tasks.query-args';

const taskTransformer = (task: Prisma.TaskGetPayload<TaskQueryArgs>): Task => {
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
    assignees: task.assignees.map(userTransformer),
    dateDeleted: task.dateDeleted ?? undefined,
    dateCreated: task.dateCreated,
    deletedBy: task.deletedBy ? userTransformer(task.deletedBy) : undefined
  };
};

export default taskTransformer;
