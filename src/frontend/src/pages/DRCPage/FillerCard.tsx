import { Box, Card, CardContent, Grid, Typography, useTheme } from '@mui/material';

interface FillerCardProps {
  day: Number;
}

const FillerCard: React.FC<FillerCardProps> = ({ day }) => {
  const FillerCardTitle = () => (
    <Grid container alignItems="center" margin={0} padding={0}>
      <Grid item></Grid>
      <Grid item xs display="flex" justifyContent="flex-end">
        <Typography variant="h6" marginRight={1} color="grey">
          {day}
        </Typography>
      </Grid>
    </Grid>
  );

  const theme = useTheme();

  return (
    <Box>
      <Card
        sx={{
          borderRadius: 2,
          minWidth: 150,
          maxWidth: 150,
          minHeight: 90,
          maxHeight: 90,
          backgroundColor: theme.palette.grey[900]
        }}
      >
        <CardContent sx={{ padding: 0 }}>
          <FillerCardTitle></FillerCardTitle>
        </CardContent>
      </Card>
    </Box>
  );
};
export default FillerCard;
