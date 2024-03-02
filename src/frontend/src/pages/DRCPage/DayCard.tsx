import { Box, Card, CardContent, Grid, IconButton, Typography } from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { DesignReview } from 'shared';

interface DayCardProps {
  myDate: Date;
  events: DesignReview[] | undefined;
}

const DayCard: React.FC<DayCardProps> = ({ myDate, events }) => {
  const DayCardTitle = () => (
    <Grid container alignItems="center" margin={0} padding={0}>
      <Grid item>
        <IconButton>
          <AddCircleOutlineIcon fontSize="small" />
        </IconButton>
      </Grid>
      <Grid item xs display="flex" justifyContent="flex-end">
        <Typography variant="h6" marginRight={1}>
          {myDate.getDate()}
        </Typography>
      </Grid>
    </Grid>
  );

  const EventCard = (event: DesignReview) => {
    const name = event.designReviewId;
    // number of minutes after midnight
    const time = event.meetingTimes[0] * 15 + 9 * 60;
    const minutes = time % 60;
    const hours = ((time - minutes) / 60) % 12 === 0 ? 12 : ((time - minutes) / 60) % 12;
    return (
      <Box marginLeft={0.5}>
        <Card sx={{ backgroundColor: 'red', borderRadius: 1, minWidth: 140, maxWidth: 140, minHeight: 20, maxHeight: 20 }}>
          <Typography marginLeft={0.5} marginBottom={0.3}>
            {name + ' ' + hours + (minutes !== 0 ? ':' + minutes : '') + (time >= 720 ? 'pm' : 'am')}
          </Typography>
        </Card>
      </Box>
    );
  };
  console.log(myDate, events);
  return (
    <Box>
      <Card sx={{ borderRadius: 2, minWidth: 150, maxWidth: 150, minHeight: 90, maxHeight: 90 }}>
        <CardContent sx={{ padding: 0 }}>
          <DayCardTitle />
          {events && events.map((event) => EventCard(event))}
        </CardContent>
      </Card>
    </Box>
  );
};
export default DayCard;
