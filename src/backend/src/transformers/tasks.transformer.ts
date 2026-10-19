import { Prisma } from '@prisma/client';
import {
  BaseTask,
  BlockingWorkPackagePreview,
  Task,
  TaskBlockerPreview,
  TaskBoardItem,
  TaskHomeCard,
  TaskLabel
} from 'shared';
import { wbsNumOf } from '../utils/utils.js';
import { convertTaskPriority, convertTaskStatus } from '../utils/tasks.utils.js';
import { baseUserTransformer, userPreviewWithEmailTransformer } from './user.transformer.js';
import {
  BaseTaskQueryArgs,
  TaskBoardItemQueryArgs,
  TaskHomeCardQueryArgs,
  TaskLabelQueryArgs,
  TaskQueryArgs,
  TaskBlockedByQueryArgs,
  TaskBlockingWorkPackagesQueryArgs,
  BlockingWorkPackagesQueryArgs
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
 * Only surfaces a blocking work package if it still has at least one non-done task
 * @deprecated Use taskBlockingWorkPackagesTransformer. Still used by taskTransformer until projects is refactored
 */
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
 * Used by task creation so "can this task be done" is answered in exactly one place.
 */
export const getActiveTaskBlockerNames = (
  blockedBy: Pick<TaskBlockerPreview, 'title' | 'status'>[],
  workPackage: Prisma.Work_PackageGetPayload<TaskBlockingWorkPackagesQueryArgs> | null
): string[] => [
  ...blockedBy.filter((blocker) => blocker.status !== 'DONE').map((blocker) => blocker.title),
  ...taskBlockingWorkPackagesTransformer(workPackage).map((wp) => wp.name)
];

export const baseTaskTransformer = (task: Prisma.TaskGetPayload<BaseTaskQueryArgs>): BaseTask => ({
  taskId: task.taskId,
  wbsNum: wbsNumOf(task.wbsElement),
  title: task.title,
  notes: task.notes,
  status: convertTaskStatus(task.status),
  priority: convertTaskPriority(task.priority),
  deadline: task.deadline ?? undefined,
  assignees: task.assignees.map(baseUserTransformer),
  labels: task.labels.map(taskLabelTransformer)
});

export const taskBoardItemTransformer = (task: Prisma.TaskGetPayload<TaskBoardItemQueryArgs>): TaskBoardItem => ({
  ...baseTaskTransformer(task),
  startDate: task.startDate ?? undefined,
  wbsName: task.wbsElement.name,
  createdBy: baseUserTransformer(task.createdBy),
  blockedBy: task.blockedBy.map(taskBlockedByTransformer),
  blockedByWorkPackages: taskBlockingWorkPackagesTransformer(task.wbsElement.workPackage),
  projectLeadId: task.wbsElement.leadId ?? undefined,
  projectManagerId: task.wbsElement.managerId ?? undefined
});

// the name of the project a task belongs to, whether it hangs off the project itself or one of its work packages
const taskProjectName = (wbsElement: { name: string; workPackage: { project: { wbsElement: { name: string } } } | null }) =>
  wbsElement.workPackage?.project.wbsElement.name ?? wbsElement.name;

export const taskHomeCardTransformer = (task: Prisma.TaskGetPayload<TaskHomeCardQueryArgs>): TaskHomeCard => ({
  ...baseTaskTransformer(task),
  projectName: taskProjectName(task.wbsElement)
});

/** @deprecated Use baseTaskTransformer or a per-endpoint model's transformer. Still used by projects.transformer.ts until projects is refactored */
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

export const taskLabelTransformer = (label: Prisma.Task_LabelGetPayload<TaskLabelQueryArgs>): TaskLabel => ({
  taskLabelId: label.taskLabelId,
  name: label.name,
  colorHexCode: label.colorHexCode
});

export default taskTransformer;
