import { Prisma } from '@prisma/client';
import { getUserPreviewQueryArgs, getUserQueryArgs } from './user.query-args.js';
import { getDescriptionBulletQueryArgs } from './description-bullets.query-args.js';
import { getLinkQueryArgs } from './links.query-args.js';
import { getEventQueryArgs } from './event.query-args.js';

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
        }
      },
      blockedBy: { where: { dateDeleted: null } },
      events: { where: { dateDeleted: null }, ...getEventQueryArgs(organizationId) }
    }
  });

export const getWorkPackagePreviewQueryArgs = () =>
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
          lead: getUserPreviewQueryArgs(),
          manager: getUserPreviewQueryArgs(),
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
