import { Prisma } from '@prisma/client';
import { getUserQueryArgs } from './user.query-args';
import { getDescriptionBulletQueryArgs } from './description-bullets.query-args';
import { getDesignReviewPreviewQueryArgs } from './design-reviews.query-args';
import { getLinkQueryArgs } from './links.query-args';

export type WorkPackageQueryArgs = ReturnType<typeof getWorkPackageQueryArgs>;
export type WorkPackagePreviewQueryArgs = ReturnType<typeof getWorkPackagePreviewQueryArgs>;

export const getWorkPackagePreviewQueryArgs = () =>
  Prisma.validator<Prisma.Work_PackageDefaultArgs>()({
    select: {
      workPackageId: true,
      projectId: true,
      project: {
        select: { wbsElement: { select: { name: true } } }
      },
      wbsElementId: true,
      wbsElement: {
        select: {
          dateDeleted: true,
          status: true,
          carNumber: true,
          dateCreated: true,
          projectNumber: true,
          workPackageNumber: true,
          name: true,
          lead: { select: { firstName: true, lastName: true } },
          manager: { select: { firstName: true, lastName: true } },
          links: getLinkQueryArgs()
        }
      },
      startDate: true,
      duration: true,
      blockedBy: true
    }
  });

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
            include: { implementer: getUserQueryArgs(organizationId), changeRequest: true },
            orderBy: { dateImplemented: 'asc' }
          },
          blocking: { where: { wbsElement: { dateDeleted: null } }, include: { wbsElement: true } },
          descriptionBullets: { where: { dateDeleted: null }, ...getDescriptionBulletQueryArgs(organizationId) },
          designReviews: { where: { dateDeleted: null }, ...getDesignReviewPreviewQueryArgs(organizationId) }
        }
      },
      blockedBy: { where: { dateDeleted: null } }
    }
  });
