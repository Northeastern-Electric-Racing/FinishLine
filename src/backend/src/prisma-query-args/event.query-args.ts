import { Prisma } from '@prisma/client';
import { getUserQueryArgs, getUserWithSettingsQueryArgs } from './user.query-args.js';

export type EventQueryArgs = ReturnType<typeof getEventQueryArgs>;

export type EventWithMembersQueryArgs = ReturnType<typeof getEventWithMembersQueryArgs>;

export const getEventQueryArgs = (organizationId: string) =>
  Prisma.validator<Prisma.EventDefaultArgs>()({
    include: {
      userCreated: getUserWithSettingsQueryArgs(organizationId),
      requiredMembers: getUserQueryArgs(organizationId),
      optionalMembers: getUserQueryArgs(organizationId),
      confirmedMembers: getUserWithSettingsQueryArgs(organizationId),
      deniedMembers: getUserQueryArgs(organizationId),
      teams: true,
      teamType: {
        select: {
          teamTypeId: true,
          name: true
        }
      },
      shops: {
        select: {
          name: true,
          shopId: true
        }
      },
      machinery: {
        select: {
          name: true,
          machineryId: true
        }
      },
      workPackages: {
        select: {
          wbsElement: {
            select: {
              name: true,
              carNumber: true,
              projectNumber: true,
              workPackageNumber: true
            }
          },
          project: {
            include: {
              wbsElement: true,
              teams: true
            }
          },
          workPackageId: true
        }
      },
      approvalRequiredBy: getUserQueryArgs(organizationId),
      scheduledTimes: true,
      notificationSlackThreads: true,
      documents: true
    }
  });

export const getEventWithMembersQueryArgs = (organizationId: string) =>
  Prisma.validator<Prisma.EventDefaultArgs>()({
    include: {
      userCreated: getUserWithSettingsQueryArgs(organizationId),
      requiredMembers: getUserQueryArgs(organizationId),
      optionalMembers: getUserQueryArgs(organizationId),
      confirmedMembers: getUserWithSettingsQueryArgs(organizationId),
      deniedMembers: getUserQueryArgs(organizationId),
      teams: {
        include: {
          members: getUserQueryArgs(organizationId),
          leads: getUserQueryArgs(organizationId),
          head: getUserQueryArgs(organizationId)
        }
      },
      teamType: {
        include: {
          teams: {
            include: {
              members: getUserQueryArgs(organizationId),
              leads: getUserQueryArgs(organizationId),
              head: getUserQueryArgs(organizationId)
            }
          }
        }
      },
      shops: {
        select: {
          name: true,
          shopId: true
        }
      },
      machinery: {
        select: {
          name: true,
          machineryId: true
        }
      },
      workPackages: {
        select: {
          wbsElement: {
            select: {
              name: true,
              carNumber: true,
              projectNumber: true,
              workPackageNumber: true
            }
          },
          project: {
            include: {
              wbsElement: true,
              teams: true
            }
          },
          workPackageId: true
        }
      },
      approvalRequiredBy: getUserQueryArgs(organizationId),
      scheduledTimes: true,
      notificationSlackThreads: true,
      documents: true
    }
  });
