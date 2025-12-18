/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */
import { useMemo, useState } from 'react';
import { Box, Grid, Stack, Typography, useMediaQuery, useTheme, Button, Alert } from '@mui/material';
import PageLayout from '../../components/PageLayout';
import { Calendar, ConflictStatus, DayOfWeek, Event, EventType } from 'shared';
import CalendarDayCard from './CalendarDayCard';
import { DAY_NAMES, enumToArray, calendarPaddingDays, daysInMonth } from '../../utils/design-review.utils';
import { useConflictingEvents, useFilterEvents } from '../../hooks/calendar.hooks';
import ErrorPage from '../ErrorPage';
import { datePipe } from '../../utils/pipes';
import LoadingIndicator from '../../components/LoadingIndicator';
import EventSummaryModal from '../CalendarPage/EventSummaryModal';
import { useAllTeamTypes } from '../../hooks/team-types.hooks';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import FilterModal from './FilterModal';
import { DateCalendar } from '@mui/x-date-pickers';
import { useCurrentUser } from '../../hooks/users.hooks';
import { useGetUsersTeams } from '../../hooks/teams.hooks';
import { convertIntToDay, getMeetingDates, getOverlapTime } from '../../utils/calendar.utils';
import { filterEventTransformer } from '../../apis/transformers/calendar.transformer';
import WarningIcon from '@mui/icons-material/Warning';
import { useHistory } from 'react-router-dom';

interface NewCalendarPageProps {
  allEventTypes: EventType[];
  yourEvents: Event[];
  reviewEvents: Event[];
  allCalendars: Calendar[];
}

