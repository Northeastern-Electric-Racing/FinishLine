import { Prisma } from '@prisma/client';
import { getUserQueryArgs } from './user.query-args';
import { getDescriptionBulletQueryArgs } from './description-bullets.query-args';
import { getTeamPreviewQueryArgs } from './teams.query-args';
import { getTaskQueryArgs } from './tasks.query-args';
import { getWorkPackageQueryArgs } from './work-packages.query-args';
import { getLinkQueryArgs } from './links.query-args';

export type ProjectQueryArgs = ReturnType<typeof getProjectQueryArgs>;

export type ProjectManyQueryArgs = ReturnType<typeof getProjectManyQueryArgs>;

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

export const getProjectManyQueryArgs = (organizationId: string) =>
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
          },
          links: {
            where: {
              dateDeleted: null
            },
            ...getLinkQueryArgs()
          }
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
