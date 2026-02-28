import { Box, Card, CardContent, Link, Stack, Typography, useTheme } from '@mui/material';
import { AuthenticatedUser, Event } from 'shared';
import { datePipe, meetingStartTimePipeScheduleSlot, projectWbsPipe } from '../../../utils/pipes';
import { routes } from '../../../utils/routes';
import { Link as RouterLink } from 'react-router-dom';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import { LocationOnOutlined, Computer } from '@mui/icons-material';
import { useHistory } from 'react-router-dom';
import { NERButton } from '../../../components/NERButton';
import { formatDateOnly, formatEventDate } from 'shared';

interface EventProps {
  event: Event;
  user: AuthenticatedUser;
}

const EventInfo = ({ icon, text, link }: { icon: React.ReactNode; text: string; link?: boolean }) => {
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

const DisplayStatus: React.FC<EventProps> = ({ event, user }) => {
  const history = useHistory();
  const confirmedMemberIds = event.confirmedMembers.map((user) => user.userId);

  return (
    <>
      {!confirmedMemberIds.includes(user.userId) ? (
        <NERButton
          variant="contained"
          size="small"
          sx={{ color: 'white', padding: 1 }}
          onClick={() => {
            history.push(`${routes.SETTINGS_PREFERENCES}?eventId=${event.eventId}`);
          }}
          component={RouterLink}
        >
          Confirm Availibility
        </NERButton>
      ) : (
        <Typography mr={1}>{event.status}</Typography>
      )}
    </>
  );
};

const getWeekday = (date: Date): string => {
  const weekdays: string[] = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  return weekdays[date.getDay()];
};

const removeYear = (str: string): string => {
  return str.substring(0, str.length - 5);
};

const UpcomingEventCard: React.FC<EventProps> = ({ event, user }) => {
  const theme = useTheme();
  const firstScheduledDate = event.initialDateScheduled || event.scheduledTimes[0]?.startTime;
  const displayDate = firstScheduledDate ? new Date(firstScheduledDate) : new Date();
  // initialDateScheduled is a date-only field (@db.Date), scheduledTimes startTime is a full datetime
  const isDateOnly = !!event.initialDateScheduled;
  const formattedDate = isDateOnly ? formatDateOnly(displayDate, 'MM/DD') : formatEventDate(displayDate);

  const [firstWorkPackage] = event.workPackages;

  const wbsNumber = firstWorkPackage
    ? {
        carNumber: firstWorkPackage.wbsElement.carNumber,
        projectNumber: firstWorkPackage.wbsElement.projectNumber,
        workPackageNumber: firstWorkPackage.wbsElement.workPackageNumber
      }
    : { carNumber: 0, projectNumber: 0, workPackageNumber: 0 };

  const eventName = firstWorkPackage?.wbsElement?.name
    ? `${firstWorkPackage.wbsElement.carNumber}.${firstWorkPackage.wbsElement.projectNumber}.${firstWorkPackage.wbsElement.workPackageNumber} - ${firstWorkPackage.wbsElement.name}`
    : event.title;

  return (
    <Card
      variant="outlined"
      sx={{
        width: '100%',
        height: 'fit-content',
        mr: 3,
        background: theme.palette.background.default,
        borderRadius: 2
      }}
    >
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems={'center'}>
          <Box sx={{ scrollbarWidth: 'auto', scrollbarColor: `${theme.palette.primary.main} transparent` }}>
            <Typography fontWeight={'regular'} variant="h5" noWrap>
              <Link component={RouterLink} to={`${routes.PROJECTS}/${projectWbsPipe(wbsNumber)}`}>
                {eventName}
              </Link>
            </Typography>
            <Stack direction="row" spacing={1} sx={{ mt: 0.5 }}>
              <Typography>{<CalendarMonthIcon sx={{ fontSize: 21 }} />}</Typography>
              <Typography fontWeight={'regular'} variant="body2">
                {getWeekday(displayDate) +
                  ', ' +
                  formattedDate +
                  ' @ ' +
                  meetingStartTimePipeScheduleSlot(event.scheduledTimes)}
              </Typography>
            </Stack>
            {event.location && <EventInfo icon={<LocationOnOutlined />} text={event.location} />}
            {event.zoomLink && <EventInfo icon={<Computer />} text={event.zoomLink} link />}
          </Box>
          <DisplayStatus event={event} user={user} />
        </Stack>
      </CardContent>
    </Card>
  );
};

export default UpcomingEventCard;
