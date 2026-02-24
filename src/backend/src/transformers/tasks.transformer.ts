import { Prisma } from '@prisma/client';
import { Task, TaskCardPreview } from 'shared';
import { wbsNumOf } from '../utils/utils.js';
import { convertTaskPriority, convertTaskStatus } from '../utils/tasks.utils.js';
import { userTransformer } from './user.transformer.js';
import { TaskQueryArgs, TaskPreviewQueryArgs } from '../prisma-query-args/tasks.query-args.js';

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
    taskId: task.taskId,
    wbsNum: wbsNumOf(task.wbsElement),
    title: task.title,
    deadline: task.deadline ?? undefined,
    priority: convertTaskPriority(task.priority),
    assignees: task.assignees.map((assignee) => ({
      userId: assignee.userId,
      firstName: assignee.firstName,
      lastName: assignee.lastName
    })),
    projectName: task.wbsElement?.project?.wbsElement?.name || 'Unknown Project'
  };
};

export default taskTransformer;
