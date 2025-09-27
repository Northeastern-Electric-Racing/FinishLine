import { Prisma } from '@prisma/client';
import { getUserQueryArgs } from './user.query-args';
import { getDescriptionBulletQueryArgs } from './description-bullets.query-args';
import { getDesignReviewPreviewQueryArgs } from './design-reviews.query-args';
import { getLinkQueryArgs } from './links.query-args';

export type WorkPackageQueryArgs = ReturnType<typeof getWorkPackageQueryArgs>;
export type WorkPackagePreviewQueryArgs = ReturnType<typeof getWorkPackagePreviewQueryArgs>;

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

export const getWorkPackagePreviewQueryArgs = (organizationId: string) =>
  Prisma.validator<Prisma.Work_PackageDefaultArgs>()({
    select: {
      blockedBy: true,
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
      project: {
        select: {
          projectId: true,
          wbsElement: {
            select: {
              name: true,
              links: getLinkQueryArgs()
            }
          }
        }
      },
      startDate: true,
      duration: true,
      workPackageId: true,
      stage: true
    }
  });
