import { Prisma } from '@prisma/client';
import { BlockingWorkPackagePreview, CalendarTask, Task, TaskBlockerPreview, TaskCardPreview, TaskLabel } from 'shared';
import { wbsNumOf } from '../utils/utils.js';
import { convertTaskPriority, convertTaskStatus } from '../utils/tasks.utils.js';
import { userPreviewWithEmailTransformer } from './user.transformer.js';
import {
  CalendarTaskQueryArgs,
  TaskLabelQueryArgs,
  TaskQueryArgs,
  TaskPreviewQueryArgs,
  TaskBlockedByQueryArgs,
  BlockingWorkPackagesQueryArgs
} from '../prisma-query-args/tasks.query-args.js';

export const taskBlockedByTransformer = (task: Prisma.TaskGetPayload<TaskBlockedByQueryArgs>): TaskBlockerPreview => ({
  taskId: task.taskId,
  title: task.title,
  status: convertTaskStatus(task.status)
});

// only surfaces a blocking work package if it still has at least one non-done task
export const getBlockingWorkPackagePreviews = (
  wbsElement: Pick<Prisma.WBS_ElementGetPayload<BlockingWorkPackagesQueryArgs>, 'workPackage'>
): BlockingWorkPackagePreview[] =>
  (wbsElement.workPackage?.blockedBy ?? [])
    .filter((blocker) => blocker.tasks.some((t) => t.status !== 'DONE'))
    .map((blocker) => ({
      wbsNum: wbsNumOf(blocker),
      name: blocker.name
    }));

/**
 * The names of everything currently, actively blocking a task from being marked done: any non-deleted,
 * non-done blocking task, plus any work package that still blocks this task's own work package.
 * Shared between task creation and status edits so "can this task be done" is answered in exactly one place.
 */
export const getActiveTaskBlockerNames = (
  blockedBy: Pick<TaskBlockerPreview, 'title' | 'status'>[],
  wbsElement: Pick<Prisma.WBS_ElementGetPayload<BlockingWorkPackagesQueryArgs>, 'workPackage'>
): string[] => [
  ...blockedBy.filter((blocker) => blocker.status !== 'DONE').map((blocker) => blocker.title),
  ...getBlockingWorkPackagePreviews(wbsElement).map((wp) => wp.name)
];

export const taskTransformer = (task: Prisma.TaskGetPayload<TaskQueryArgs>): Task => {
  const wbsNum = wbsNumOf(task.wbsElement);
  return {
    taskId: task.taskId,
    wbsNum,
    wbsName: task.wbsElement.name,
    title: task.title,
    notes: task.notes,
    deadline: task.deadline ?? undefined,
    startDate: task.startDate ?? undefined,
    priority: convertTaskPriority(task.priority),
    status: convertTaskStatus(task.status),
    createdBy: userPreviewWithEmailTransformer(task.createdBy),
    assignees: task.assignees.map(userPreviewWithEmailTransformer),
    labels: task.labels.map(taskLabelTransformer),
    blockedBy: task.blockedBy.map(taskBlockedByTransformer),
    blockedByWorkPackages: getBlockingWorkPackagePreviews(task.wbsElement),
    dateDeleted: task.dateDeleted ?? undefined,
    dateCreated: task.dateCreated,
    deletedBy: task.deletedBy ? userPreviewWithEmailTransformer(task.deletedBy) : undefined
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

export const calendarTaskTransformer = (task: Prisma.TaskGetPayload<CalendarTaskQueryArgs>): CalendarTask => {
  const wbsNum = wbsNumOf(task.wbsElement);
  return {
    taskId: task.taskId,
    wbsNum,
    wbsName: task.wbsElement.name,
    title: task.title,
    notes: task.notes,
    deadline: task.deadline ?? undefined,
    startDate: task.startDate ?? undefined,
    priority: convertTaskPriority(task.priority),
    status: convertTaskStatus(task.status),
    createdBy: userPreviewWithEmailTransformer(task.createdBy),
    assignees: task.assignees.map(userPreviewWithEmailTransformer),
    labels: task.labels.map(taskLabelTransformer),
    blockedBy: task.blockedBy.map(taskBlockedByTransformer),
    blockedByWorkPackages: getBlockingWorkPackagePreviews(task.wbsElement),
    dateDeleted: task.dateDeleted ?? undefined,
    dateCreated: task.dateCreated,
    projectLeadId: task.wbsElement.leadId ?? undefined,
    projectManagerId: task.wbsElement.managerId ?? undefined
  };
};

export const taskLabelTransformer = (label: Prisma.Task_LabelGetPayload<TaskLabelQueryArgs>): TaskLabel => ({
  taskLabelId: label.taskLabelId,
  name: label.name,
  colorHexCode: label.colorHexCode
});

export default taskTransformer;
