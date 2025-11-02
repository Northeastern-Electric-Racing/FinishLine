import { Prisma } from '@prisma/client';
import { getUserQueryArgs } from './user.query-args';
import { getShopQueryArgs } from './shop.query-args';
import { getMachineryQueryArgs } from './machinery.query-args';
import { getWorkPackageQueryArgs } from './work-packages.query-args';

export type EventQueryArgs = ReturnType<typeof getEventQueryArgs>;

export const getEventQueryArgs = (organizationId: string) =>
  Prisma.validator<Prisma.EventDefaultArgs>()({
    include: {
      userCreated: getUserQueryArgs(organizationId),
      members: getUserQueryArgs(organizationId),
      shops: getShopQueryArgs(organizationId),
      machinery: getMachineryQueryArgs(organizationId),
      workPackages: getWorkPackageQueryArgs(organizationId),
      approvedBy: getUserQueryArgs(organizationId),
      scheduledTimes: true
    }
  });
