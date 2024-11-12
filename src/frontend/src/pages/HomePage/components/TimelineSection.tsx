import { Grid, Typography } from '@mui/material';
import * as React from 'react';
import Timeline from '@mui/lab/Timeline';
import TimelineItem from '@mui/lab/TimelineItem';
import TimelineSeparator from '@mui/lab/TimelineSeparator';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineDot from '@mui/lab/TimelineDot';
import { useAllMilestones } from '../../../hooks/recruitment.hooks';
import LoadingIndicator from '../../../components/LoadingIndicator';
import ErrorPage from '../../ErrorPage';
import { dateMonthDayYear } from '../../../utils/datetime.utils';

const TimelineSection = () => {
  const { isLoading, isError, error, data: milestones } = useAllMilestones();

  if (isLoading || !milestones) return <LoadingIndicator />;
  if (isError) return <ErrorPage error={error} message={error.message} />;

  const isPastEvent = (date: Date) => {
    return date < new Date();
  };

  const getDotColor = (date: Date) => (isPastEvent(date) ? 'primary' : 'grey');
  const getConnectorStyle = (date: Date) => ({
    height: {
      xs: '1vh',
      sm: '1vh',
      md: '10vh'
    },
    backgroundColor: isPastEvent(date) ? 'primary.main' : 'grey'
  });

  return (
    <Grid>
      <Timeline position="alternate">
        {milestones.map((milestone, index) => (
          <TimelineItem key={index}>
            <TimelineSeparator>
              <TimelineDot color={getDotColor(milestone.dateOfEvent)} sx={{ width: '20px', height: '20px' }} />
              {index < milestones.length - 1 && <TimelineConnector sx={getConnectorStyle(milestone.dateOfEvent)} />}
            </TimelineSeparator>
            <TimelineContent>
              <Typography variant="h4" sx={{ fontSize: 28 }}>
                {milestone.name}
              </Typography>
              <Typography variant="body1" sx={{ fontSize: 20 }}>
                {dateMonthDayYear(milestone.dateOfEvent)}
              </Typography>
              <Typography variant="body2">{milestone.description}</Typography>
            </TimelineContent>
          </TimelineItem>
        ))}
      </Timeline>
    </Grid>
  );
};

export default TimelineSection;
