import { Prisma } from '@prisma/client';
import { Task, TaskCardPreview } from 'shared';
import { wbsNumOf } from '../utils/utils';
import { convertTaskPriority, convertTaskStatus } from '../utils/tasks.utils';
import { userTransformer } from './user.transformer';
import { TaskQueryArgs, TaskPreviewQueryArgs } from '../prisma-query-args/tasks.query-args';

const taskTransformer = (task: Prisma.TaskGetPayload<TaskQueryArgs>): Task => {
  const wbsNum = wbsNumOf(task.wbsElement);
  return {
    taskId: task.taskId,
    wbsNum,
    title: task.title,
    notes: task.notes,
    deadline: task.deadline ?? undefined,
    startDate: task.startDate ?? undefined,
    priority: convertTaskPriority(task.priority),
    status: convertTaskStatus(task.status),
    createdBy: userTransformer(task.createdBy),
    assignees: task.assignees.map(userTransformer),
    dateDeleted: task.dateDeleted ?? undefined,
    dateCreated: task.dateCreated,
    deletedBy: task.deletedBy ? userTransformer(task.deletedBy) : undefined
  };
};

export const taskCardPreviewTransformer = (task: Prisma.TaskGetPayload<TaskPreviewQueryArgs>): TaskCardPreview => {
  return {
    ...task,
    priority: convertTaskPriority(task.priority),
    deadline: task.deadline ?? undefined
  };
};

export default taskTransformer;
