import { Box } from '@mui/material';
import React from 'react';
import { User } from 'shared';
import NotificationCard from './NotificationCard';
import { useUserNotifications } from '../hooks/users.hooks';

interface NotificationAlertProps {
  user: User;
}

const NotificationAlert: React.FC<NotificationAlertProps> = ({ user }) => {
  const { data: notifications } = useUserNotifications(user.userId);

  const currentNotification = notifications && notifications.length > 0 ? notifications[0] : undefined;

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
      {currentNotification && <NotificationCard notification={currentNotification} />}
    </Box>
  );
};

export default NotificationAlert;
