import { Prisma } from '@prisma/client';
import { getBaseUserQueryArgs, getUserPreviewQueryArgs, getUserQueryArgs } from './user.query-args.js';
import { getBaseDescriptionBulletQueryArgs, getDescriptionBulletQueryArgs } from './description-bullets.query-args.js';
import { getLinkQueryArgs } from './links.query-args.js';
import { getEventQueryArgs } from './event.query-args.js';

export type BaseWorkPackageQueryArgs = ReturnType<typeof getBaseWorkPackageQueryArgs>;
export type WorkPackageDetailQueryArgs = ReturnType<typeof getWorkPackageDetailQueryArgs>;
export type WorkPackageCardQueryArgs = ReturnType<typeof getWorkPackageCardQueryArgs>;
/** @deprecated Use BaseWorkPackageQueryArgs or a per-endpoint model's query args. Still used by projects.query-args.ts and retrospective.services.ts until projects is refactored */
export type WorkPackageQueryArgs = ReturnType<typeof getWorkPackageQueryArgs>;
/** @deprecated Use BaseWorkPackageQueryArgs. Still used by projects.query-args.ts until projects is refactored */
export type WorkPackagePreviewQueryArgs = ReturnType<typeof getWorkPackagePreviewQueryArgs>;

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
      // a work package is its wbs element: identity, name, status, and who owns it
      wbsElement: {
        select: {
          carNumber: true,
          projectNumber: true,
          workPackageNumber: true,
          name: true,
          status: true,
          dateCreated: true,
          dateDeleted: true,
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

/** @deprecated Use getBaseWorkPackageQueryArgs or a per-endpoint model's query args. Still used by projects.query-args.ts and retrospective.services.ts until projects is refactored */
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
          descriptionBullets: { where: { dateDeleted: null }, ...getDescriptionBulletQueryArgs(organizationId) }
        }
      },
      blockedBy: { where: { dateDeleted: null } },
      events: { where: { dateDeleted: null }, ...getEventQueryArgs(organizationId) }
    }
  });

/** @deprecated Use getBaseWorkPackageQueryArgs. Still used by projects.query-args.ts until projects is refactored */
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
