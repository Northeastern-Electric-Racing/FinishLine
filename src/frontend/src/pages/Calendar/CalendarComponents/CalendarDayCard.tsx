import { Box, Card, CardContent, Grid, IconButton, Typography } from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { DesignReview } from 'shared';
import { meetingStartTimePipe } from '../../../utils/pipes';

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
      <Box marginLeft={0.5}>
        <Card sx={{ backgroundColor: 'red', borderRadius: 1, minWidth: 140, maxWidth: 140, minHeight: 20, maxHeight: 20 }}>
          <Typography marginLeft={0.5} marginBottom={0.3}>
            {name + ' ' + meetingStartTimePipe(event.meetingTimes)}
          </Typography>
        </Card>
      </Box>
    );
  };

  return (
    <Card sx={{ borderRadius: 2, minWidth: 150, maxWidth: 150, minHeight: 90, maxHeight: 90 }}>
      <CardContent sx={{ padding: 0 }}>
        <DayCardTitle />
        {events.map((event) => EventCard(event))}
      </CardContent>
    </Card>
  );
};
export default CalendarDayCard;
