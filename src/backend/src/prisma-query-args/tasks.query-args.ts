import { Prisma } from '@prisma/client';
import { getBaseUserQueryArgs, getUserPreviewWithEmailQueryArgs } from './user.query-args.js';

export type BaseTaskQueryArgs = ReturnType<typeof getBaseTaskQueryArgs>;
export type TaskBoardItemQueryArgs = ReturnType<typeof getTaskBoardItemQueryArgs>;
export type TaskHomeCardQueryArgs = ReturnType<typeof getTaskHomeCardQueryArgs>;
export type TaskBlockingWorkPackagesQueryArgs = ReturnType<typeof getTaskBlockingWorkPackagesQueryArgs>;
/** @deprecated Use BaseTaskQueryArgs or a per-endpoint model's query args. Still used by projects.query-args.ts until projects is refactored */
export type TaskQueryArgs = ReturnType<typeof getTaskQueryArgs>;
export type TaskLabelQueryArgs = ReturnType<typeof getTaskLabelQueryArgs>;
export type TaskBlockedByQueryArgs = ReturnType<typeof getTaskBlockedByQueryArgs>;
/** @deprecated Use TaskBlockingWorkPackagesQueryArgs. Still used by getTaskQueryArgs until projects is refactored */
export type BlockingWorkPackagesQueryArgs = ReturnType<typeof getBlockingWorkPackagesArgs>;

export const getTaskLabelQueryArgs = () =>
  Prisma.validator<Prisma.Task_LabelDefaultArgs>()({
    select: {
      taskLabelId: true,
      name: true,
      colorHexCode: true
    }
  });

export const getTaskBlockedByQueryArgs = () =>
  Prisma.validator<Prisma.TaskFindManyArgs>()({
    where: { dateDeleted: null },
    select: {
      taskId: true,
      title: true,
      status: true
    }
  });

export const getBaseTaskQueryArgs = () =>
  Prisma.validator<Prisma.TaskDefaultArgs>()({
    select: {
      taskId: true,
      title: true,
      notes: true,
      status: true,
      priority: true,
      deadline: true,
      // a task is meaningless without the wbs element it belongs to; every consumer navigates by it
      wbsElement: { select: { carNumber: true, projectNumber: true, workPackageNumber: true } },
      assignees: getBaseUserQueryArgs(),
      labels: getTaskLabelQueryArgs()
    }
  });

// the work packages (if any) that a work package is blocked by, along with how many of their tasks are still unfinished
export const getTaskBlockingWorkPackagesQueryArgs = () =>
  Prisma.validator<Prisma.Work_PackageDefaultArgs>()({
    select: {
      blockedBy: {
        select: {
          carNumber: true,
          projectNumber: true,
          workPackageNumber: true,
          name: true,
          _count: { select: { tasks: { where: { dateDeleted: null, status: { not: 'DONE' } } } } }
        }
      }
    }
  });

export const getTaskBoardItemQueryArgs = () =>
  Prisma.validator<Prisma.TaskDefaultArgs>()({
    select: {
      ...getBaseTaskQueryArgs().select,
      startDate: true,
      wbsElement: {
        select: {
          carNumber: true,
          projectNumber: true,
          workPackageNumber: true,
          name: true,
          leadId: true,
          managerId: true,
          // null when the task hangs off a project rather than a work package
          workPackage: getTaskBlockingWorkPackagesQueryArgs()
        }
      },
      createdBy: getBaseUserQueryArgs(),
      blockedBy: getTaskBlockedByQueryArgs()
    }
  });

export const getTaskHomeCardQueryArgs = () =>
  Prisma.validator<Prisma.TaskDefaultArgs>()({
    select: {
      ...getBaseTaskQueryArgs().select,
      wbsElement: {
        select: {
          carNumber: true,
          projectNumber: true,
          workPackageNumber: true,
          // enough to name the task's project: a project's tasks hang off the project's own wbs element (so its
          // name is the project name), while a work package's tasks need to go one hop further up
          name: true,
          workPackage: { select: { project: { select: { wbsElement: { select: { name: true } } } } } }
        }
      }
    }
  });

/**
 * The work package (if any) that this task's own work package is blocked by, along with just enough
 * of its tasks to tell whether it's still incomplete
 * @deprecated Use getTaskBlockingWorkPackagesQueryArgs. Still used by getTaskQueryArgs until projects is refactored
 */
export const getBlockingWorkPackagesArgs = () =>
  Prisma.validator<Prisma.WBS_ElementDefaultArgs>()({
    include: {
      workPackage: {
        select: {
          blockedBy: {
            select: {
              carNumber: true,
              projectNumber: true,
              workPackageNumber: true,
              name: true,
              tasks: { where: { dateDeleted: null }, select: { status: true } }
            }
          }
        }
      }
    }
  });

/** @deprecated Use getBaseTaskQueryArgs or a per-endpoint model's query args. Still used by projects.query-args.ts (Project, ProjectGantt) until projects is refactored */
export const getTaskQueryArgs = () =>
  Prisma.validator<Prisma.TaskDefaultArgs>()({
    include: {
      wbsElement: getBlockingWorkPackagesArgs(),
      createdBy: getUserPreviewWithEmailQueryArgs(),
      deletedBy: getUserPreviewWithEmailQueryArgs(),
      assignees: getUserPreviewWithEmailQueryArgs(),
      labels: getTaskLabelQueryArgs(),
      blockedBy: getTaskBlockedByQueryArgs()
    }
  });
