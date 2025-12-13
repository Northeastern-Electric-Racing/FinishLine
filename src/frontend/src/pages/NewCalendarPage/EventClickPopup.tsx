import React from 'react';
import { Box, Button, IconButton, Popover, Stack, Typography, useTheme } from '@mui/material';
import { Calendar, DayOfWeek, Event, EventType } from 'shared';
import { getTeamTypeIcon } from './CalendarDayCard';
import ConstructionIcon from '@mui/icons-material/Construction';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import BusinessCenterIcon from '@mui/icons-material/BusinessCenter';
import DescriptionIcon from '@mui/icons-material/Description';
import HelpIcon from '@mui/icons-material/Help';
import EditIcon from '@mui/icons-material/Edit';
import PeopleIcon from '@mui/icons-material/People';

import { getConvertedEnd, getConvertedStart } from '../../utils/datetime.utils';

export const getStatusIcon = (status: string, isLarge?: boolean) => {
  const statusIcons: Map<string, JSX.Element> = new Map([
    ['UNCONFIRMED', <HelpIcon fontSize={isLarge ? 'large' : 'small'} />],
    ['CONFIRMED', <CheckCircleIcon fontSize={isLarge ? 'large' : 'small'} />],
    ['SCHEDULED', <HelpIcon fontSize={isLarge ? 'large' : 'small'} />],
    ['DONE', <CheckCircleIcon fontSize={isLarge ? 'large' : 'small'} />]
  ]);
  return statusIcons.get(status);
};

interface EventClickContentProps {
  event: Event;
  eventTypes: EventType[];
  calendars: Calendar[];
  dayOfWeek: DayOfWeek;
}

