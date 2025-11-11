import { Prisma } from '@prisma/client';
import { getUserQueryArgs, getUserWithSettingsQueryArgs } from './user.query-args';
import { getShopQueryArgs } from './shop.query-args';
import { getMachineryQueryArgs } from './machinery.query-args';
import { getWorkPackagePreviewQueryArgs } from './work-packages.query-args';
import { getTeamPreviewQueryArgs } from './teams.query-args';

export type EventQueryArgs = ReturnType<typeof getEventQueryArgs>;

export const getEventQueryArgs = (organizationId: string) =>
  Prisma.validator<Prisma.EventDefaultArgs>()({
    include: {
      userCreated: getUserQueryArgs(organizationId),
      requiredMembers: getUserQueryArgs(organizationId),
      optionalMembers: getUserQueryArgs(organizationId),
      confirmedMembers: getUserWithSettingsQueryArgs(organizationId),
      deniedMembers: getUserQueryArgs(organizationId),
      teams: getTeamPreviewQueryArgs(organizationId),
      shops: getShopQueryArgs(organizationId),
      machinery: getMachineryQueryArgs(organizationId),
      workPackages: getWorkPackagePreviewQueryArgs(),
      approvalRequiredBy: getUserQueryArgs(organizationId),
      scheduledTimes: true
    }
  });
