import { Prisma } from '@prisma/client';
import { getUserQueryArgs } from './user.query-args';
import { getTaskQueryArgs } from './tasks.query-args';
import { getDescriptionBulletQueryArgs } from './description-bullets.query-args';
import { getTeamQueryArgs } from './teams.query-args';

export type WorkPackageQueryArgs = ReturnType<typeof getWorkPackageQueryArgs>;

export const getWorkPackageQueryArgs = (organizationId: string) =>
  Prisma.validator<Prisma.Work_PackageArgs>()({
    include: {
      project: {
        include: {
          wbsElement: true,
          teams: {
            include: {
              teamType: true
            }
          }
        }
      },
      wbsElement: {
        include: {
          lead: getUserQueryArgs(organizationId),
          manager: getUserQueryArgs(organizationId),
          changes: {
            where: { changeRequest: { dateDeleted: null } },
            include: { implementer: getUserQueryArgs(organizationId) },
            orderBy: { dateImplemented: 'asc' }
          },
          blocking: true,
          tasks: { where: { dateDeleted: null }, ...getTaskQueryArgs(organizationId) },
          descriptionBullets: { where: { dateDeleted: null }, ...getDescriptionBulletQueryArgs(organizationId) }
        }
      },
      blockedBy: { where: { dateDeleted: null } }
    }
  });
