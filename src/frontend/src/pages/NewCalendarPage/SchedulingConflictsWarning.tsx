import { Box, Stack, Typography } from '@mui/material';
import WarningIcon from '@mui/icons-material/Warning';
import { useFilterEvents } from '../../hooks/calendar.hooks';
import { useHistory } from 'react-router-dom';
import { ConflictStatus } from 'shared';
import LoadingIndicator from '../../components/LoadingIndicator';
import ErrorPage from '../ErrorPage';

interface SchedulingConflictsWarningProps {
  memberIds: string[];
  teamIds: string[];
  startPeriod: Date;
  endPeriod: Date;
}

//Component for main new calendar page for scheduling conflicts
const SchedulingConflictsWarning: React.FC<SchedulingConflictsWarningProps> = ({
  memberIds,
  teamIds,
  startPeriod,
  endPeriod
}) => {
  const history = useHistory();

  // Filter for events with pending conflicts using the same filters as the calendar
  const {
    data: conflicts,
    isLoading,
    isError,
    error
  } = useFilterEvents({
    statuses: [ConflictStatus.PENDING],
    startPeriod,
    endPeriod,
    memberIds,
    teamIds
  });

  if (isLoading || !conflicts) {
    return <LoadingIndicator />;
  }

  // There are conflicts, but error fetching them
  if (isError) {
    return <ErrorPage message={error?.message} />;
  }

  // If no conflicts, don't show the warning
  if (conflicts.length === 0) {
    return null;
  }

  return (
    <Box sx={{ width: '100%' }}>
      <Typography variant="body2" fontWeight="bold" sx={{ mb: 1, fontSize: 20, color: 'white' }}>
        Scheduling Conflicts:
      </Typography>
      <Box
        onClick={() => history.push('/calendar/reviews')}
        sx={{
          bgcolor: 'transparent',
          border: '2px solid #FF4444',
          borderRadius: 1.5,
          padding: 2,
          cursor: 'pointer',
          transition: 'all 0.2s',
          '&:hover': {
            borderColor: '#FF6666',
            transform: 'translateY(-1px)'
          }
        }}
      >
        <Stack direction="row" spacing={1.5} alignItems="center">
          <WarningIcon sx={{ color: '#FF4444', fontSize: 28 }} />
          <Stack spacing={0.3}>
            <Typography variant="body2" fontWeight="bold" sx={{ color: '#FF4444', fontSize: 20 }}>
              Requires Action
            </Typography>
            <Typography variant="caption" sx={{ color: '#FF4444', opacity: 0.8, fontSize: 15 }}>
              Click to Resolve
            </Typography>
          </Stack>
        </Stack>
      </Box>
    </Box>
  );
};

export default SchedulingConflictsWarning;
