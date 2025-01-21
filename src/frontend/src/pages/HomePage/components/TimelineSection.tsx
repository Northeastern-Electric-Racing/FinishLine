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
import { dateMonthDayYear, isPastEvent } from '../../../utils/datetime.utils';

const TimelineSection = () => {
  const { isLoading, isError, error, data: milestones } = useAllMilestones();

  if (isLoading || !milestones) return <LoadingIndicator />;
  if (isError) return <ErrorPage error={error} message={error.message} />;

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
        maxHeight: 'calc(100vh - 200px)',
        minHeight: 'calc(100vh - 250px)',
        alignItems: 'stretch',
        justifyContent: 'center'
      }}
    >
      <Timeline
        position="alternate"
        sx={{
          flex: 1,
          minHeight: '100%'
        }}
      >
        {sortedMilestones.map((milestone, index) => (
          <TimelineItem key={milestone.milestoneId} sx={{ flexGrow: 1 }}>
            <TimelineSeparator>
              <TimelineDot sx={getDotStyle(milestone.dateOfEvent)} />
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