const NewCalendarPage: React.FC<NewCalendarPageProps> = ({ allEventTypes, yourEvents, reviewEvents, allCalendars }) => {
  const theme = useTheme();
  const {
    data: allTeamTypes,
    isLoading: allTeamTypesLoading,
    isError: allTeamTypesIsError,
    error: allTeamTypesError
  } = useAllTeamTypes();

  const [memberIds, setMemberIds] = useState<string[]>([]);
  const [teamIds, setTeamIds] = useState<string[]>([]);
  const [showInvitedEvents, setShowInvitedEvents] = useState<boolean>(true);
  const [showTeamEvents, setShowTeamEvents] = useState<boolean>(true);

  const [displayMonthYear, setDisplayMonthYear] = useState<Date>(new Date());
  const { data: allTeams, isLoading: allTeamsLoading, isError: allTeamsIsError, error: allTeamsError } = useGetUsersTeams();

  const teamList = allTeams?.map((team) => team.teamId) ?? [];
  const user = useCurrentUser();

  const [additionalMemberIds, setAdditionalMemberIds] = useState<string[]>([user.userId]);
  const [additionalTeamIds, setAdditionalTeamIds] = useState<string[]>(teamList);

  const {
    isLoading,
    isError,
    error,
    data: allEvents
  } = useFilterEvents({
    startPeriod: new Date(displayMonthYear.getFullYear(), displayMonthYear.getMonth() - 1, 15),
    endPeriod: new Date(displayMonthYear.getFullYear(), displayMonthYear.getMonth() + 1, 15),
    memberIds: memberIds.concat(additionalMemberIds),
    teamIds: teamIds.concat(additionalTeamIds),
    statuses: [ConflictStatus.APPROVED, ConflictStatus.NO_CONFLICT]
  });

  const history = useHistory();
  const [selectedEvent, setSelectedEvent] = useState<Event>();
  const isLargerView = useMediaQuery(theme.breakpoints.up('md'));
  const isExtraSmallView = useMediaQuery(theme.breakpoints.down('sm'));
  const [openFilterModal, setOpenFilterModal] = useState(false);
  const [pendingEvent, setPendingEvent] = useState(
    yourEvents.filter((event) => event.approved === ConflictStatus.PENDING).length > 0
  );

  const [deniedEvent, setDeniedEvent] = useState(
    yourEvents.filter((event) => event.approved === ConflictStatus.DENIED).length > 0
  );

  const [reviewEvent, setReviewEvent] = useState(
    reviewEvents.filter((event) => event.approvalRequiredFrom?.userId === user.userId).length > 0
  );

  const filteredToPending = yourEvents
    .filter((event) => event.approved === ConflictStatus.PENDING)
    .map((event) => event.eventId);

  const filteredToDenied = yourEvents
    .filter((event) => event.approved === ConflictStatus.DENIED)
    .map((event) => event.eventId);

  const {
    data: conflictingEvents,
    isLoading: conflictingEventsLoading,
    isError: conflictingEventsIsError,
    error: conflictingEventsError
  } = useConflictingEvents(filteredToPending);

  const {
    data: conflictingDeniedEvents,
    isLoading: conflictingDeniedEventsLoading,
    isError: conflictingDeniedEventsIsError,
    error: conflictingDeniedEventsError
  } = useConflictingEvents(filteredToDenied);

  const yourReviewEvents = reviewEvents.filter((event) => event.approvalRequiredFrom?.userId === user.userId);
  const {
    data: untransformedConflictingReviewEvents,
    isLoading: conflictingReviewEventsLoading,
    isError: conflictingReviewEventsIsError,
    error: conflictingReviewEventsError
  } = useConflictingEvents(yourReviewEvents.map((event) => event.eventId));

  const conflictingReviewEvents = untransformedConflictingReviewEvents?.map(filterEventTransformer);

  const updateAdditionalTeamIds = (changed: boolean) => {
    setShowTeamEvents(changed);

    if (changed) {
      setAdditionalTeamIds(teamList);
    } else {
      setAdditionalTeamIds([]);
    }
  };

  const updateAdditionalMemberIds = (changed: boolean) => {
    setShowInvitedEvents(changed);

    if (changed) {
      setAdditionalMemberIds([user.userId]);
    } else {
      setAdditionalMemberIds([]);
    }
  };

  const yourConflicts = useMemo(
    () => conflictingEvents?.filter((event, i) => filteredToPending[i] !== event.eventId) ?? [],
    [conflictingEvents, filteredToPending]
  );

  const yourConflictsDenied = useMemo(
    () => conflictingDeniedEvents?.filter((event, i) => filteredToDenied[i] !== event.eventId) ?? [],
    [conflictingDeniedEvents, filteredToDenied]
  );

  if (
    isLoading ||
    !allEvents ||
    conflictingEventsLoading ||
    !conflictingEvents ||
    conflictingEventsLoading ||
    !conflictingEvents ||
    conflictingDeniedEventsLoading ||
    !conflictingDeniedEvents ||
    conflictingReviewEventsLoading ||
    !conflictingReviewEvents
  )
    return <LoadingIndicator />;
  if (isError) return <ErrorPage message={error.message} />;
  if (conflictingEventsIsError) return <ErrorPage message={conflictingEventsError.message} />;
  if (conflictingDeniedEventsIsError) return <ErrorPage message={conflictingDeniedEventsError.message} />;
  if (conflictingReviewEventsIsError) return <ErrorPage message={conflictingReviewEventsError.message} />;

  const transformedEvents = allEvents.map(filterEventTransformer);

  // Sort events by their first occurrence's start time
  const sortedEvents = [...transformedEvents].sort((event1, event2) => {
    const time1 = event1.scheduledTimes[0]?.startTime ? new Date(event1.scheduledTimes[0].startTime).getTime() : 0;
    const time2 = event2.scheduledTimes[0]?.startTime ? new Date(event2.scheduledTimes[0].startTime).getTime() : 0;
    return time1 - time2;
  });

  const eventDict = new Map<string, Event[]>();
  const dayDict = new Map<string, DayOfWeek>();

  sortedEvents.forEach((event) => {
    const times: Date[] = getMeetingDates(event);

    times.forEach((date) => {
      const eventDate = new Date(date);
      const dateString = datePipe(eventDate);
      eventDate.setHours(0, 0, 0, 0);
      const day = convertIntToDay(eventDate.getDay());
      dayDict.set(dateString, day);
      if (eventDict.has(dateString)) {
        // Check if this event is already in this date's array to avoid duplicates
        const existingEvents = eventDict.get(dateString)!;
        if (!existingEvents.find((e) => e.eventId === event.eventId)) {
          existingEvents.push(event);
        }
      } else {
        eventDict.set(dateString, [event]);
      }
    });
  });

  const startOfEachWeek = [0, 7, 14, 21, 28, 35];

  const isDayInDifferentMonth = (day: number, week: number) => {
    return day < week - 7 || day < 1 || day > week + 7;
  };

  const paddingArrayStart = [...Array<number>(calendarPaddingDays(displayMonthYear)).keys()]
    .map((day) => daysInMonth(new Date(displayMonthYear.getFullYear(), displayMonthYear.getMonth() - 1, 1)) - day)
    .reverse();
  const paddingArrayEnd = [
    ...Array<number>(7 - ((daysInMonth(displayMonthYear) + calendarPaddingDays(displayMonthYear)) % 7)).keys()
  ].map((day) => day + 1);
  const daysThisMonth = paddingArrayStart
    .concat([...Array(daysInMonth(displayMonthYear)).keys()].map((day) => day + 1))
    .concat(paddingArrayEnd.length < 7 ? paddingArrayEnd : []);

  if (!allTeamTypes || allTeamTypesLoading) return <LoadingIndicator />;
  if (allTeamTypesIsError) return <ErrorPage error={allTeamTypesError} message={allTeamTypesError?.message} />;

  if (!allTeams || allTeamsLoading) return <LoadingIndicator />;
  if (allTeamsIsError) return <ErrorPage error={allTeamsError} message={allTeamsError?.message} />;

  return (
    <>
      {selectedEvent && (
        <EventSummaryModal
          open={!!selectedEvent}
          onHide={() => {
            setSelectedEvent(undefined);
          }}
          event={selectedEvent as Event}
          teamTypes={allTeamTypes}
        />
      )}
      <Stack
        spacing={1}
        sx={{
          position: 'fixed',
          top: 24,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 1400,
          maxWidth: 600
        }}
      >
        {deniedEvent && (
          <Alert
            icon={<WarningIcon fontSize="inherit" sx={{ marginTop: 1 }} />}
            variant="filled"
            severity="error"
            onClose={() => setDeniedEvent(false)}
          >
            <Stack direction="row" alignItems="center" spacing={2}>
              <Typography fontSize={14}>
                {' '}
                You have scheduled an event at the same time and location as <i>{yourConflictsDenied[0].title}</i> and was
                denied. Edit the event to put it up for re-approval, or change the time/location to not conflict with other
                events.
              </Typography>
              <Button
                variant="outlined"
                sx={{
                  color: 'white',
                  borderColor: 'white',
                  whiteSpace: 'nowrap',
                  textTransform: 'none',
                  flexShrink: 0,
                  px: 2,
                  '&:hover': {
                    borderColor: 'white',
                    bgcolor: 'rgba(255,255,255,0.1)'
                  }
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  history.push('/calendar/yourEvents');
                }}
              >
                Click Here to View Your Bookings
              </Button>
            </Stack>
          </Alert>
        )}
        {pendingEvent && (
          <Alert
            icon={<WarningIcon fontSize="inherit" />}
            variant="filled"
            severity="error"
            onClose={() => setPendingEvent(false)}
          >
            You have scheduled an event at the same time and location as <i>{yourConflicts[0].title}</i>.{' '}
            <i>
              {yourConflicts[0].userCreated.firstName} {yourConflicts[0].userCreated.lastName}
            </i>{' '}
            has been notified of this and must allow your event to take place in order to continue.
          </Alert>
        )}
        {reviewEvent && (
          <Alert
            icon={<WarningIcon fontSize="inherit" sx={{ marginTop: 1 }} />}
            variant="filled"
            severity="error"
            onClose={() => setReviewEvent(false)}
          >
            <Stack direction="row" alignItems="center" spacing={2}>
              <Typography fontSize={14}>
                {' '}
                <i>
                  {yourReviewEvents[0].userCreated.firstName} {yourReviewEvents[0].userCreated.lastName}
                </i>{' '}
                has scheduled an event at the same time and location as your meeting at{' '}
                {(() => {
                  const overlaps = getOverlapTime(conflictingReviewEvents[0], yourReviewEvents[0]);
                  const eventTime = overlaps[0].event1Time.start.toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit'
                  });
                  return eventTime;
                })()}{' '}
                in {conflictingReviewEvents[0].location}.
              </Typography>
              <Button
                variant="outlined"
                sx={{
                  color: 'white',
                  borderColor: 'white',
                  whiteSpace: 'nowrap',
                  textTransform: 'none',
                  flexShrink: 0,
                  px: 2,
                  '&:hover': {
                    borderColor: 'white',
                    bgcolor: 'rgba(255,255,255,0.1)'
                  }
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  history.push('/calendar/reviews');
                }}
              >
                Click Here to Review Booking
              </Button>
            </Stack>
          </Alert>
        )}
      </Stack>
      <PageLayout hidePageTitle>
        <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between" sx={{ mt: 2, mb: 2 }}>
          <Typography variant="h4"></Typography>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ flexWrap: 'wrap', columnGap: 1, rowGap: 1 }}>
            {/* New Event Button (does not do anything yet) */}
            <Button
              variant="contained"
              disableElevation
              onClick={() => {}}
              endIcon={<AddCircleOutlineIcon sx={{ fontSize: { xs: 24, sm: 30 } }} />}
              sx={{
                flexShrink: 0,
                height: { xs: 36, sm: 40 },
                px: { xs: 1, sm: 1 },
                textTransform: 'none',
                fontFamily: (t) => t.typography.h4.fontFamily,
                fontSize: { xs: 20, sm: 25 },
                fontWeight: 800,
                color: (t) => t.palette.common.white,
                bgcolor: '#F44336',
                '&:hover': { bgcolor: '#FF0000' },
                '& .MuiButton-endIcon svg': { fontSize: 30 }
              }}
              aria-label="Create New Event"
            >
              New Event
            </Button>
          </Stack>
        </Stack>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Grid container>
              {enumToArray(DAY_NAMES).map((day, index) => (
                <Grid item xs={12 / 7} key={index}>
                  <Typography align={'center'} sx={{ fontWeight: 'bold', fontSize: 18 }}>
                    {
                      // Day of the week display based on current breakpoint
                      isLargerView ? day : isExtraSmallView ? day.charAt(0) : day.substring(0, 3)
                    }
                  </Typography>
                </Grid>
              ))}
            </Grid>
            <Box sx={{ border: '2px solid white', borderRadius: 2, bgcolor: '#1a1a1a', p: 1 }}>
              <Grid container marginBottom={2}>
                {startOfEachWeek.map((week, weekIndex) => (
                  <Grid container key={weekIndex}>
                    {daysThisMonth.slice(week, week + 7).map((day, dayIndex) => {
                      const cardDate = new Date(
                        displayMonthYear.getFullYear(),
                        displayMonthYear.getMonth() + (isDayInDifferentMonth(day, week) ? (day > 15 ? -1 : 1) : 0),
                        day
                      );
                      return (
                        <Grid item xs={12 / 7} key={dayIndex}>
                          <Box marginTop={6} sx={{ justifyContent: 'center', display: 'flex' }}>
                            <CalendarDayCard
                              cardDate={cardDate}
                              events={
                                eventDict.get(
                                  datePipe(new Date(cardDate.getTime() + cardDate.getTimezoneOffset() * 60000))
                                ) ?? []
                              }
                              eventTypes={allEventTypes ?? []}
                              calendars={allCalendars ?? []}
                              dayOfWeek={
                                dayDict.get(datePipe(new Date(cardDate.getTime() + cardDate.getTimezoneOffset() * 60000))) ??
                                DayOfWeek.SUNDAY
                              }
                            />
                          </Box>
                        </Grid>
                      );
                    })}
                  </Grid>
                ))}
              </Grid>
            </Box>
          </Box>
          <Box
            sx={{
              width: 320
            }}
          >
            <DateCalendar
              value={displayMonthYear}
              onMonthChange={(newDate) => setDisplayMonthYear(newDate)}
              onChange={(newDate) => {
                if (newDate) setDisplayMonthYear(newDate);
              }}
              slotProps={{
                day: {
                  sx: {
                    '&.Mui-selected': {
                      bgcolor: 'red',
                      '&:hover': {
                        bgcolor: 'darkred'
                      },
                      '&:focus': {
                        bgcolor: 'red'
                      }
                    }
                  }
                }
              }}
            />
            <Button
              variant="outlined"
              id="filter-events-button"
              onClick={() => setOpenFilterModal(true)}
              sx={{
                color: 'white',
                borderColor: 'white',
                backgroundColor: 'transparent',
                '&:hover': {
                  borderColor: 'white',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)'
                }
              }}
            >
              More Filters
            </Button>
          </Box>
        </Box>

        <FilterModal
          open={openFilterModal}
          onClose={() => setOpenFilterModal(false)}
          filterValues={{ memberIds, teamIds, showInvited: showInvitedEvents, showTeam: showTeamEvents }}
          setMemberIds={(ids: string[]) => setMemberIds(ids)}
          setTeamIds={(ids: string[]) => setTeamIds(ids)}
          setShowInvited={(changed: boolean) => updateAdditionalMemberIds(changed)}
          setShowTeam={(changed: boolean) => updateAdditionalTeamIds(changed)}
        />
      </PageLayout>
    </>
  );
};

export default NewCalendarPage;
