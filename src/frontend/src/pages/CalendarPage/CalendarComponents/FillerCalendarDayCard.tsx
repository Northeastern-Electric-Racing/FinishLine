import { Grid, Card, CardContent, Typography, useTheme, IconButton } from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';

interface FillerCalendarDayCardProps {
  day: Number;
}

const FillerCalendarDayCard: React.FC<FillerCalendarDayCardProps> = ({ day }) => {
  const theme = useTheme();

  return (
    <Card
      sx={{
        borderRadius: 2,
        width: { xs: '95%', md: '80%' },
        height: { xs: '10vh', sm: '15vh' },
        backgroundColor: theme.palette.grey[300]
      }}
    >
      <CardContent sx={{ padding: 0 }}>
        <Grid container alignItems="center" margin={0} padding={0}>
          <Grid item>
            <IconButton disabled sx={{ opacity: 0 }}>
              <AddCircleOutlineIcon fontSize="small" />
            </IconButton>
          </Grid>
          <Grid item xs display="flex" justifyContent="flex-end">
            <Typography variant="h6" marginRight={1} noWrap>
              {day}
            </Typography>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
};
export default FillerCalendarDayCard;
