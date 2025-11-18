import { Prisma } from '@prisma/client';
import { getUserQueryArgs, getUserWithSettingsQueryArgs } from './user.query-args';

export type EventQueryArgs = ReturnType<typeof getEventQueryArgs>;

export const getEventQueryArgs = (organizationId: string) =>
  Prisma.validator<Prisma.EventDefaultArgs>()({
    include: {
      userCreated: getUserQueryArgs(organizationId),
      requiredMembers: getUserQueryArgs(organizationId),
      optionalMembers: getUserQueryArgs(organizationId),
      confirmedMembers: getUserWithSettingsQueryArgs(organizationId),
      deniedMembers: getUserQueryArgs(organizationId),
      teams: {
        select: {
          teamName: true,
          teamId: true
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
              name: true
            }
          },
          workPackageId: true
        }
      },
      approvalRequiredBy: getUserQueryArgs(organizationId),
      scheduledTimes: true
    }
  });
