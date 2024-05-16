import { Prisma } from '@prisma/client';
import { getUserQueryArgs, getUserWithSettingsQueryArgs } from './user.query-args';

export type DesignReviewQueryArgs = ReturnType<typeof getDesignReviewQueryArgs>;

export const getDesignReviewQueryArgs = (organizationId: string) =>
  Prisma.validator<Prisma.Design_ReviewArgs>()({
    include: {
      userCreated: getUserQueryArgs(organizationId),
      teamType: true,
      requiredMembers: getUserQueryArgs(organizationId),
      optionalMembers: getUserQueryArgs(organizationId),
      confirmedMembers: getUserWithSettingsQueryArgs(organizationId),
      deniedMembers: getUserQueryArgs(organizationId),
      attendees: getUserQueryArgs(organizationId),
      userDeleted: getUserQueryArgs(organizationId),
      wbsElement: true
    }
  });
