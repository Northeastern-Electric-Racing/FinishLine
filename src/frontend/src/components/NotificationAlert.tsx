import { Box } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { Notification, User } from 'shared';
import NotificationCard from './NotificationCard';
import { useRemoveUserNotification, useUserNotifications } from '../hooks/users.hooks';
import { useHistory } from 'react-router-dom';

interface NotificationAlertProps {
  user: User;
}

const NotificationAlert: React.FC<NotificationAlertProps> = ({ user }) => {
  const { data: notifications, isLoading: notificationsIsLoading } = useUserNotifications(user.userId);
  const { mutateAsync: removeNotification, isLoading: removeIsLoading } = useRemoveUserNotification(user.userId);
  const [currentNotification, setCurrentNotification] = useState<Notification>();
  const history = useHistory();

  useEffect(() => {
    if (notifications && notifications.length > 0) {
      setCurrentNotification(notifications[0]);
    }
  }, [notifications]);

  const removeNotificationWrapper = async (notification: Notification) => {
    setCurrentNotification(undefined);
    await removeNotification(notification);
  };

  const onClick = async (notification: Notification) => {
    if (!!notification.eventLink) {
      await removeNotificationWrapper(notification);
      history.push(notification.eventLink);
    }
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
      {!removeIsLoading && !notificationsIsLoading && currentNotification && (
        <NotificationCard
          notification={currentNotification}
          removeNotification={removeNotificationWrapper}
          onClick={onClick}
        />
      )}
    </Box>
  );
};

export default NotificationAlert;
