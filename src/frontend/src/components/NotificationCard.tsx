import { Box, Icon, IconButton, Typography, useTheme } from '@mui/material';
import React from 'react';
import { Notification } from 'shared';
import CloseIcon from '@mui/icons-material/Close';

interface NotificationCardProps {
  notification: Notification;
  removeNotification: (notificationId: Notification) => Promise<void>;
}

const NotificationCard: React.FC<NotificationCardProps> = ({ notification, removeNotification }) => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'left',
        alignItems: 'center',
        gap: 1,
        background: theme.palette.background.paper,
        width: 300,
        borderRadius: 4,
        padding: 1
      }}
    >
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 2,
          background: 'red',
          width: '30%',
          borderRadius: 4
        }}
      >
        <Icon
          sx={{
            fontSize: 36
          }}
        >
          {notification.iconName}
        </Icon>
      </Box>
      <Box
        sx={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <Typography variant="subtitle2">{notification.text}</Typography>
        <IconButton onClick={() => removeNotification(notification)}>
          <CloseIcon />
        </IconButton>
      </Box>
    </Box>
  );
};

export default NotificationCard;
