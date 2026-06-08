import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { Calendar, EventInstance, EventType, formatEventTime } from 'shared';
import GroupIcon from '@mui/icons-material/Group';
import { Stack } from '@mui/system';
import { getTeamTypeIcon } from './CalendarDayCard';
import { Typography } from '@mui/material';

import { getMutedColor } from '../../utils/calendar.utils';
import { formatHourInCurrentTimeZone } from '../../utils/design-review.utils';

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

  const baseColor = specificCalendar?.color ?? 'gray';
  const isPending = event.status === 'UNCONFIRMED' || event.approved === 'PENDING' || event.approved === 'DENIED';
  const bgColor = isPending ? getMutedColor(baseColor, 0.35) : baseColor;

  return (
    <Stack
      direction="column"
      spacing={2}
      bgcolor={bgColor}
      margin={1}
      borderRadius={2}
      padding={1}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      sx={{
        cursor: 'pointer',
        '&:hover': { opacity: 0.8 },
        ...(isPending && {
          border: `1px dashed ${baseColor}`,
          opacity: 0.8
        })
      }}
    >
      <Stack direction="row" spacing={5}>
        <Stack direction="row" sx={{ minWidth: 0, flex: 1 }}>
          {getTeamTypeIcon(event.teamType?.name ?? '', false)}
          <Typography
            marginX={0.5}
            marginY={0.5}
            lineHeight={'120%'}
            fontSize={12}
            fontWeight="bold"
            align="left"
            sx={{
              flex: 1,
              minWidth: 0,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}
          >
            {name}
          </Typography>
        </Stack>

        <Stack direction="row" sx={{ minWidth: 150, flexShrink: 0 }}>
          <AccessTimeIcon />
          {event.allDay ? (
            <Typography marginX={0.5} marginY={0.5} lineHeight={'120%'} fontSize={12} fontWeight="bold" align="left">
              All Day
            </Typography>
          ) : (
            <Typography marginX={0.5} marginY={0.5} lineHeight={'120%'} fontSize={12} fontWeight="bold" align="left">
              {formatHourInCurrentTimeZone(formatEventTime(event.startTime))} -{' '}
              {formatHourInCurrentTimeZone(formatEventTime(event.endTime))}
            </Typography>
          )}
        </Stack>
      </Stack>

      <Stack direction="row" spacing={5}>
        <Stack direction="row" sx={{ minWidth: 0, flex: 1 }}>
          <LocationOnIcon />
          <Typography
            marginX={0.5}
            marginY={0.5}
            lineHeight={'120%'}
            fontSize={12}
            fontWeight="bold"
            align="left"
            sx={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}
          >
            {event.location ?? 'N/A'}
          </Typography>
        </Stack>

        <Stack direction="row" sx={{ minWidth: 150, flexShrink: 0 }}>
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
