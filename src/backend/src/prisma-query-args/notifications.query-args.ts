import { Prisma } from '@prisma/client';
import { getUserQueryArgs } from './user.query-args';

export type NotificationQueryArgs = ReturnType<typeof getNotificationQueryArgs>;

export const getNotificationQueryArgs = (organizationId: string) =>
  Prisma.validator<Prisma.NotificationDefaultArgs>()({
    include: {
<<<<<<< HEAD
      usersReceived: getUserQueryArgs(organizationId)
=======
      users: getUserQueryArgs(organizationId)
>>>>>>> Send-Notification-Update
    }
  });
