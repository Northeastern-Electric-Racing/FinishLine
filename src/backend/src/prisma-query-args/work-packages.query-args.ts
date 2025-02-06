import { Prisma } from '@prisma/client';
import { getUserQueryArgs } from './user.query-args';
import { getTaskQueryArgs } from './tasks.query-args';
import { getDescriptionBulletQueryArgs } from './description-bullets.query-args';
import { getDesignReviewQueryArgs } from './design-reviews.query-args';

export type WorkPackageQueryArgs = ReturnType<typeof getWorkPackageQueryArgs>;

export const getWorkPackageQueryArgs = (organizationId: string) =>
  Prisma.validator<Prisma.Work_PackageDefaultArgs>()({
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
          blocking: { where: { wbsElement: { dateDeleted: null } }, include: { wbsElement: true } },
          tasks: { where: { dateDeleted: null }, ...getTaskQueryArgs(organizationId) },
          descriptionBullets: { where: { dateDeleted: null }, ...getDescriptionBulletQueryArgs(organizationId) },
          designReviews: { where: { dateDeleted: null }, ...getDesignReviewQueryArgs(organizationId) }
        }
      },
      blockedBy: { where: { dateDeleted: null } }
    }
  });
