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
import dayjs from 'dayjs';

const TimelineSection = () => {
  const { isLoading, isError, error, data: mileStones } = useAllMilestones();

  if (isLoading || !mileStones) return <LoadingIndicator />;
  if (isError) return <ErrorPage error={error} message={error.message} />;

  const isPastEvent = (date: Date) => {
    return date < new Date();
  };

  const getDotColor = (date: Date) => (isPastEvent(date) ? 'primary' : 'grey');
  const getConnectorStyle = (date: Date) => ({
    height: {
      xs: '0.1px',
      sm: '1vh',
      md: '10vh'
    },
    backgroundColor: isPastEvent(date) ? 'primary.main' : 'grey'
  });

  return (
    <Grid>
      <Timeline position="alternate">
        {mileStones.map((milestone, index) => (
          <TimelineItem key={index}>
            <TimelineSeparator>
              <TimelineDot color={getDotColor(milestone.dateOfEvent)} sx={{ width: '20px', height: '20px' }} />
              {index < mileStones.length - 1 && <TimelineConnector sx={getConnectorStyle(milestone.dateOfEvent)} />}
            </TimelineSeparator>
            <TimelineContent>
              <Typography variant="h4" sx={{ fontSize: 29 }}>
                {milestone.name}
              </Typography>
              <Typography variant="body1" sx={{ fontSize: 20 }}>
                {dayjs(milestone.dateOfEvent).format('MMMM D, YYYY')}
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
