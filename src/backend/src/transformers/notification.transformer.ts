import { Prisma } from '@prisma/client';
import { NotificationQueryArgs } from '../prisma-query-args/notifications.query-args';
import { Notification } from 'shared';

const notificationTransformer = (notification: Prisma.NotificationGetPayload<NotificationQueryArgs>): Notification => {
  return {
    text: notification.text,
    iconName: notification.iconName
  };
};

export default notificationTransformer;
