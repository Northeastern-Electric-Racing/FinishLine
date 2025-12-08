import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { Calendar, DayOfWeek, Event, EventType } from 'shared';
import GroupIcon from '@mui/icons-material/Group';
import { Stack } from '@mui/system';
import { getTeamTypeIcon } from './CalendarDayCard';
import { Typography } from '@mui/material';
import { getConvertedEnd, getConvertedStart } from '../../utils/datetime.utils';

interface EventInfoProps {
  event: Event;
  eventTypes?: EventType[];
  calendars?: Calendar[];
  dayOfWeek: DayOfWeek;
  onClick: () => void;
}

const EventPartialInfoView: React.FC<EventInfoProps> = ({ event, eventTypes, calendars, dayOfWeek, onClick }) => {
  const name = event.workPackages[0]?.wbsElement?.name || event.title;
  const convertedStartTime = getConvertedStart(event, dayOfWeek);
  const convertedEndTime = getConvertedEnd(event, dayOfWeek);
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
          <Typography marginX={0.5} marginY={0.5} lineHeight={'120%'} fontSize={12} fontWeight="bold" align="left">
            {convertedStartTime} - {convertedEndTime}
          </Typography>
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
