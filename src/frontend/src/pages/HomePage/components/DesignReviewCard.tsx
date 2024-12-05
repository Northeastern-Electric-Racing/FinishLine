import { Box, Card, CardContent, Link, Stack, Typography, useTheme } from '@mui/material';
import { DesignReview, User } from 'shared';
import { datePipe, projectWbsPipe } from '../../../utils/pipes';
import { routes } from '../../../utils/routes';
import { Link as RouterLink } from 'react-router-dom';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import { LocationOnOutlined } from '@mui/icons-material';
import { useHistory } from 'react-router-dom';
import { NERButton } from '../../../components/NERButton';
import { meetingStartTimePipe } from '../../../../../backend/src/utils/design-reviews.utils';

interface DesignReviewProps {
  designReview: DesignReview;
  user: User;
}

const DisplayStatus: React.FC<DesignReviewProps> = ({ designReview, user }) => {
  const history = useHistory();
  return (
    //is this what we want
    <>
      {!designReview.status || !designReview.confirmedMembers.includes(user) ? (
        <NERButton
          variant="contained"
          size="small"
          sx={{ color: 'white' }}
          onClick={() => {
            history.push(`${routes.CALENDAR}/${designReview.designReviewId}`);
          }}
          component={RouterLink}
        >
          Confirm Availibility
        </NERButton>
      ) : (
        <Typography mr={1}>{designReview.status}</Typography>
      )}
    </>
  );
};

function getWeekday(date: Date): string {
  const weekdays: string[] = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return weekdays[date.getDay()];
}

function removeYear(str: string): string {
  return str.substring(0, str.length - 5);
}

const UpcomingDesignReviewsCard: React.FC<DesignReviewProps> = ({ designReview, user }) => {
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
              <Typography>{<CalendarMonthIcon sx={{ fontSize: 21 }} />}</Typography>
              <Typography fontWeight={'regular'} variant="body2">
                {getWeekday(designReview.dateScheduled) +
                  ', ' +
                  removeYear(datePipe(designReview.dateScheduled)) +
                  ' @ ' +
                  meetingStartTimePipe(designReview.meetingTimes)}
              </Typography>
            </Stack>
            <Stack direction="row" spacing={1}>
              <Typography>{<LocationOnOutlined sx={{ fontSize: 21 }} />}</Typography>
              <Typography fontWeight={'regular'} variant="body2">
                {designReview.location}
              </Typography>
            </Stack>
          </Box>
          <DisplayStatus designReview={designReview} user={user} />
        </Stack>
      </CardContent>
    </Card>
  );
};

export default UpcomingDesignReviewsCard;
