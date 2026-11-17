import { Card, CardContent, Typography, IconButton, Box } from '@mui/material';
import { useTheme } from '@mui/system';
import React from 'react';
import { BaseAnnouncement } from 'shared';
import { datePipe } from '../../../utils/pipes';
import CloseIcon from '@mui/icons-material/Close';

interface GeneralAnnouncementCardProps {
  announcement: Pick<BaseAnnouncement, 'announcementId' | 'senderName' | 'dateMessageSent' | 'slackChannelName' | 'text'>;
  removeAnnouncement: (announcementId: string) => Promise<void>;
  removeDisabled?: boolean;
}

const GeneralAnnouncementCard: React.FC<GeneralAnnouncementCardProps> = ({
  announcement,
  removeAnnouncement,
  removeDisabled
}) => {
  const theme = useTheme();
  return (
    <Card
      variant="outlined"
      sx={{
        width: '100%',
        height: 'fit-content',
        flexShrink: 0,
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
          <IconButton disabled={removeDisabled} onClick={() => removeAnnouncement(announcement.announcementId)}>
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
