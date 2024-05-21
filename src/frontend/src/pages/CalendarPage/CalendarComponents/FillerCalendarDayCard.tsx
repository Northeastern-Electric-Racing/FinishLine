import { Box, Card, CardContent, Typography, useTheme } from '@mui/material';

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
        backgroundColor: theme.palette.grey[900]
      }}
    >
      <CardContent sx={{ padding: 0 }}>
        <Box textAlign={['left', 'right']}>
          <Typography variant="h6" marginRight={1} color="grey">
            {day}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};
export default FillerCalendarDayCard;
