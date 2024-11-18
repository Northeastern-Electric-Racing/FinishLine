import { Prisma } from '@prisma/client';
import { getUserQueryArgs } from './user.query-args';

export type NotificationQueryArgs = ReturnType<typeof getNotificationQueryArgs>;

export const getNotificationQueryArgs = (organizationId: string) =>
  Prisma.validator<Prisma.NotificationDefaultArgs>()({
    include: {
      usersReceived: getUserQueryArgs(organizationId)
    }
  });
