/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */
import { useMemo, useState } from 'react';
import { Box, Checkbox, FormControlLabel, FormGroup, Typography, useTheme } from '@mui/material';
import { formatEventTime } from 'shared';
import ErrorPage from '../../ErrorPage';
import LoadingIndicator from '../../../components/LoadingIndicator';
import { useNewMemberEvents } from '../../../hooks/calendar.hooks';
import { useAllTeamTypes } from '../../../hooks/team-types.hooks';
import { eventsToNextEventInstance } from '../../../utils/calendar.utils';
import { datePipe } from '../../../utils/pipes';

const NewMemberEventsWidget: React.FC = () => {
  const theme = useTheme();
  const { data: events, isLoading: eventsIsLoading, isError: eventsIsError, error: eventsError } = useNewMemberEvents();
  const {
    data: teamTypes,
    isLoading: teamTypesIsLoading,
    isError: teamTypesIsError,
    error: teamTypesError
  } = useAllTeamTypes();
  const [selectedTeamTypeIds, setSelectedTeamTypeIds] = useState<string[]>([]);

  const upcomingOccurrences = useMemo(() => {
    const filteredEvents =
      selectedTeamTypeIds.length === 0
        ? (events ?? [])
        : (events ?? []).filter((event) => event.teamType && selectedTeamTypeIds.includes(event.teamType.teamTypeId));

    return eventsToNextEventInstance(filteredEvents)
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
      .slice(0, 3);
  }, [events, selectedTeamTypeIds]);

  const toggleTeamType = (teamTypeId: string) => {
    setSelectedTeamTypeIds((prev) =>
      prev.includes(teamTypeId) ? prev.filter((id) => id !== teamTypeId) : [...prev, teamTypeId]
    );
  };

  if (eventsIsError) return <ErrorPage message={eventsError?.message} />;
  if (teamTypesIsError) return <ErrorPage message={teamTypesError?.message} />;
  if (eventsIsLoading || !events || teamTypesIsLoading || !teamTypes) return <LoadingIndicator />;

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

      {teamTypes.length > 1 && (
        <FormGroup row sx={{ px: 2, mb: 1 }}>
          {teamTypes.map((teamType) => (
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

      {upcomingOccurrences.length === 0 ? (
        <Typography variant="body2" color="text.secondary" sx={{ px: 2, py: 2, textAlign: 'center' }}>
          No upcoming new member events
        </Typography>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, px: 1.5 }}>
          {upcomingOccurrences.map((event) => (
            <Box
              key={event.eventId + event.scheduleSlotId}
              sx={{
                width: '100%',
                borderLeft: '4px solid #ef4345',
                borderRadius: '4px',
                backgroundColor: 'rgba(239, 67, 69, 0.08)',
                px: 1.5,
                py: 1
              }}
            >
              <Typography variant="caption" fontWeight="bold" sx={{ color: '#ef4345' }}>
                {datePipe(event.startTime)} · {formatEventTime(new Date(event.startTime))}
              </Typography>
              <Typography variant="body1" fontWeight="bold">
                {event.title}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {event.location ? event.location : event.zoomLink ? event.zoomLink : 'N/A'}
              </Typography>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default NewMemberEventsWidget;
