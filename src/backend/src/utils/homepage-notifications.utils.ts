import { getNotificationQueryArgs } from '../prisma-query-args/notifications.query-args';
import prisma from '../prisma/prisma';
import notificationTransformer from '../transformers/notification.transformer';
import { NotFoundException } from './errors.utils';

const sendNotificationToUser = async (userId: string, notificationId: string, organizationId: string) => {
  const requestedUser = await prisma.user.findUnique({
    where: { userId }
  });

  if (!requestedUser) throw new NotFoundException('User', userId);

  const updatedUser = await prisma.user.update({
    where: { userId: requestedUser.userId },
    data: { unreadNotifications: { connect: { notificationId } } },
    include: { unreadNotifications: getNotificationQueryArgs(organizationId) }
  });

  return updatedUser.unreadNotifications.map(notificationTransformer);
};

export const sendNotificationToUsers = async (userIds: string[], text: string, iconName: string, organizationId: string) => {
  const createdNotification = await prisma.notification.create({
    data: {
      text,
      iconName
    },
    ...getNotificationQueryArgs(organizationId)
  });

  const notificationPromises = userIds.map(async (userId) => {
    return sendNotificationToUser(userId, createdNotification.notificationId, organizationId);
  });

  await Promise.all(notificationPromises);
  return notificationTransformer(createdNotification);
};
