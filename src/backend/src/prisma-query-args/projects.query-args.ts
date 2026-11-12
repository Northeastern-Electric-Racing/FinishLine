import { Prisma, Task_Status, WBS_Element_Status } from '@prisma/client';
import { getBaseUserQueryArgs } from './user.query-args.js';
import { getBaseWorkPackageQueryArgs } from './work-packages.query-args.js';

export type BaseProjectQueryArgs = ReturnType<typeof getBaseProjectQueryArgs>;
export type ProjectListItemQueryArgs = ReturnType<typeof getProjectListItemQueryArgs>;
export type ProjectOverviewCardQueryArgs = ReturnType<typeof getProjectOverviewCardQueryArgs>;
export type DesignReviewMarkerQueryArgs = ReturnType<typeof getDesignReviewMarkerQueryArgs>;

// the minimum every consumer of a project needs: what it is, who owns it, its teams, and when it runs
export const getBaseProjectQueryArgs = () =>
  Prisma.validator<Prisma.ProjectDefaultArgs>()({
    select: {
      projectId: true,
      wbsElementId: true,
      budget: true,
      abbreviation: true,
      // guest and team project cards show it; having it here saves them a fetch per card
      summary: true,
      // a project is its wbs element. No dateCreated/dateDeleted: every query returning this filters deleted projects out
      wbsElement: {
        select: {
          carNumber: true,
          projectNumber: true,
          workPackageNumber: true,
          name: true,
          lead: getBaseUserQueryArgs(),
          manager: getBaseUserQueryArgs()
        }
      },
      // one or two per project; the projects table, gantt grouping, and detail page all show them
      teams: { select: { teamId: true, teamName: true } },
      // a project's status, start, end, and duration are all derived from its work packages, at 2 nodes each
      workPackages: {
        where: { wbsElement: { dateDeleted: null } },
        select: { startDate: true, duration: true, stage: true, wbsElement: { select: { status: true } } }
      }
    }
  });

// the all-projects list: the projects table, every project picker, the guest projects page, team pages, and featured projects
export const getProjectListItemQueryArgs = () =>
  Prisma.validator<Prisma.ProjectDefaultArgs>()({
    select: {
      ...getBaseProjectQueryArgs().select,
      // the guest projects page filters by team type
      teams: { select: { teamId: true, teamName: true, teamType: { select: { teamTypeId: true, name: true } } } }
    }
  });

// a task that still needs doing
const remainingTaskWhere: Prisma.TaskWhereInput = { dateDeleted: null, status: { not: Task_Status.DONE } };

// the projects page overview cards: leading, my teams, and favorites
export const getProjectOverviewCardQueryArgs = () =>
  Prisma.validator<Prisma.ProjectDefaultArgs>()({
    select: {
      ...getBaseProjectQueryArgs().select,
      wbsElement: {
        select: {
          ...getBaseProjectQueryArgs().select.wbsElement.select,
          links: {
            where: { dateDeleted: null },
            select: { linkId: true, url: true, linkType: { select: { name: true, iconName: true } } }
          },
          _count: { select: { tasks: { where: remainingTaskWhere } } }
        }
      },
      // the card lists the active ones; all of them are still needed for the project's status and dates
      workPackages: {
        where: { wbsElement: { dateDeleted: null } },
        select: {
          ...getBaseWorkPackageQueryArgs().select,
          wbsElement: {
            select: {
              ...getBaseWorkPackageQueryArgs().select.wbsElement.select,
              // tasks on a work package count toward the project's tasks left too
              _count: { select: { tasks: { where: remainingTaskWhere } } }
            }
          }
        }
      }
    }
  });

// a design review shown as a marker on a work package's gantt bar
export const getDesignReviewMarkerQueryArgs = () =>
  Prisma.validator<Prisma.EventDefaultArgs>()({
    select: {
      eventId: true,
      status: true,
      initialDateScheduled: true,
      scheduledTimes: { select: { startTime: true }, orderBy: { startTime: 'asc' } }
    }
  });

// a project is complete once it has work packages and every one of them is complete, so the ones the gantt charts show
// have no work packages or at least one that isn't complete (matches calculateProjectStatus)
export const notCompleteProjectWhere: Prisma.ProjectWhereInput = {
  OR: [
    { workPackages: { none: { wbsElement: { dateDeleted: null } } } },
    { workPackages: { some: { wbsElement: { dateDeleted: null, status: { not: WBS_Element_Status.COMPLETE } } } } }
  ]
};
