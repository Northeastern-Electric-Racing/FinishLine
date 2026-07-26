import { useMemo, useState } from 'react';
import { Box, Checkbox, FormControlLabel, FormGroup, Typography, useTheme } from '@mui/material';
import { useHistory } from 'react-router-dom';
import { format } from 'date-fns';
import { Event } from 'shared';
import ErrorPage from '../../ErrorPage';
import LoadingIndicator from '../../../components/LoadingIndicator';
import { useNewMemberEvents } from '../../../hooks/calendar.hooks';
import { meetingStartTimePipeScheduleSlot } from '../../../utils/pipes';
import { routes } from '../../../utils/routes';

const getEventDate = (event: Event): Date | undefined => {
  const firstScheduledDate = event.initialDateScheduled || event.scheduledTimes[0]?.startTime;
  return firstScheduledDate ? new Date(firstScheduledDate) : undefined;
};

const EventBlock: React.FC<{ event: Event }> = ({ event }) => {
  const theme = useTheme();
  const history = useHistory();
  const eventDate = getEventDate(event);

  return (
    <Box
      onClick={() => history.push(`${routes.CALENDAR}?eventId=${event.eventId}`)}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        p: 1,
        borderRadius: '8px',
        cursor: 'pointer',
        '&:hover': { backgroundColor: theme.palette.action.hover }
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minWidth: 48,
          borderRadius: '6px',
          border: `1px solid ${theme.palette.divider}`,
          py: 0.5
        }}
      >
        <Typography variant="caption" sx={{ fontWeight: 'bold', lineHeight: 1 }}>
          {eventDate ? format(eventDate, 'MMM').toUpperCase() : '—'}
        </Typography>
        <Typography variant="body1" sx={{ fontWeight: 'bold', lineHeight: 1 }}>
          {eventDate ? format(eventDate, 'd') : '—'}
        </Typography>
      </Box>
      <Box sx={{ overflow: 'hidden' }}>
        <Typography variant="body1" fontWeight="bold" noWrap>
          {event.title}
        </Typography>
        <Typography variant="body2" color="text.secondary" noWrap>
          {meetingStartTimePipeScheduleSlot(event.scheduledTimes)}
          {event.location ? ` · ${event.location}` : event.zoomLink ? ` · ${event.zoomLink}` : ''}
        </Typography>
      </Box>
    </Box>
  );
};

const NewMemberEventsWidget: React.FC = () => {
  const theme = useTheme();
  const { data: events, isLoading, isError, error } = useNewMemberEvents();
  const [selectedTeamTypeIds, setSelectedTeamTypeIds] = useState<string[]>([]);

  const teamTypeOptions = useMemo(() => {
    const seen = new Map<string, string>();
    (events ?? []).forEach((event) => {
      if (event.teamType) seen.set(event.teamType.teamTypeId, event.teamType.name);
    });
    return Array.from(seen, ([teamTypeId, name]) => ({ teamTypeId, name }));
  }, [events]);

  const sortedEvents = useMemo(() => {
    return [...(events ?? [])].sort((a, b) => {
      const aDate = getEventDate(a);
      const bDate = getEventDate(b);
      if (!aDate && !bDate) return 0;
      if (!aDate) return 1;
      if (!bDate) return -1;
      return aDate.getTime() - bDate.getTime();
    });
  }, [events]);

  const filteredEvents =
    selectedTeamTypeIds.length === 0
      ? sortedEvents
      : sortedEvents.filter((event) => event.teamType && selectedTeamTypeIds.includes(event.teamType.teamTypeId));

  const toggleTeamType = (teamTypeId: string) => {
    setSelectedTeamTypeIds((prev) =>
      prev.includes(teamTypeId) ? prev.filter((id) => id !== teamTypeId) : [...prev, teamTypeId]
    );
  };

  if (isError) return <ErrorPage message={error?.message} />;
  if (isLoading || !events) return <LoadingIndicator />;

  return (
    <Box
      sx={{
        backgroundColor: theme.palette.background.paper,
        borderRadius: '10px',
        width: '100%',
        overflow: 'hidden',
        paddingBottom: 2,
        minHeight: '150px'
      }}
    >
      <Typography variant="h5" sx={{ mb: 1, px: 2, pt: 2 }}>
        New Member Events
      </Typography>

      {teamTypeOptions.length > 1 && (
        <FormGroup row sx={{ px: 2, mb: 1 }}>
          {teamTypeOptions.map((teamType) => (
            <FormControlLabel
              key={teamType.teamTypeId}
              control={
                <Checkbox
                  size="small"
                  checked={selectedTeamTypeIds.includes(teamType.teamTypeId)}
                  onChange={() => toggleTeamType(teamType.teamTypeId)}
                />
              }
              label={<Typography variant="body2">{teamType.name}</Typography>}
            />
          ))}
        </FormGroup>
      )}

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, px: 1 }}>
        {filteredEvents.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ px: 1, py: 2, textAlign: 'center' }}>
            No upcoming new member events
          </Typography>
        ) : (
          filteredEvents.map((event) => <EventBlock key={event.eventId} event={event} />)
        )}
      </Box>
    </Box>
  );
};

export default NewMemberEventsWidget;
