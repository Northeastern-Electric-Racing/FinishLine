import { Box, Card, CardContent, Link, Stack, Typography, useTheme } from '@mui/material';
import { DesignReview } from 'shared';
import { datePipe, projectWbsPipe } from '../../../utils/pipes';
import { routes } from '../../../utils/routes';
import { Link as RouterLink } from 'react-router-dom';
import { CalendarTodayOutlined } from '@mui/icons-material';
import { LocationOnOutlined } from '@mui/icons-material';

interface DesignReviewProps {
  designReview: DesignReview;
}

/*
  Questions:
  is there a better way to choose a day as a string?
  is there a better way to remove the year from a date?
  what does the list of times mean? I just chose the first time and hard coded it to be a pm. idk if this was right
  how do i make the button to confirm your avalibilty?
*/

function getWeekday(date: Date): string {
  const weekdays: string[] = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return weekdays[date.getDay()];
}

function removeYear(str: string): string {
  return str.substring(0, str.length - 5);
}

const UpcomingDesignReviewsCard: React.FC<DesignReviewProps> = ({ designReview }) => {
  const theme = useTheme();
  return (
    <Card
      variant="outlined"
      sx={{
        minWidth: 'fit-content',
        mr: 3,
        background: theme.palette.background.default
      }}
    >
      <CardContent sx={{ padding: 1, ml: 1 }}>
        <Stack direction="row" justifyContent="space-between" alignItems={'center'}>
          <Box>
            <Typography fontWeight={'regular'} variant="h5" noWrap>
              <Link
                color={'#e34041'}
                component={RouterLink}
                to={`${routes.PROJECTS}/${projectWbsPipe(designReview.wbsNum)}`}
              >
                {designReview.wbsName}
              </Link>
            </Typography>
            <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
              <Typography>{<CalendarTodayOutlined sx={{ fontSize: 21 }} />}</Typography>
              <Typography fontWeight={'regular'} variant="body2">
                {getWeekday(designReview.dateScheduled) +
                  ', ' +
                  removeYear(datePipe(designReview.dateScheduled)) +
                  ' @ ' +
                  designReview.meetingTimes[0] +
                  'pm'}
              </Typography>
            </Stack>
            <Stack direction="row" spacing={1}>
              <Typography>{<LocationOnOutlined sx={{ fontSize: 21 }} />}</Typography>
              <Typography fontWeight={'regular'} variant="body2">
                {designReview.location}
              </Typography>
            </Stack>
          </Box>
          <Typography mr={1}>{designReview.status}</Typography>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default UpcomingDesignReviewsCard;
