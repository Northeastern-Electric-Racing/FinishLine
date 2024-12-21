import { useMutation, useQuery, useQueryClient } from 'react-query';
import { Notification } from 'shared';
import { getNotifications, removeNotification } from '../apis/notifications.api';

/**
 * Curstom react hook to get all unread notifications from a user
 * @param userId id of user to get unread notifications from
 * @returns
 */
export const useCurrentUserNotifications = () => {
  return useQuery<Notification[], Error>(['notifications', 'current-user'], async () => {
    const { data } = await getNotifications();
    return data;
  });
};

/**
 * Curstom react hook to remove a notification from a user's unread notifications
 * @param userId id of user to get unread notifications from
 * @returns
 */
export const useRemoveUserNotification = () => {
  const queryClient = useQueryClient();
  return useMutation<Notification[], Error, Notification>(
    ['notifications', 'current-user', 'remove'],
    async (notification: Notification) => {
      const { data } = await removeNotification(notification.notificationId);
      return data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['notifications', 'current-user']);
      }
    }
  );
};
