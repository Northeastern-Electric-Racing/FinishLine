import { Card, Box, Typography, Stack } from '@mui/material';
import BuildOutlinedIcon from '@mui/icons-material/BuildOutlined';
import RoomOutlinedIcon from '@mui/icons-material/RoomOutlined';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { Calendar, EventInstance, EventType } from 'shared';
import { datePipe } from '../../utils/pipes';
import { formatTime } from '../../utils/datetime.utils';
import { getMutedColor, getPendingReason } from '../../utils/calendar.utils';

interface UpcomingMeetingProp {
  calendars: Calendar[];
  event: EventInstance;
  eventTypes?: EventType[];
}

const UpcomingMeetingsCard: React.FC<UpcomingMeetingProp> = ({ event, calendars = [], eventTypes = [] }) => {
  const specificEventType = eventTypes?.find((eventType) => eventType.eventTypeId === event.eventTypeId);
  const specificCalendar = calendars?.find((calendar) =>
    calendar.eventTypes.some((eventType) => eventType.eventTypeId === specificEventType?.eventTypeId)
  );

  const baseColor = specificCalendar?.color ?? 'gray';

  const pendingReason = getPendingReason(event);
  const bgColor = pendingReason ? getMutedColor(baseColor, 0.35) : baseColor;

  // optional and required members are combined and sorted by first name
  const members = Array.from(
    new Map([...event.requiredMembers, ...event.optionalMembers].map((u) => [u.userId, u])).values()
  ).sort((a, b) => a.firstName.localeCompare(b.firstName));

  return (
    <Card
      style={{
        backgroundColor: bgColor,
        margin: '10px',
        display: 'flex',
        alignItems: 'flex-start',
        padding: '5px',
        ...(pendingReason && {
          border: `1px dashed ${baseColor}`,
          opacity: 0.8
        })
      }}
    >
      <Stack display="flex" width="100%">
        {pendingReason && (
          <Box display="flex" alignItems="center" gap="4px" mb={0.5} sx={{ color: '#ffa726' }}>
            <WarningAmberIcon sx={{ fontSize: 14 }} />
            <Typography sx={{ fontSize: 11, fontStyle: 'italic' }}>{pendingReason}</Typography>
          </Box>
        )}
        <Box display="flex" alignItems="flex-start" width="100%" fontSize="15px">
          {/* Event Title */}
          <Box display="flex" alignItems="center" gap="5px" maxWidth="100%" minWidth={0}>
            <BuildOutlinedIcon />
            <Typography sx={{ wordBreak: 'break-word' }}>{event.title}</Typography>
          </Box>

          {/* Event Time */}
          <Box marginLeft="auto" whiteSpace="nowrap">
            {datePipe(event.startTime)}
          </Box>
        </Box>

        <Box display="flex" alignItems="flex-start" width="100%" fontSize="15px">
          {/* Event Location */}
          <Typography sx={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '15px' }}>
            <RoomOutlinedIcon /> {event.location ? event.location : event.zoomLink ? event.zoomLink : 'N/A'}
          </Typography>

          {/* Event Time */}
          <Box marginLeft="auto" whiteSpace="nowrap">
            {formatTime(new Date(event.startTime))}
          </Box>
        </Box>

        {/* Event Members */}
        <Box display="flex" alignItems="center" gap="5px" maxWidth="100%" minWidth={0}>
          <GroupsOutlinedIcon />

          <Typography noWrap sx={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {members.length > 0
              ? members.map((u) => `${u.firstName} ${u.lastName}`).join(', ')
              : event.teams.length > 0
                ? event.teams.map((t) => t.teamName).join(', ')
                : (event.teamType?.name ?? 'N/A')}
          </Typography>
        </Box>
      </Stack>
    </Card>
  );
};

export default UpcomingMeetingsCard;
