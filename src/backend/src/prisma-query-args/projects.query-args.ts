import { Prisma } from '@prisma/client';
import { getLinkQueryArgs } from './links.query-args';
import { getUserQueryArgs } from './user.query-args';
import { getDescriptionBulletQueryArgs } from './description-bullets.query-args';
import { getTeamQueryArgs } from './teams.query-args';
import { getMaterialQueryArgs, getAssemblyQueryArgs } from './bom.query-args';
import { getTaskQueryArgs } from './tasks.query-args';

export type ProjectQueryArgs = ReturnType<typeof getProjectQueryArgs>;

export const getProjectQueryArgs = (organizationId: string) =>
  Prisma.validator<Prisma.ProjectArgs>()({
    include: {
      wbsElement: {
        include: {
          lead: getUserQueryArgs(organizationId),
          manager: getUserQueryArgs(organizationId),
          descriptionBullets: getDescriptionBulletQueryArgs(organizationId),
          tasks: { where: { dateDeleted: null }, ...getTaskQueryArgs(organizationId) },
          links: getLinkQueryArgs(organizationId),
          changes: {
            where: { changeRequest: { dateDeleted: null } },
            include: { implementer: getUserQueryArgs(organizationId) }
          },
          materials: {
            where: { dateDeleted: null },
            ...getMaterialQueryArgs(organizationId)
          },
          assemblies: {
            where: { dateDeleted: null },
            ...getAssemblyQueryArgs(organizationId)
          }
        }
      },
      teams: getTeamQueryArgs(organizationId),
      workPackages: {
        where: {
          wbsElement: {
            dateDeleted: null
          }
        },
        include: {
          wbsElement: {
            include: {
              lead: getUserQueryArgs(organizationId),
              descriptionBullets: getDescriptionBulletQueryArgs(organizationId),
              manager: getUserQueryArgs(organizationId),
              links: getLinkQueryArgs(organizationId),
              changes: {
                where: { changeRequest: { dateDeleted: null } },
                include: { implementer: getUserQueryArgs(organizationId) }
              },
              materials: getMaterialQueryArgs(organizationId),
              assemblies: getAssemblyQueryArgs(organizationId)
            }
          },
          blockedBy: { where: { dateDeleted: null } }
        }
      },
      favoritedBy: getUserQueryArgs(organizationId)
    }
  });