const EventClickContent: React.FC<EventClickContentProps> = ({ event, eventTypes, calendars, dayOfWeek }) => {
  const theme = useTheme();

  const name = event.workPackages[0]?.wbsElement?.name || event.title;
  const startTime = getConvertedStart(event, dayOfWeek);
  const endTime = getConvertedEnd(event, dayOfWeek);

  const specificEventType = eventTypes.find((et) => et.eventTypeId === event.eventTypeId);
  const specificCalendar = calendars.find((calendar) =>
    calendar.eventTypes.some((et) => et.eventTypeId === specificEventType?.eventTypeId)
  );
  const calendarColor = specificCalendar?.color ?? 'gray';

  const showAvailabilityButton = Boolean(specificEventType?.requiresConfirmation);

  const allPeople = [...event.requiredMembers, ...event.optionalMembers, ...event.confirmedMembers];
  const seenIds = new Set<string>();
  const peopleNames: string[] = [];

  allPeople.forEach((person) => {
    if (!seenIds.has(person.userId)) {
      seenIds.add(person.userId);
      peopleNames.push(`${person.firstName} ${person.lastName}`);
    }
  });

  const peopleText = peopleNames.length > 0 ? peopleNames.join(', ') : 'No attendees yet';

  const hasMachinery = event.machinery.length > 0;
  const machineryText = hasMachinery
    ? event.machinery.map((m) => m.name || 'Machinery').join(', ')
    : 'No machinery specified';

  const hasWorkPackages = event.workPackages.length > 0;
  const workPackageText = hasWorkPackages
    ? event.workPackages.map((wp) => wp.wbsElement?.name || 'Work package').join(', ')
    : 'No work packages specified';

  const descriptionText = event.description || 'No description provided';

  return (
    <Box
      sx={{
        bgcolor: theme.palette.grey[900],
        color: theme.palette.common.white,
        borderRadius: 2,
        px: 2,
        py: 1.5,
        maxWidth: 520
      }}
    >
      <Box sx={{ position: 'relative', mb: 2 }}>
        <IconButton
          size="small"
          sx={{
            position: 'absolute',
            top: 0,
            right: 0,
            color: theme.palette.grey[500],
            '&:hover': {
              color: theme.palette.common.white,
              bgcolor: 'transparent'
            }
          }}
        >
          <EditIcon fontSize="small" />
        </IconButton>

        <Stack direction="row" spacing={1} alignItems="center" sx={{ pr: 4 }}>
          {getTeamTypeIcon(event.teamType?.name ?? '', true)}
          <Typography
            variant="h6"
            noWrap
            sx={{
              fontWeight: 'bold',
              color: calendarColor
            }}
          >
            {name}
          </Typography>
        </Stack>

        <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 0.5, flexWrap: 'wrap' }}>
          <AccessTimeIcon fontSize="small" />
          <Typography variant="body2">
            {startTime} – {endTime}
          </Typography>
          <LocationOnIcon fontSize="small" sx={{ ml: 2 }} />
          <Typography variant="body2">{event.location || 'N/A'}</Typography>
        </Stack>
      </Box>
      <Stack spacing={1.25}>
        {/* Members */}
        <Stack direction="row" spacing={1.25} alignItems="flex-start">
          <PeopleIcon fontSize="small" sx={{ mt: 0.3 }} />
          <Typography variant="body2" sx={{ flex: 1 }}>
            {peopleText}
          </Typography>
        </Stack>

        {/* View availability */}
        {showAvailabilityButton && (
          <Box sx={{ pl: 3.25, mt: -0.5 }}>
            <Button
              size="small"
              variant="outlined"
              startIcon={<PeopleIcon fontSize="small" />}
              onClick={(e) => {
                e.stopPropagation();
                // availability page
              }}
              sx={{
                textTransform: 'none',
                borderRadius: 999,
                px: 1.5,
                py: 0.4,
                color: theme.palette.common.white,
                borderColor: theme.palette.grey[700],
                '&:hover': {
                  borderColor: theme.palette.grey[500],
                  bgcolor: 'transparent'
                }
              }}
            >
              View availability
            </Button>
          </Box>
        )}

        {/* Machinery */}
        {hasMachinery && (
          <Stack direction="row" spacing={1.25} alignItems="flex-start">
            <ConstructionIcon fontSize="small" sx={{ mt: 0.3 }} />
            <Typography variant="body2" sx={{ flex: 1 }}>
              {machineryText}
            </Typography>
          </Stack>
        )}

        {/* Work packages */}
        {hasWorkPackages && (
          <Stack direction="row" spacing={1.25} alignItems="flex-start">
            <BusinessCenterIcon fontSize="small" sx={{ mt: 0.3 }} />
            <Typography variant="body2" sx={{ flex: 1 }}>
              {workPackageText}
            </Typography>
          </Stack>
        )}

        {/* Description */}
        <Stack direction="row" spacing={1.25} alignItems="flex-start">
          <DescriptionIcon fontSize="small" sx={{ mt: 0.3 }} />
          <Typography variant="body2" sx={{ flex: 1, whiteSpace: 'pre-wrap' }}>
            {descriptionText}
          </Typography>
        </Stack>
      </Stack>
      <Box mt={2} display="flex" justifyContent="flex-end">
        <Button
          variant="contained"
          size="small"
          sx={{
            textTransform: 'none',
            borderRadius: 999,
            px: 2,
            py: 0.4,
            bgcolor: '#F44336',
            '&:hover': {
              bgcolor: '#FF0000'
            }
          }}
        >
          Send reminder
        </Button>
      </Box>
    </Box>
  );
};

export interface EventClickPopupProps {
  clickedEvent: Event | null;
  anchorPosition: { top: number; left: number } | null;
  onClose: () => void;
  eventTypes: EventType[];
  calendars: Calendar[];
  dayOfWeek: DayOfWeek;
}

export const EventClickPopup: React.FC<EventClickPopupProps> = ({
  clickedEvent,
  anchorPosition,
  onClose,
  eventTypes,
  calendars,
  dayOfWeek
}) => {
  return (
    <Popover
      open={Boolean(clickedEvent && anchorPosition)}
      anchorReference="anchorPosition"
      anchorPosition={anchorPosition || { top: 0, left: 0 }}
      onClose={onClose}
      anchorOrigin={{ vertical: 'center', horizontal: 'center' }}
      transformOrigin={{ vertical: 'center', horizontal: 'center' }}
      disableRestoreFocus
    >
      {clickedEvent && (
        <EventClickContent event={clickedEvent} eventTypes={eventTypes} calendars={calendars} dayOfWeek={dayOfWeek} />
      )}
    </Popover>
  );
};
