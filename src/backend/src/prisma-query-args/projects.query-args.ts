import { Prisma } from '@prisma/client';
import { getUserQueryArgs } from './user.query-args';
import { getDescriptionBulletQueryArgs } from './description-bullets.query-args';
import { getTeamPreviewQueryArgs } from './teams.query-args';
import { getTaskQueryArgs } from './tasks.query-args';
import { getLinkQueryArgs } from './links.query-args';
import { getWorkPackagePreviewQueryArgs, getWorkPackageQueryArgs } from './work-packages.query-args';

export type ProjectQueryArgs = ReturnType<typeof getProjectQueryArgs>;

export type ProjectGanttQueryArgs = ReturnType<typeof getProjectGanttQueryArgs>;

export type ProjectPreviewQueryArgs = ReturnType<typeof getProjectPreviewQueryArgs>;

export type ProjectOverviewQueryArgs = ReturnType<typeof getProjectOverviewQueryArgs>;

export const getProjectQueryArgs = (organizationId: string) =>
  Prisma.validator<Prisma.ProjectDefaultArgs>()({
    include: {
      wbsElement: {
        include: {
          lead: getUserQueryArgs(organizationId),
          manager: getUserQueryArgs(organizationId),
          descriptionBullets: { where: { dateDeleted: null }, ...getDescriptionBulletQueryArgs(organizationId) },
          tasks: { where: { dateDeleted: null }, ...getTaskQueryArgs(organizationId) },
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

export const getProjectGanttQueryArgs = (organizationId: string) =>
  Prisma.validator<Prisma.ProjectDefaultArgs>()({
    include: {
      wbsElement: {
        include: {
          lead: getUserQueryArgs(organizationId),
          manager: getUserQueryArgs(organizationId),
          tasks: {
            where: {
              dateDeleted: null
            },
            ...getTaskQueryArgs(organizationId)
          }
        }
      },
      teams: {
        select: {
          teamId: true,
          teamName: true
        }
      },
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
      workPackages: getWorkPackagePreviewQueryArgs(),
      projectId: true,
      budget: true,
      abbreviation: true,
      teams: {
        select: {
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
          tasks: getTaskQueryArgs(organizationId)
        }
      },
      workPackages: getWorkPackagePreviewQueryArgs(),
      projectId: true,
      budget: true,
      abbreviation: true,
      teams: {
        select: {
          teamId: true,
          teamName: true
        }
      }
    }
  });
