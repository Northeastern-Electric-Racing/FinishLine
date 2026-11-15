import { Prisma } from '@prisma/client';
import { getBaseUserQueryArgs } from './user.query-args.js';
import { getBaseDescriptionBulletQueryArgs } from './description-bullets.query-args.js';

export type BaseWorkPackageQueryArgs = ReturnType<typeof getBaseWorkPackageQueryArgs>;
export type WorkPackageDetailQueryArgs = ReturnType<typeof getWorkPackageDetailQueryArgs>;
export type WorkPackageCardQueryArgs = ReturnType<typeof getWorkPackageCardQueryArgs>;

// the minimum every consumer of a work package needs: what it is, when it runs, and who owns it
export const getBaseWorkPackageQueryArgs = () =>
  Prisma.validator<Prisma.Work_PackageDefaultArgs>()({
    select: {
      workPackageId: true,
      wbsElementId: true,
      projectId: true,
      startDate: true,
      duration: true,
      stage: true,
      orderInProject: true,
      // a work package is its wbs element: identity, name, status, and who owns it. No dateDeleted: every
      // query returning this filters deleted work packages out
      wbsElement: {
        select: {
          carNumber: true,
          projectNumber: true,
          workPackageNumber: true,
          name: true,
          status: true,
          lead: getBaseUserQueryArgs(),
          manager: getBaseUserQueryArgs()
        }
      },
      // a work package is shown as "Project - Work Package" almost everywhere it stands on its own
      project: { select: { wbsElement: { select: { name: true } } } }
    }
  });

export const getWorkPackageDetailQueryArgs = () =>
  Prisma.validator<Prisma.Work_PackageDefaultArgs>()({
    select: {
      ...getBaseWorkPackageQueryArgs().select,
      wbsElement: {
        select: {
          ...getBaseWorkPackageQueryArgs().select.wbsElement.select,
          descriptionBullets: { where: { dateDeleted: null }, ...getBaseDescriptionBulletQueryArgs() },
          changes: {
            where: { changeRequest: { dateDeleted: null } },
            select: {
              changeId: true,
              changeRequestId: true,
              detail: true,
              dateImplemented: true,
              changeRequest: { select: { identifier: true } },
              implementer: getBaseUserQueryArgs()
            },
            orderBy: { dateImplemented: 'asc' }
          }
        }
      },
      // named so the detail page can list dependencies without fetching each one
      blockedBy: {
        where: { dateDeleted: null },
        select: { carNumber: true, projectNumber: true, workPackageNumber: true, name: true }
      }
    }
  });

export const getWorkPackageCardQueryArgs = () =>
  Prisma.validator<Prisma.Work_PackageDefaultArgs>()({
    select: {
      ...getBaseWorkPackageQueryArgs().select,
      // overdue cards name each blocker's project, so it comes back here instead of one fetch per card
      blockedBy: {
        where: { dateDeleted: null },
        select: {
          carNumber: true,
          projectNumber: true,
          workPackageNumber: true,
          name: true,
          workPackage: { select: { project: { select: { wbsElement: { select: { name: true } } } } } }
        }
      }
    }
  });
