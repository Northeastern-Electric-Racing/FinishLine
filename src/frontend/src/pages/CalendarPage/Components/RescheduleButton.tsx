import React from 'react';
import { Button, Stack, Tooltip, useTheme } from '@mui/material';
import { BaseEvent, EventStatus } from 'shared';
import { Link as RouterLink } from 'react-router-dom';
import { routes } from '../../../utils/routes';
import { EventInstance } from '../../../utils/calendar.utils';
import EditIcon from '@mui/icons-material/Edit';
import { useCurrentUser } from '../../../hooks/users.hooks';

const stopClick: React.MouseEventHandler<HTMLElement> = (e) => {
  e.stopPropagation();
};

export interface RescheduleButtonProps {
  event: EventInstance<BaseEvent> | null;
  eventDate: Date;
  disable?: boolean;
}

const RescheduleButton: React.FC<RescheduleButtonProps> = ({ event, eventDate, disable }) => {
  const theme = useTheme();
  const currentUser = useCurrentUser();

  if (!event || event.status !== EventStatus.SCHEDULED || event.userCreated.userId !== currentUser.userId) return null;

  const availabilityUrl = `${routes.CALENDAR}/event/${event.eventId}?date=${eventDate.toISOString()}`;

  return (
    <Stack direction="row" spacing={1} alignItems="center">
      <Tooltip title="Reschedule Event" arrow placement="top">
        <EditIcon fontSize="small" sx={{ mt: 0.1 }} />
      </Tooltip>
      <Button
        size="small"
        variant="outlined"
        component={RouterLink}
        to={availabilityUrl}
        onClick={stopClick}
        disabled={disable}
        sx={{
          textTransform: 'none',
          borderRadius: 999,
          px: 1.5,
          py: 0.25,
          minHeight: 24,
          fontSize: 12,
          color: theme.palette.primary.main,
          borderColor: theme.palette.primary.main,
          '&:hover': {
            borderColor: theme.palette.primary.dark,
            bgcolor: 'transparent'
          }
        }}
      >
        Reschedule Event
      </Button>
    </Stack>
  );
};

export default RescheduleButton;
