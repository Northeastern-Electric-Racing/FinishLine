import { Prisma, Task_Status } from '@prisma/client';
import { getBaseUserQueryArgs, getUserQueryArgs } from './user.query-args.js';
import { getDescriptionBulletQueryArgs } from './description-bullets.query-args.js';
import { getTeamPreviewQueryArgs } from './teams.query-args.js';
import { getTaskGanttItemQueryArgs, getTaskQueryArgs } from './tasks.query-args.js';
import { getLinkQueryArgs } from './links.query-args.js';
import {
  getWorkPackageGanttItemQueryArgs,
  getWorkPackageQueryArgs,
  getWorkPackagePreviewQueryArgs
} from './work-packages.query-args.js';
import { getBaseProjectQueryArgs } from './wbs-elements.query-args.js';

export type ProjectQueryArgs = ReturnType<typeof getProjectQueryArgs>;

export type ProjectPreviewQueryArgs = ReturnType<typeof getProjectPreviewQueryArgs>;

export type ProjectOverviewQueryArgs = ReturnType<typeof getProjectOverviewQueryArgs>;

export type ProjectGanttItemQueryArgs = ReturnType<typeof getProjectGanttItemQueryArgs>;

// exported (only all-gantt uses it) so the transformer can type its input
export const getProjectGanttItemQueryArgs = () =>
  Prisma.validator<Prisma.ProjectDefaultArgs>()({
    select: {
      ...getBaseProjectQueryArgs().select,
      wbsElement: {
        select: {
          ...getBaseProjectQueryArgs().select.wbsElement.select,
          lead: getBaseUserQueryArgs(),
          manager: getBaseUserQueryArgs(),
          tasks: {
            where: { dateDeleted: null },
            orderBy: [{ dateCreated: 'asc' }, { taskId: 'asc' }],
            ...getTaskGanttItemQueryArgs()
          }
        }
      },
      teams: { select: { teamId: true } },
      workPackages: {
        where: { wbsElement: { dateDeleted: null } },
        // orderInProject can repeat after a WP is deleted, so tie-break on the WP number (unique per project)
        orderBy: [{ orderInProject: 'asc' }, { wbsElement: { workPackageNumber: 'asc' } }],
        ...getWorkPackageGanttItemQueryArgs()
      }
    }
  });

export const getProjectQueryArgs = (organizationId: string) =>
  Prisma.validator<Prisma.ProjectDefaultArgs>()({
    include: {
      wbsElement: {
        include: {
          lead: getUserQueryArgs(organizationId),
          manager: getUserQueryArgs(organizationId),
          descriptionBullets: { where: { dateDeleted: null }, ...getDescriptionBulletQueryArgs(organizationId) },
          tasks: { where: { dateDeleted: null }, ...getTaskQueryArgs() },
          links: { where: { dateDeleted: null }, ...getLinkQueryArgs() },
          changes: {
            where: { changeRequest: { dateDeleted: null } },
            include: { implementer: getUserQueryArgs(organizationId), changeRequest: true }
          },
          organization: true
        }
      },
      teams: getTeamPreviewQueryArgs(organizationId),
      workPackages: {
        where: {
          wbsElement: {
            dateDeleted: null
          }
        },
        ...getWorkPackageQueryArgs(organizationId)
      },
      favoritedBy: getUserQueryArgs(organizationId)
    }
  });

export const getProjectPreviewQueryArgs = (organizationId: string) =>
  Prisma.validator<Prisma.ProjectDefaultArgs>()({
    select: {
      wbsElement: {
        select: {
          wbsElementId: true,
          carNumber: true,
          projectNumber: true,
          workPackageNumber: true,
          dateCreated: true,
          dateDeleted: true,
          name: true,
          lead: getUserQueryArgs(organizationId),
          manager: getUserQueryArgs(organizationId),
          status: true
        }
      },
      workPackages: {
        where: {
          wbsElement: {
            dateDeleted: null
          }
        },
        ...getWorkPackagePreviewQueryArgs()
      },
      projectId: true,
      budget: true,
      abbreviation: true,
      teams: {
        select: {
          teamType: {
            select: {
              teamTypeId: true,
              name: true
            }
          },
          teamId: true,
          teamName: true
        }
      }
    }
  });

export const getProjectOverviewQueryArgs = (organizationId: string) =>
  Prisma.validator<Prisma.ProjectDefaultArgs>()({
    select: {
      wbsElement: {
        select: {
          wbsElementId: true,
          carNumber: true,
          projectNumber: true,
          workPackageNumber: true,
          dateCreated: true,
          dateDeleted: true,
          name: true,
          lead: getUserQueryArgs(organizationId),
          manager: getUserQueryArgs(organizationId),
          status: true,
          links: getLinkQueryArgs(),
          _count: {
            select: {
              tasks: {
                where: { AND: [{ dateDeleted: null }, { NOT: { status: Task_Status.DONE } }] }
              }
            }
          }
        }
      },
      workPackages: {
        where: {
          wbsElement: {
            dateDeleted: null
          }
        },
        ...getWorkPackagePreviewQueryArgs()
      },
      projectId: true,
      budget: true,
      abbreviation: true,
      teams: {
        select: {
          teamType: {
            select: {
              teamTypeId: true,
              name: true
            }
          },
          teamId: true,
          teamName: true
        }
      }
    }
  });
