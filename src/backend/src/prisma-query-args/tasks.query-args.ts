import { Prisma } from '@prisma/client';
import { getUserPreviewWithEmailQueryArgs, getUserQueryArgs } from './user.query-args.js';

export type TaskQueryArgs = ReturnType<typeof getTaskQueryArgs>;
export type TaskGanttQueryArgs = ReturnType<typeof getTaskGanttQueryArgs>;
export type TaskPreviewQueryArgs = ReturnType<typeof getTaskPreviewQueryArgs>;
export type CalendarTaskQueryArgs = ReturnType<typeof getCalendarTaskQueryArgs>;
export type TaskLabelQueryArgs = ReturnType<typeof getTaskLabelQueryArgs>;
export type TaskBlockedByQueryArgs = ReturnType<typeof getTaskBlockedByQueryArgs>;
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

// the work package (if any) that this task's own work package is blocked by, along with just enough
// of its tasks to tell whether it's still incomplete
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

// same output as getTaskQueryArgs through taskTransformer for non-deleted tasks (the gantt only loads those, so
// deletedBy is skipped), and only fetches the wbs element fields taskTransformer reads
export const getTaskGanttQueryArgs = () =>
  Prisma.validator<Prisma.TaskDefaultArgs>()({
    include: {
      createdBy: getUserPreviewWithEmailQueryArgs(),
      assignees: getUserPreviewWithEmailQueryArgs(),
      labels: getTaskLabelQueryArgs(),
      blockedBy: getTaskBlockedByQueryArgs(),
      wbsElement: {
        select: {
          carNumber: true,
          projectNumber: true,
          workPackageNumber: true,
          name: true,
          workPackage: getBlockingWorkPackagesArgs().include.workPackage
        }
      }
    }
  });

export const getCalendarTaskQueryArgs = () =>
  Prisma.validator<Prisma.TaskDefaultArgs>()({
    include: {
      wbsElement: {
        select: {
          wbsElementId: true,
          carNumber: true,
          projectNumber: true,
          workPackageNumber: true,
          organizationId: true,
          dateDeleted: true,
          leadId: true,
          managerId: true,
          name: true,
          workPackage: getBlockingWorkPackagesArgs().include.workPackage
        }
      },
      createdBy: getUserPreviewWithEmailQueryArgs(),
      assignees: getUserPreviewWithEmailQueryArgs(),
      labels: getTaskLabelQueryArgs(),
      blockedBy: getTaskBlockedByQueryArgs()
    }
  });

export const getTaskPreviewQueryArgs = (organizationId: string) =>
  Prisma.validator<Prisma.TaskDefaultArgs>()({
    include: {
      wbsElement: {
        include: {
          project: {
            select: {
              projectId: true,
              wbsElement: {
                select: {
                  name: true
                }
              }
            }
          }
        }
      },
      createdBy: getUserQueryArgs(organizationId),
      assignees: getUserQueryArgs(organizationId)
    }
  });
