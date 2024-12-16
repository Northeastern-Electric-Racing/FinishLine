import { Box } from '@mui/material';
import React from 'react';
import { Notification, User } from 'shared';
import NotificationCard from './NotificationCard';
import { useRemoveUserNotification, useUserNotifications } from '../hooks/users.hooks';

interface NotificationAlertProps {
  user: User;
}

const NotificationAlert: React.FC<NotificationAlertProps> = ({ user }) => {
  const { data: notifications, isLoading: notificationIsLoading } = useUserNotifications(user.userId);
  const { mutateAsync: removeNotification } = useRemoveUserNotification(user.userId);

  const currentNotification =
    !notificationIsLoading && notifications && notifications.length > 0 ? notifications[0] : undefined;

  const removeNotificationWrapper = async (notification: Notification) => {
    await removeNotification(notification);
  };

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 16,
        right: 16,
        transform: !!currentNotification ? 'translateX(0)' : 'translateX(110%)',
        transition: 'transform 0.5s ease-out'
      }}
    >
      {currentNotification && (
        <NotificationCard notification={currentNotification} removeNotification={removeNotificationWrapper} />
      )}
    </Box>
  );
};

export default NotificationAlert;
