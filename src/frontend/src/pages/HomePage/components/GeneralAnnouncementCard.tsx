import { Card, CardContent, Typography, IconButton, Box } from '@mui/material';
import { useTheme } from '@mui/system';
import React from 'react';
import { Announcement } from 'shared';
import { datePipe } from '../../../utils/pipes';
import CloseIcon from '@mui/icons-material/Close';

interface GeneralAnnouncementCardProps {
  announcement: Announcement;
  removeAnnouncement: (announcement: Announcement) => Promise<Announcement[]>;
}

const GeneralAnnouncementCard: React.FC<GeneralAnnouncementCardProps> = ({ announcement, removeAnnouncement }) => {
  const theme = useTheme();
  return (
    <Card
      variant="outlined"
      sx={{
        width: '100%',
        height: 'fit-content',
        mr: 3,
        background: theme.palette.background.default,
        borderRadius: 2
      }}
    >
      <CardContent
        sx={{
          position: 'relative'
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: 8,
            right: 8
          }}
        >
          <IconButton onClick={() => removeAnnouncement(announcement)}>
            <CloseIcon />
          </IconButton>
        </Box>
        <Typography variant={'h5'}>
          {announcement.senderName} ({datePipe(announcement.dateMessageSent)})
        </Typography>
        <Typography variant={'subtitle1'}>#{announcement.slackChannelName}</Typography>
        <Typography>{announcement.text}</Typography>
      </CardContent>
    </Card>
  );
};

export default GeneralAnnouncementCard;
