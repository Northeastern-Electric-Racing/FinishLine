import { Prisma } from '@prisma/client';
import { getUserPreviewQueryArgs, getUserQueryArgs } from './user.query-args.js';
import { getDescriptionBulletQueryArgs } from './description-bullets.query-args.js';
import { getLinkQueryArgs } from './links.query-args.js';
import { getEventPreviewQueryArgs, getEventQueryArgs } from './event.query-args.js';

export type WorkPackageQueryArgs = ReturnType<typeof getWorkPackageQueryArgs>;
export type WorkPackageGanttQueryArgs = ReturnType<typeof getWorkPackageGanttQueryArgs>;
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
            },
            orderBy: [{ teamName: 'asc' }, { teamId: 'asc' }]
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
            orderBy: [{ dateImplemented: 'asc' }, { changeId: 'asc' }]
          },
          blocking: {
            where: { wbsElement: { dateDeleted: null } },
            include: { wbsElement: true },
            orderBy: [
              { wbsElement: { carNumber: 'asc' } },
              { wbsElement: { projectNumber: 'asc' } },
              { wbsElement: { workPackageNumber: 'asc' } }
            ]
          },
          descriptionBullets: {
            where: { dateDeleted: null },
            orderBy: [{ dateAdded: 'asc' }, { descriptionId: 'asc' }],
            ...getDescriptionBulletQueryArgs(organizationId)
          }
        }
      },
      blockedBy: {
        where: { dateDeleted: null },
        orderBy: [{ carNumber: 'asc' }, { projectNumber: 'asc' }, { workPackageNumber: 'asc' }]
      },
      events: { where: { dateDeleted: null }, ...getEventQueryArgs(organizationId) }
    }
  });

// same output as getWorkPackageQueryArgs through workPackageTransformer, but only fetches what the gantt reads
export const getWorkPackageGanttQueryArgs = (organizationId: string) =>
  Prisma.validator<Prisma.Work_PackageDefaultArgs>()({
    include: {
      project: {
        select: {
          wbsElement: { select: { name: true } },
          teams: {
            select: { teamType: true },
            orderBy: [{ teamName: 'asc' }, { teamId: 'asc' }]
          }
        }
      },
      wbsElement: {
        include: {
          lead: getUserQueryArgs(organizationId),
          manager: getUserQueryArgs(organizationId),
          changes: {
            where: { changeRequest: { dateDeleted: null } },
            include: { implementer: getUserQueryArgs(organizationId), changeRequest: { select: { identifier: true } } },
            orderBy: [{ dateImplemented: 'asc' }, { changeId: 'asc' }]
          },
          blocking: {
            where: { wbsElement: { dateDeleted: null } },
            select: { wbsElement: { select: { carNumber: true, projectNumber: true, workPackageNumber: true } } },
            orderBy: [
              { wbsElement: { carNumber: 'asc' } },
              { wbsElement: { projectNumber: 'asc' } },
              { wbsElement: { workPackageNumber: 'asc' } }
            ]
          },
          descriptionBullets: {
            where: { dateDeleted: null },
            orderBy: [{ dateAdded: 'asc' }, { descriptionId: 'asc' }],
            select: { ...getDescriptionBulletQueryArgs(organizationId).select, userChecked: getUserPreviewQueryArgs() }
          }
        }
      },
      blockedBy: {
        where: { dateDeleted: null },
        select: { carNumber: true, projectNumber: true, workPackageNumber: true },
        orderBy: [{ carNumber: 'asc' }, { projectNumber: 'asc' }, { workPackageNumber: 'asc' }]
      },
      events: { where: { dateDeleted: null }, ...getEventPreviewQueryArgs(organizationId) }
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
