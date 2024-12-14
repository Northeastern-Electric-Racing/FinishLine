import { Box, Card, CardContent, Link, Stack, Typography, useTheme } from '@mui/material';
import { DesignReview, User } from 'shared';
import { datePipe, projectWbsPipe } from '../../../utils/pipes';
import { routes } from '../../../utils/routes';
import { Link as RouterLink } from 'react-router-dom';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import { LocationOnOutlined, Computer } from '@mui/icons-material';
import { useHistory } from 'react-router-dom';
import { NERButton } from '../../../components/NERButton';
import { meetingStartTimePipe } from '../../../../../backend/src/utils/design-reviews.utils';
import { timezoneOffset } from '../../../utils/datetime.utils';

interface DesignReviewProps {
  designReview: DesignReview;
  user: User;
}

const DesignReviewInfo = ({ icon, text, link }: { icon: React.ReactNode; text: string; link?: boolean }) => {
  return (
    <Stack direction="row" spacing={1}>
      <Typography sx={{ fontSize: 21 }}>{icon}</Typography>
      {link ? (
        <Link href={text}>
          <Typography fontWeight={'regular'} variant="body2">
            {text}
          </Typography>
        </Link>
      ) : (
        <Typography fontWeight={'regular'} variant="body2">
          {text}
        </Typography>
      )}
    </Stack>
  );
};

const DisplayStatus: React.FC<DesignReviewProps> = ({ designReview, user }) => {
  const history = useHistory();

  const confirmedMemberIds = designReview.confirmedMembers.map((user) => user.userId);
  console.log('CONFIRMED:', confirmedMemberIds);

  return (
    <>
      {!confirmedMemberIds.includes(user.userId) ? (
        <NERButton
          variant="contained"
          size="small"
          sx={{ color: 'white', padding: 1 }}
          onClick={() => {
            history.push(`${routes.SETTINGS_PREFERENCES}?drId=${designReview.designReviewId}`);
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
  const timezoneAdjustedDate = timezoneOffset(designReview.dateScheduled);
  return (
    <Card
      variant="outlined"
      sx={{
        width: '100%',
        minHeight: 'fit-content',
        mr: 3,
        background: theme.palette.background.default,
        borderRadius: 2
      }}
    >
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems={'center'}>
          <Box sx={{ scrollbarWidth: 'auto', scrollbarColor: `${theme.palette.primary.main} transparent` }}>
            <Typography fontWeight={'regular'} variant="h5" noWrap>
              <Link component={RouterLink} to={`${routes.PROJECTS}/${projectWbsPipe(designReview.wbsNum)}`}>
                {designReview.wbsName}
              </Link>
            </Typography>
            <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
              <Typography>{<CalendarMonthIcon sx={{ fontSize: 21 }} />}</Typography>
              <Typography fontWeight={'regular'} variant="body2">
                {getWeekday(timezoneAdjustedDate) +
                  ', ' +
                  removeYear(datePipe(timezoneAdjustedDate)) +
                  ' @ ' +
                  meetingStartTimePipe(designReview.meetingTimes)}
              </Typography>
            </Stack>
            {designReview.isInPerson && !!designReview.location && (
              <DesignReviewInfo icon={<LocationOnOutlined />} text={designReview.location} />
            )}
            {designReview.isOnline && !!designReview.zoomLink && (
              <DesignReviewInfo icon={<Computer />} text={designReview.zoomLink} link />
            )}
          </Box>
          <DisplayStatus designReview={designReview} user={user} />
        </Stack>
      </CardContent>
    </Card>
  );
};

export default UpcomingDesignReviewsCard;
