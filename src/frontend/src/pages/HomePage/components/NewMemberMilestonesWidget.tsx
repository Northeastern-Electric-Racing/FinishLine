import { useMemo } from 'react';
import { Box, Typography, useTheme } from '@mui/material';
import { formatDateOnly } from 'shared';
import ErrorPage from '../../ErrorPage';
import LoadingIndicator from '../../../components/LoadingIndicator';
import { useNewMemberMilestones } from '../../../hooks/recruitment.hooks';
import { isPastEvent } from '../../../utils/datetime.utils';

const NewMemberMilestonesWidget: React.FC = () => {
  const theme = useTheme();
  const { data: milestones, isLoading, isError, error } = useNewMemberMilestones();

  const sortedMilestones = useMemo(() => {
    return [...(milestones ?? [])].sort(
      (a, b) => new Date(a.dateOfEvent).getTime() - new Date(b.dateOfEvent).getTime()
    );
  }, [milestones]);

  if (isError) return <ErrorPage message={error?.message} />;
  if (isLoading || !milestones) return <LoadingIndicator />;

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
        Onboarding Milestones
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, px: 2 }}>
        {sortedMilestones.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ px: 1, py: 2, textAlign: 'center' }}>
            No onboarding milestones yet
          </Typography>
        ) : (
          sortedMilestones.map((milestone) => {
            const isPast = isPastEvent(new Date(milestone.dateOfEvent), new Date());
            return (
              <Box key={milestone.milestoneId} sx={{ py: 1, opacity: isPast ? 0.5 : 1 }}>
                <Typography variant="caption" color="text.secondary">
                  {formatDateOnly(new Date(milestone.dateOfEvent), 'MMMM D, YYYY')}
                </Typography>
                <Typography variant="body1" fontWeight="bold">
                  {milestone.name}
                </Typography>
                {milestone.description && (
                  <Typography variant="body2" color="text.secondary">
                    {milestone.description}
                  </Typography>
                )}
              </Box>
            );
          })
        )}
      </Box>
    </Box>
  );
};

export default NewMemberMilestonesWidget;
