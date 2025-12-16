import { Box, Stack, Typography } from '@mui/material';
import WarningIcon from '@mui/icons-material/Warning';
import { usePendingConflicts } from '../../hooks/calendar.hooks';
import { useHistory } from 'react-router-dom';

const SchedulingConflictsWarning: React.FC = () => {
  const { data: conflicts, isLoading } = usePendingConflicts();
  const history = useHistory();

  // Don't show if loading or no conflicts
  if (isLoading || !conflicts || conflicts.length === 0) {
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
