import { Card, CardContent, Grid, IconButton, Typography } from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';

interface DayCardProps {
  myDate: Date;
  events: String[];
}

const DayCard: React.FC<DayCardProps> = ({ myDate, events }) => {
  const DayCardTitle = () => (
    <Grid container alignItems="center">
      <Grid item>
        <IconButton>
          <AddCircleOutlineIcon />
        </IconButton>
      </Grid>
      <Grid item xs display="flex" justifyContent="flex-end">
        <Typography variant="h5">{myDate.getDate()}</Typography>
      </Grid>
    </Grid>
  );

  return (
    <Card sx={{ borderRadius: 5, minWidth: 150, maxWidth: 150, minHeight: 100 }}>
      <CardContent>
        <DayCardTitle />
        <Typography>{myDate.getDay()}</Typography>
      </CardContent>
    </Card>
  );
};
export default DayCard;
