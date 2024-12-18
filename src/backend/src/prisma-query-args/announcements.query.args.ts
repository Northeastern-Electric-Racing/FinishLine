import { Prisma } from '@prisma/client';
import { getUserQueryArgs } from './user.query-args';

export type AnnouncementQueryArgs = ReturnType<typeof getAnnouncementQueryArgs>;

export const getAnnouncementQueryArgs = (organizationId: string) =>
  Prisma.validator<Prisma.AnnouncementDefaultArgs>()({
    include: {
      usersReceived: getUserQueryArgs(organizationId),
      userCreated: getUserQueryArgs(organizationId)
    }
  });
