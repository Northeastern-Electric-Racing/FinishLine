import { Box, Card, Icon, IconButton, Typography, useTheme } from '@mui/material';
import React from 'react';
import { Notification } from 'shared';
import CloseIcon from '@mui/icons-material/Close';

interface NotificationCardProps {
  notification: Notification;
  removeNotification: (notificationId: Notification) => Promise<void>;
  onClick: (notificationId: Notification) => Promise<void>;
}

const NotificationCard: React.FC<NotificationCardProps> = ({ notification, removeNotification, onClick }) => {
  const theme = useTheme();
  return (
    <Card
      variant={'outlined'}
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
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <Box
          onClick={async () => await onClick(notification)}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            cursor: !!notification.eventLink ? 'pointer' : 'default'
          }}
        >
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              padding: 2,
              background: theme.palette.primary.main,
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
          <Typography variant="subtitle2">{notification.text}</Typography>
        </Box>
        <IconButton onClick={() => removeNotification(notification)}>
          <CloseIcon />
        </IconButton>
      </Box>
    </Card>
  );
};

export default NotificationCard;
