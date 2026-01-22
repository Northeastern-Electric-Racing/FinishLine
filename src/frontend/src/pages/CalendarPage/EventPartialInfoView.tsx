import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { Calendar, EventInstance, EventType } from 'shared';
import GroupIcon from '@mui/icons-material/Group';
import { Stack } from '@mui/system';
import { getTeamTypeIcon } from './CalendarDayCard';
import { Typography } from '@mui/material';
import { formatTime } from '../../utils/datetime.utils';

interface EventInfoProps {
  event: EventInstance;
  eventTypes?: EventType[];
  calendars?: Calendar[];
  onClick: () => void;
}

const EventPartialInfoView: React.FC<EventInfoProps> = ({ event, eventTypes, calendars, onClick }) => {
  const name = event.title;
  const specificEventType = eventTypes?.find((eventType) => eventType.eventTypeId === event.eventTypeId);
  const specificCalendar = calendars?.find((calendar) =>
    calendar.eventTypes.some((eventType) => eventType.eventTypeId === specificEventType?.eventTypeId)
  );

  return (
    <Stack
      direction="column"
      spacing={2}
      bgcolor={specificCalendar?.color ?? 'gray'}
      margin={1}
      borderRadius={2}
      padding={1}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      sx={{ cursor: 'pointer', '&:hover': { opacity: 0.8 } }}
    >
      <Stack direction="row" spacing={5}>
        <Stack direction="row" sx={{ minWidth: 200 }}>
          {getTeamTypeIcon(event.teamType?.name ?? '', false)}
          <Typography marginX={0.5} marginY={0.5} lineHeight={'120%'} fontSize={12} fontWeight="bold" align="left">
            {name}
          </Typography>
        </Stack>
        <Stack direction="row" sx={{ minWidth: 150 }}>
          <AccessTimeIcon />
          {event.allDay ? (
            <Typography marginX={0.5} marginY={0.5} lineHeight={'120%'} fontSize={12} fontWeight="bold" align="left">
              All Day
            </Typography>
          ) : (
            <Typography marginX={0.5} marginY={0.5} lineHeight={'120%'} fontSize={12} fontWeight="bold" align="left">
              {formatTime(event.startTime)} - {formatTime(event.endTime)}
            </Typography>
          )}
        </Stack>
      </Stack>
      <Stack direction="row" spacing={5}>
        <Stack direction="row" sx={{ minWidth: 200 }}>
          <LocationOnIcon />
          <Typography marginX={0.5} marginY={0.5} lineHeight={'120%'} fontSize={12} fontWeight="bold" align="left">
            {event.location ?? 'N/A'}
          </Typography>
        </Stack>
        <Stack direction="row" sx={{ minWidth: 150 }}>
          <GroupIcon />
          <Typography marginX={0.5} marginY={0.5} lineHeight={'120%'} fontSize={12} fontWeight="bold" align="left">
            {event.requiredMembers[0]
              ? `${event.requiredMembers[0].firstName} ${event.requiredMembers[0].lastName}...`
              : 'N/A '}
          </Typography>
        </Stack>
      </Stack>
    </Stack>
  );
};

export default EventPartialInfoView;
