import { Prisma } from '@prisma/client';
import { getUserPreviewQueryArgs } from './user.query-args.js';
import { getTaskGanttQueryArgs } from './tasks.query-args.js';

// Base gantt chart query: only what the gantt chart reads (see the GanttChart* types in shared).
// Other gantt views (e.g. retrospective) can extend these instead of starting from the full project query.

export type GanttChartEventQueryArgs = ReturnType<typeof getGanttChartEventQueryArgs>;
export type GanttChartWorkPackageQueryArgs = ReturnType<typeof getGanttChartWorkPackageQueryArgs>;
export type GanttChartProjectQueryArgs = ReturnType<typeof getGanttChartProjectQueryArgs>;

const wbsNumberSelect = { carNumber: true, projectNumber: true, workPackageNumber: true } as const;

export const getGanttChartEventQueryArgs = () =>
  Prisma.validator<Prisma.EventDefaultArgs>()({
    select: {
      eventId: true,
      status: true,
      initialDateScheduled: true,
      // the event marker shows one date, so just fetch the earliest slot
      scheduledTimes: { select: { startTime: true }, orderBy: { startTime: 'asc' }, take: 1 }
    }
  });

export const getGanttChartWorkPackageQueryArgs = () =>
  Prisma.validator<Prisma.Work_PackageDefaultArgs>()({
    select: {
      workPackageId: true,
      wbsElementId: true,
      projectId: true,
      startDate: true,
      duration: true,
      stage: true,
      wbsElement: {
        select: {
          ...wbsNumberSelect,
          name: true,
          status: true,
          dateCreated: true,
          dateDeleted: true,
          lead: getUserPreviewQueryArgs(),
          manager: getUserPreviewQueryArgs(),
          blocking: { where: { wbsElement: { dateDeleted: null } }, select: { wbsElement: { select: wbsNumberSelect } } }
        }
      },
      events: { where: { dateDeleted: null }, ...getGanttChartEventQueryArgs() }
    }
  });

export const getGanttChartProjectQueryArgs = () =>
  Prisma.validator<Prisma.ProjectDefaultArgs>()({
    select: {
      projectId: true,
      wbsElementId: true,
      wbsElement: {
        select: {
          ...wbsNumberSelect,
          name: true,
          dateCreated: true,
          dateDeleted: true,
          lead: getUserPreviewQueryArgs(),
          manager: getUserPreviewQueryArgs(),
          tasks: {
            where: { dateDeleted: null },
            orderBy: [{ dateCreated: 'asc' }, { taskId: 'asc' }],
            ...getTaskGanttQueryArgs()
          }
        }
      },
      teams: { select: { teamId: true } },
      workPackages: {
        where: { wbsElement: { dateDeleted: null } },
        // orderInProject can repeat after a work package is deleted, so tie-break on the (unique per project) wp number
        orderBy: [{ orderInProject: 'asc' }, { wbsElement: { workPackageNumber: 'asc' } }],
        ...getGanttChartWorkPackageQueryArgs()
      }
    }
  });
