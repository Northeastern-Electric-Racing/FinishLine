import { Prisma } from '@prisma/client';
import { BaseTask, BlockingWorkPackagePreview, TaskBlockerPreview, TaskBoardItem, TaskHomeCard, TaskLabel } from 'shared';
import { wbsNumOf } from '../utils/utils.js';
import { convertTaskPriority, convertTaskStatus } from '../utils/tasks.utils.js';
import { baseUserTransformer } from './user.transformer.js';
import {
  BaseTaskQueryArgs,
  TaskBoardItemQueryArgs,
  TaskHomeCardQueryArgs,
  BaseTaskLabelQueryArgs,
  TaskBlockedByQueryArgs,
  TaskBlockingWorkPackagesQueryArgs
} from '../prisma-query-args/tasks.query-args.js';

export const taskBlockedByTransformer = (task: Prisma.TaskGetPayload<TaskBlockedByQueryArgs>): TaskBlockerPreview => ({
  taskId: task.taskId,
  title: task.title,
  status: convertTaskStatus(task.status)
});

// only surfaces a blocking work package if it still has at least one non-done task. The work package is null
// when the task hangs off a project, which nothing can block
export const taskBlockingWorkPackagesTransformer = (
  workPackage: Prisma.Work_PackageGetPayload<TaskBlockingWorkPackagesQueryArgs> | null
): BlockingWorkPackagePreview[] =>
  (workPackage?.blockedBy ?? [])
    .filter((blocker) => blocker._count.tasks > 0)
    .map((blocker) => ({
      wbsNum: wbsNumOf(blocker),
      name: blocker.name
    }));

/**
 * The names of everything currently, actively blocking a task from being marked done: any non-deleted,
 * non-done blocking task, plus any work package that still blocks this task's own work package.
 * Used by task creation so "can this task be done" is answered in exactly one place.
 */
export const getActiveTaskBlockerNames = (
  blockedBy: Pick<TaskBlockerPreview, 'title' | 'status'>[],
  workPackage: Prisma.Work_PackageGetPayload<TaskBlockingWorkPackagesQueryArgs> | null
): string[] => [
  ...blockedBy.filter((blocker) => blocker.status !== 'DONE').map((blocker) => blocker.title),
  ...taskBlockingWorkPackagesTransformer(workPackage).map((wp) => wp.name)
];

// the name of the project a task belongs to, whether it hangs off the project itself or one of its work packages
const taskProjectName = (wbsElement: { name: string; workPackage: { project: { wbsElement: { name: string } } } | null }) =>
  wbsElement.workPackage?.project.wbsElement.name ?? wbsElement.name;

export const baseTaskTransformer = (task: Prisma.TaskGetPayload<BaseTaskQueryArgs>): BaseTask => ({
  taskId: task.taskId,
  wbsNum: wbsNumOf(task.wbsElement),
  title: task.title,
  notes: task.notes,
  status: convertTaskStatus(task.status),
  priority: convertTaskPriority(task.priority),
  deadline: task.deadline ?? undefined,
  assignees: task.assignees.map(baseUserTransformer),
  labels: task.labels.map(baseTaskLabelTransformer)
});

export const taskBoardItemTransformer = (task: Prisma.TaskGetPayload<TaskBoardItemQueryArgs>): TaskBoardItem => ({
  ...baseTaskTransformer(task),
  startDate: task.startDate ?? undefined,
  wbsName: task.wbsElement.name,
  createdBy: baseUserTransformer(task.createdBy),
  blockedBy: task.blockedBy.map(taskBlockedByTransformer),
  blockedByWorkPackages: taskBlockingWorkPackagesTransformer(task.wbsElement.workPackage),
  projectLeadId: task.wbsElement.leadId ?? undefined,
  projectManagerId: task.wbsElement.managerId ?? undefined,
  projectName: taskProjectName(task.wbsElement)
});

export const taskHomeCardTransformer = (task: Prisma.TaskGetPayload<TaskHomeCardQueryArgs>): TaskHomeCard => ({
  ...baseTaskTransformer(task),
  projectName: taskProjectName(task.wbsElement)
});

export const baseTaskLabelTransformer = (label: Prisma.Task_LabelGetPayload<BaseTaskLabelQueryArgs>): TaskLabel => ({
  taskLabelId: label.taskLabelId,
  name: label.name,
  colorHexCode: label.colorHexCode
});
