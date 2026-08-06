import { Grid, Typography, useTheme } from '@mui/material';
import Timeline from '@mui/lab/Timeline';
import TimelineItem from '@mui/lab/TimelineItem';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineDot from '@mui/lab/TimelineDot';
import { formatDateOnly } from 'shared';
import ErrorPage from '../../ErrorPage';
import LoadingIndicator from '../../../components/LoadingIndicator';
import { useNewMemberMilestones } from '../../../hooks/recruitment.hooks';
import { isPastEvent } from '../../../utils/datetime.utils';

const NewMemberMilestonesWidget: React.FC = () => {
  const theme = useTheme();
  const { data: milestones, isLoading, isError, error } = useNewMemberMilestones();

  if (isError) return <ErrorPage message={error?.message} />;
  if (isLoading || !milestones) return <LoadingIndicator />;

  if (milestones.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary" sx={{ px: 1, py: 2, textAlign: 'center' }}>
        No onboarding milestones yet
      </Typography>
    );
  }

  const sortedMilestones = milestones
    .map((milestone) => ({
      ...milestone,
      dateOfEvent: new Date(milestone.dateOfEvent)
    }))
    .sort((milestone1, milestone2) => (milestone1.dateOfEvent < milestone2.dateOfEvent ? -1 : 1));

  const getDotStyle = (date: Date) => ({
    backgroundColor: isPastEvent(date, new Date()) ? 'primary.main' : 'grey',
    width: '20px',
    height: '20px'
  });

  const getConnectorStyle = (date: Date) => ({
    backgroundColor: isPastEvent(date, new Date()) ? 'primary.main' : 'grey',
    flexGrow: 1
  });

  return (
    <Grid
      container
      sx={{
        maxHeight: 'calc(100vh - 250px)',
        overflowY: 'auto',
        alignItems: 'stretch',
        justifyContent: 'center',
        '&::-webkit-scrollbar': {
          width: '20px'
        },
        '&::-webkit-scrollbar-track': {
          backgroundColor: 'transparent'
        },
        '&::-webkit-scrollbar-thumb': {
          backgroundColor: theme.palette.primary.main,
          borderRadius: '20px',
          border: '6px solid transparent',
          backgroundClip: 'content-box'
        },
        scrollbarWidth: 'auto',
        scrollbarColor: `${theme.palette.primary.main} transparent`
      }}
    >
      <Timeline
        position="alternate"
        sx={{
          flex: 1
        }}
      >
        {sortedMilestones.map((milestone, index) => (
          <TimelineItem key={milestone.milestoneId} sx={{ flexGrow: 1 }}>
            <TimelineSeparator>
              <TimelineDot sx={getDotStyle(milestone.dateOfEvent)} />
              {index < milestones.length - 1 && <TimelineConnector sx={getConnectorStyle(milestone.dateOfEvent)} />}
            </TimelineSeparator>
            <TimelineContent>
              <Typography variant="h1" sx={{ fontSize: 20, fontWeight: 'bold' }}>
                {milestone.name}
              </Typography>
              <Typography variant="body1" sx={{ fontSize: 18 }}>
                {formatDateOnly(milestone.dateOfEvent, 'MMMM D, YYYY')}
              </Typography>
              <Typography variant="body1" sx={{ fontSize: 18 }}>
                {milestone.description}
              </Typography>
            </TimelineContent>
          </TimelineItem>
        ))}
      </Timeline>
    </Grid>
  );
};

export default NewMemberMilestonesWidget;
