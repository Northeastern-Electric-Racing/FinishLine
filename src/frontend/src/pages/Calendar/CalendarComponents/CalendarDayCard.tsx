import { Box, Card, CardContent, Grid, IconButton, Stack, SvgIcon, Typography } from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { DesignReview } from 'shared';
import { meetingStartTimePipe } from '../../../utils/pipes';
import { getTeamTypeIcon } from '../../../utils/design-review.utils';

interface CalendarDayCardProps {
  cardDate: Date;
  events: DesignReview[];
}

const CalendarDayCard: React.FC<CalendarDayCardProps> = ({ cardDate, events }) => {
  const DayCardTitle = () => (
    <Grid container alignItems="center" margin={0} padding={0}>
      <Grid item>
        <IconButton>
          <AddCircleOutlineIcon fontSize="small" />
        </IconButton>
      </Grid>
      <Grid item xs display="flex" justifyContent="flex-end">
        <Typography variant="h6" marginRight={1}>
          {cardDate.getDate()}
        </Typography>
      </Grid>
    </Grid>
  );

  const EventCard = (event: DesignReview) => {
    const name = event.designReviewId;
    return (
      <Box marginLeft={0.5} marginBottom={0.2}>
        <Card sx={{ backgroundColor: 'red', borderRadius: 1, minWidth: 140, maxWidth: 140, minHeight: 20, maxHeight: 20 }}>
          <Stack direction="row">
            <SvgIcon inheritViewBox fontSize="small"></SvgIcon>
            <Typography marginLeft={0.5} marginBottom={0.3}>
              {name + ' ' + meetingStartTimePipe(event.meetingTimes)}
            </Typography>
          </Stack>
        </Card>
      </Box>
    );
  };

  const ExtraEventsCard = (extraEvents: number) => {
    return (
      <Box marginLeft={0.5} marginBottom={0.2}>
        <Card sx={{ backgroundColor: 'grey', borderRadius: 1, minWidth: 140, maxWidth: 140, minHeight: 20, maxHeight: 20 }}>
          <Typography marginLeft={0.5} marginBottom={0.3} align="center">
            {'+' + extraEvents}
          </Typography>
        </Card>
      </Box>
    );
  };

  return (
    <Card sx={{ borderRadius: 2, minWidth: 150, maxWidth: 150, minHeight: 90, maxHeight: 90 }}>
      <CardContent sx={{ padding: 0 }}>
        <DayCardTitle />
        {events.length < 3 ? (
          events.map((event) => EventCard(event))
        ) : (
          <>
            {EventCard(events[1])}
            {ExtraEventsCard(events.length - 1)}
          </>
        )}
      </CardContent>
    </Card>
  );
};
export default CalendarDayCard;
