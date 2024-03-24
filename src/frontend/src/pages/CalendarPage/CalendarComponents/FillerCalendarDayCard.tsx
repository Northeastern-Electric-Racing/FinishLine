import { Box, Card, CardContent, Typography, useTheme } from '@mui/material';

interface FillerCalendarDayCardProps {
  day: Number;
}

const FillerCalendarDayCard: React.FC<FillerCalendarDayCardProps> = ({ day }) => {
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
          <Box textAlign={['left', 'right']}>
            <Typography variant="h6" marginRight={1} color="grey">
              {day}
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};
export default FillerCalendarDayCard;
