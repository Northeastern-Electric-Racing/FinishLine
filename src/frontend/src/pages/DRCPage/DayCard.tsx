import { Card, CardContent, Grid, IconButton, Typography } from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';

interface DayCardProps {
  myDate: Date;
  events: String[];
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

  return (
    <Card sx={{ borderRadius: 2, minWidth: 150, maxWidth: 150, minHeight: 90, maxHeight: 90 }}>
      <CardContent sx={{ padding: 0 }}>
        <DayCardTitle />
        <Typography fontSize="small"></Typography>
      </CardContent>
    </Card>
  );
};
export default DayCard;
