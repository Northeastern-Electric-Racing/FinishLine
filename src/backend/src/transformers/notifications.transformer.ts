import { Prisma } from '@prisma/client';
import { NotificationQueryArgs } from '../prisma-query-args/notifications.query-args';
import { Notification } from 'shared';

const notificationTransformer = (notification: Prisma.NotificationGetPayload<NotificationQueryArgs>): Notification => {
  return {
    notificationId: notification.notificationId,
    text: notification.text,
    iconName: notification.iconName,
    eventLink: notification.eventLink ?? undefined
  };
};

export default notificationTransformer;
