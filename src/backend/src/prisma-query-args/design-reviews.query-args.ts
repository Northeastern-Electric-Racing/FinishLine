/*
import { Prisma } from '@prisma/client';
import { getUserQueryArgs, getUserWithSettingsQueryArgs } from './user.query-args';

export type DesignReviewQueryArgs = ReturnType<typeof getDesignReviewQueryArgs>;

export type DesignReviewPreviewQueryArgs = ReturnType<typeof getDesignReviewPreviewQueryArgs>;

export const getDesignReviewQueryArgs = (organizationId: string) =>
  Prisma.validator<Prisma.Design_ReviewDefaultArgs>()({
    include: {
      userCreated: getUserWithSettingsQueryArgs(organizationId),
      teamType: true,
      requiredMembers: getUserQueryArgs(organizationId),
      optionalMembers: getUserQueryArgs(organizationId),
      confirmedMembers: getUserWithSettingsQueryArgs(organizationId),
      deniedMembers: getUserQueryArgs(organizationId),
      attendees: getUserQueryArgs(organizationId),
      userDeleted: getUserQueryArgs(organizationId),
      wbsElement: {
        include: {
          workPackage: {
            select: { project: { select: { wbsElement: { select: { name: true } } } } }
          }
        }
      },
      notificationSlackThreads: true
    }
  });

export const getDesignReviewPreviewQueryArgs = (organizationId: string) =>
  Prisma.validator<Prisma.Design_ReviewDefaultArgs>()({
    include: {
      userCreated: getUserWithSettingsQueryArgs(organizationId)
    }
  });
*/
