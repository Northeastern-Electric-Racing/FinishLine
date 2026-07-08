import { Prisma } from '@prisma/client';
import { getUserQueryArgs } from './user.query-args.js';

export type TaskQueryArgs = ReturnType<typeof getTaskQueryArgs>;
export type TaskPreviewQueryArgs = ReturnType<typeof getTaskPreviewQueryArgs>;
export type CalendarTaskQueryArgs = ReturnType<typeof getCalendarTaskQueryArgs>;
export type TaskLabelQueryArgs = ReturnType<typeof getTaskLabelQueryArgs>;

export const getTaskLabelQueryArgs = () =>
  Prisma.validator<Prisma.Task_LabelDefaultArgs>()({
    select: {
      taskLabelId: true,
      name: true,
      colorHexCode: true
    }
  });

export const getTaskQueryArgs = (organizationId: string) =>
  Prisma.validator<Prisma.TaskDefaultArgs>()({
    include: {
      wbsElement: true,
      createdBy: getUserQueryArgs(organizationId),
      deletedBy: getUserQueryArgs(organizationId),
      assignees: getUserQueryArgs(organizationId),
      labels: getTaskLabelQueryArgs()
    }
  });

export const getCalendarTaskQueryArgs = (organizationId: string) =>
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
          name: true
        }
      },
      createdBy: getUserQueryArgs(organizationId),
      deletedBy: getUserQueryArgs(organizationId),
      assignees: getUserQueryArgs(organizationId),
      labels: getTaskLabelQueryArgs()
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
