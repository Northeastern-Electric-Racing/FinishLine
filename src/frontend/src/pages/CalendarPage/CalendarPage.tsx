/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */
import { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Grid,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
  Button,
  Alert,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Switch
} from '@mui/material';
import PageLayout from '../../components/PageLayout';
import { Calendar, ConflictStatus, DayOfWeek, EventType, Event } from 'shared';
import CalendarDayCard from './CalendarDayCard';
import { DAY_NAMES, enumToArray, calendarPaddingDays, daysInMonth } from '../../utils/design-review.utils';
import { useConflictingEvents, useFilterEvents } from '../../hooks/calendar.hooks';
import ErrorPage from '../ErrorPage';
import { datePipe } from '../../utils/pipes';
import LoadingIndicator from '../../components/LoadingIndicator';
import { useAllTeamTypes } from '../../hooks/team-types.hooks';
import FilterModal from './FilterModal';
import { DateCalendar } from '@mui/x-date-pickers';
import { useCurrentUser } from '../../hooks/users.hooks';
import { useGetUsersTeams } from '../../hooks/teams.hooks';
import {
  convertIntToDay,
  eventsToEventInstances,
  eventsToNextEventInstance,
  getOverlapTime
} from '../../utils/calendar.utils';
import { filterEventTransformer } from '../../apis/transformers/calendar.transformer';
import WarningIcon from '@mui/icons-material/Warning';
import { useHistory } from 'react-router-dom';
import UpcomingMeetingsCard from './UpcomingMeetingsCard';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import { EventInstance } from 'shared';

// localStorage key for calendar filters
const CALENDAR_FILTERS_KEY = 'calendar-filters';

// Interface for stored filter settings
interface CalendarFilterSettings {
  allEventsMode: boolean;
  memberIds: string[];
  teamIds: string[];
  showInvitedEvents: boolean;
  showTeamEvents: boolean;
  selectedCalendarIds: string[];
}

// Load filter settings from localStorage
const loadFilterSettings = (): Partial<CalendarFilterSettings> => {
  try {
    const stored = localStorage.getItem(CALENDAR_FILTERS_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {
    // If parsing fails, return empty object
  }
  return {};
};

// Save filter settings to localStorage
const saveFilterSettings = (settings: CalendarFilterSettings): void => {
  localStorage.setItem(CALENDAR_FILTERS_KEY, JSON.stringify(settings));
};

// Clear filter settings from localStorage
const clearFilterSettings = (): void => {
  localStorage.removeItem(CALENDAR_FILTERS_KEY);
};

interface NewCalendarPageProps {
  allEventTypes: EventType[];
  yourEvents: EventInstance[];
  reviewEvents: Event[];
  allCalendars: Calendar[];
  onCreateEventClick: (date: Date) => void;
}

const NewCalendarPage: React.FC<NewCalendarPageProps> = ({
  allEventTypes,
  yourEvents,
  reviewEvents,
  allCalendars,
  onCreateEventClick
}) => {
  const theme = useTheme();
  const history = useHistory();
  const {
    data: allTeamTypes,
    isLoading: allTeamTypesLoading,
    isError: allTeamTypesIsError,
    error: allTeamTypesError
  } = useAllTeamTypes();

  const user = useCurrentUser();

  // Load initial filter settings from localStorage
  const savedFilters = useMemo(() => loadFilterSettings(), []);

  const [memberIds, setMemberIds] = useState<string[]>(savedFilters.memberIds ?? []);
  const [teamIds, setTeamIds] = useState<string[]>(savedFilters.teamIds ?? []);
  const [displayMonthYear, setDisplayMonthYear] = useState<Date>(new Date());
  const [showInvitedEvents, setShowInvitedEvents] = useState<boolean>(savedFilters.showInvitedEvents ?? true);
  const [showTeamEvents, setShowTeamEvents] = useState<boolean>(savedFilters.showTeamEvents ?? true);
  const [openFilterModal, setOpenFilterModal] = useState(false);
  const [additionalMemberIds, setAdditionalMemberIds] = useState<string[]>([user.userId]);
  const [additionalTeamIds, setAdditionalTeamIds] = useState<string[]>([]);
  const [allEventsMode, setAllEventsMode] = useState<boolean>(savedFilters.allEventsMode ?? true);
  const isLargerView = useMediaQuery(theme.breakpoints.up('md'));
  const isExtraSmallView = useMediaQuery(theme.breakpoints.down('sm'));

  const calendars = allCalendars ?? [];

  const [selectedCalendarIds, setSelectedCalendarIds] = useState<string[]>(() => {
    // Use saved calendar IDs if they exist and are valid, otherwise default to all calendars
    if (savedFilters.selectedCalendarIds && savedFilters.selectedCalendarIds.length > 0) {
      // Filter to only include IDs that still exist in allCalendars
      const validIds = savedFilters.selectedCalendarIds.filter((id) => allCalendars.some((c) => c.calendarId === id));
      return validIds.length > 0 ? validIds : allCalendars.map((c) => c.calendarId);
    }
    return allCalendars.map((c) => c.calendarId);
  });

  const { data: allTeams, isLoading: allTeamsLoading, isError: allTeamsIsError, error: allTeamsError } = useGetUsersTeams();

  const teamList = useMemo(() => allTeams?.map((team) => team.teamId) ?? [], [allTeams]);

  // Save filter settings to localStorage when they change
  useEffect(() => {
    saveFilterSettings({
      allEventsMode,
      memberIds,
      teamIds,
      showInvitedEvents,
      showTeamEvents,
      selectedCalendarIds
    });
  }, [allEventsMode, memberIds, teamIds, showInvitedEvents, showTeamEvents, selectedCalendarIds]);

  useEffect(() => {
    if (allTeams && additionalTeamIds.length === 0 && showTeamEvents && !allEventsMode) {
      setAdditionalTeamIds(teamList);
    }
  }, [allTeams, teamList, additionalTeamIds.length, showTeamEvents, allEventsMode]);

  const startPeriod = new Date(displayMonthYear.getFullYear(), displayMonthYear.getMonth() - 1, 15);
  const endPeriod = new Date(displayMonthYear.getFullYear(), displayMonthYear.getMonth() + 1, 15);

  // When allEventsMode is true, we don't filter by members/teams, but still filter by date and calendars
  const filterArgs = allEventsMode
    ? {
        startPeriod,
        endPeriod,
        statuses: [ConflictStatus.APPROVED, ConflictStatus.NO_CONFLICT],
        calendarIds: selectedCalendarIds
      }
    : {
        startPeriod,
        endPeriod,
        memberIds: [...new Set(memberIds.concat(additionalMemberIds))],
        teamIds: [...new Set(teamIds.concat(additionalTeamIds))],
        statuses: [ConflictStatus.APPROVED, ConflictStatus.NO_CONFLICT],
        calendarIds: selectedCalendarIds
      };

  const { isLoading, isError, error, data: allEvents } = useFilterEvents(filterArgs);

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
    .filter((event) => event.approved === ConflictStatus.PENDING && event.userCreated.userId === user.userId)
    .map((event) => event.eventId);

  const filteredToDenied = yourEvents
    .filter((event) => event.approved === ConflictStatus.DENIED && event.userCreated.userId === user.userId)
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

  const [upcomingStartPeriod] = useState(() => new Date());

  const [upcomingEndPeriod] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    d.setHours(23, 59, 59, 999);
    return d;
  });

  // Upcoming meetings is independent of filters - shows events where user is creator, member, or on associated team
  const { data: upcomingEvents } = useFilterEvents({
    startPeriod: upcomingStartPeriod,
    endPeriod: upcomingEndPeriod,
    memberIds: [user.userId],
    teamIds: teamList
  });

  const upcomingOccurences = eventsToNextEventInstance(upcomingEvents ?? []).sort(
    (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
  );

  const toggleCalendar = (calendarId: string) => {
    setSelectedCalendarIds((prev) =>
      prev.includes(calendarId) ? prev.filter((id) => id !== calendarId) : [...prev, calendarId]
    );
  };

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

  // If filter endpoint errors (e.g., deleted user/team in saved filters), clear filters and retry
  if (isError) {
    // Check if there are any filters that could be causing the error
    if (memberIds.length > 0 || teamIds.length > 0) {
      // Clear saved filters from localStorage and reset state
      clearFilterSettings();
      setMemberIds([]);
      setTeamIds([]);
      return <LoadingIndicator />;
    }
    // No filters to clear, show the error
    return <ErrorPage message={error.message} />;
  }
  if (conflictingEventsIsError) return <ErrorPage message={conflictingEventsError.message} />;
  if (conflictingDeniedEventsIsError) return <ErrorPage message={conflictingDeniedEventsError.message} />;
  if (conflictingReviewEventsIsError) return <ErrorPage message={conflictingReviewEventsError.message} />;

  if (
    isLoading ||
    !allEvents ||
    conflictingEventsLoading ||
    !conflictingEvents ||
    conflictingDeniedEventsLoading ||
    !conflictingDeniedEvents ||
    conflictingReviewEventsLoading ||
    !conflictingReviewEvents
  )
    return <LoadingIndicator />;

  const transformedEvents = allEvents.map(filterEventTransformer);

  // Get user's pending conflict events that aren't already in allEvents
  // These are events the user created that have conflicts requiring approval
  const userPendingConflictEvents = yourEvents
    .filter((event) => event.approved === ConflictStatus.PENDING)
    .filter((event) => event.userCreated.userId === user.userId)
    .filter((event) => {
      // Check if event falls within the display period
      const eventTime = new Date(event.startTime);
      return eventTime >= startPeriod && eventTime <= endPeriod;
    })
    .filter((event) => {
      // Only include if not already in transformedEvents
      return !transformedEvents.some((e) => e.eventId === event.eventId);
    });

  // Merge pending events with regular events
  const allDisplayEvents = [...transformedEvents, ...userPendingConflictEvents.map((e) => ({ ...e, scheduledTimes: [] }))];

  // Sort events by their first occurrence's start time
  const sortedEvents = [...allDisplayEvents].sort((event1, event2) => {
    const time1 = event1.scheduledTimes[0]?.startTime ? new Date(event1.scheduledTimes[0].startTime).getTime() : 0;
    const time2 = event2.scheduledTimes[0]?.startTime ? new Date(event2.scheduledTimes[0].startTime).getTime() : 0;
    return time1 - time2;
  });

  const eventDict = new Map<string, EventInstance[]>();
  const dayDict = new Map<string, DayOfWeek>();

  // Convert events to instances
  const regularInstances = eventsToEventInstances(sortedEvents);

  // For pending conflict events from yourEvents, they're already EventInstances
  const pendingInstances = userPendingConflictEvents;

  // Combine all instances, filtering by shouldShowPendingEvent for pending ones
  const allEventInstances = [...regularInstances, ...pendingInstances].filter((event) => {
    if (event.approved === ConflictStatus.PENDING || event.approved === ConflictStatus.DENIED) {
      return event.userCreated.userId === user.userId;
    }
    return true;
  });

  // Remove duplicates (same eventId + same scheduleSlotId)
  const seenKeys = new Set<string>();
  const eventInstances = allEventInstances.filter((event) => {
    const key = `${event.eventId}-${event.scheduleSlotId}`;
    if (seenKeys.has(key)) return false;
    seenKeys.add(key);
    return true;
  });

  eventInstances.forEach((event) => {
    const eventDate = new Date(event.startTime);
    const dateString = datePipe(eventDate);
    eventDate.setHours(0, 0, 0, 0);
    const day = convertIntToDay(eventDate.getDay());
    dayDict.set(dateString, day);
    if (eventDict.has(dateString)) {
      const existingEvents = eventDict.get(dateString)!;
      existingEvents.push(event);
    } else {
      eventDict.set(dateString, [event]);
    }
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
      <Stack
        spacing={1}
        sx={{
          position: 'absolute',
          top: 24,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 1400,
          maxWidth: 600
        }}
      >
        {deniedEvent && yourConflictsDenied.length > 0 && (
          <Alert
            icon={<WarningIcon fontSize="inherit" sx={{ marginTop: 1 }} />}
            variant="filled"
            severity="error"
            onClick={() => setDeniedEvent(false)}
            onClose={() => setDeniedEvent(false)}
            sx={{
              cursor: 'pointer'
            }}
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
        {pendingEvent && yourConflicts.length > 0 && (
          <Alert
            icon={<WarningIcon fontSize="inherit" />}
            variant="filled"
            severity="error"
            onClick={() => setPendingEvent(false)}
            onClose={() => setPendingEvent(false)}
            sx={{
              cursor: 'pointer'
            }}
          >
            You have scheduled an event at the same time and location as <i>{yourConflicts[0].title}</i>.{' '}
            <i>
              {yourConflicts[0].userCreated.firstName} {yourConflicts[0].userCreated.lastName}
            </i>{' '}
            has been notified of this and must allow your event to take place in order to continue.
          </Alert>
        )}
        {reviewEvent && yourReviewEvents.length > 0 && (
          <Alert
            icon={<WarningIcon fontSize="inherit" sx={{ marginTop: 1 }} />}
            variant="filled"
            severity="error"
            onClick={() => setReviewEvent(false)}
            onClose={() => setReviewEvent(false)}
            sx={{
              cursor: 'pointer'
            }}
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
        <Box
          sx={{
            display: 'flex',
            gap: 2,
            height: 'calc(100vh - 120px)',
            overflow: 'hidden',
            pb: 2
          }}
        >
          <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
            <Grid container sx={{ flexShrink: 0 }}>
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
            <Box
              sx={{
                border: '2px solid white',
                borderRadius: 2,
                bgcolor: '#1a1a1a',
                p: 1,
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden'
              }}
            >
              {startOfEachWeek
                .filter((week) => daysThisMonth.slice(week, week + 7).length > 0)
                .map((week, weekIndex) => (
                  <Box
                    key={weekIndex}
                    sx={{
                      display: 'flex',
                      flex: 1,
                      minHeight: 0
                    }}
                  >
                    {daysThisMonth.slice(week, week + 7).map((day, dayIndex) => {
                      const cardDate = new Date(
                        displayMonthYear.getFullYear(),
                        displayMonthYear.getMonth() + (isDayInDifferentMonth(day, week) ? (day > 15 ? -1 : 1) : 0),
                        day
                      );
                      return (
                        <Box
                          key={dayIndex}
                          sx={{
                            flex: 1,
                            minWidth: 0,
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'stretch',
                            p: 0.5
                          }}
                        >
                          <CalendarDayCard
                            cardDate={cardDate}
                            displayMonth={displayMonthYear}
                            events={
                              eventDict.get(datePipe(new Date(cardDate.getTime() + cardDate.getTimezoneOffset() * 60000))) ??
                              []
                            }
                            eventTypes={allEventTypes ?? []}
                            calendars={allCalendars ?? []}
                            dayOfWeek={
                              dayDict.get(datePipe(new Date(cardDate.getTime() + cardDate.getTimezoneOffset() * 60000))) ??
                              DayOfWeek.SUNDAY
                            }
                            onCreateEventClick={onCreateEventClick}
                          />
                        </Box>
                      );
                    })}
                  </Box>
                ))}
            </Box>
          </Box>
          <Box
            sx={{
              width: 320,
              display: 'flex',
              flexDirection: 'column',
              gap: 0,
              overflow: 'hidden'
            }}
          >
            <Box sx={{ flexShrink: 0 }}>
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
            </Box>
            {/* Upcoming Meetings Section */}
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                flex: 1,
                minHeight: 0,
                overflow: 'hidden',
                mt: -2
              }}
            >
              <Typography align="left" sx={{ fontWeight: 'bold', fontSize: 22, mb: 0.5, flexShrink: 0 }}>
                My Upcoming Meetings:
              </Typography>

              {upcomingOccurences && (
                <Box
                  sx={{
                    flex: 1,
                    overflowX: 'hidden',
                    overflowY: 'auto',
                    scrollbarColor: `${theme.palette.primary.main} transparent`,
                    '&::-webkit-scrollbar': {
                      width: '8px'
                    },
                    '&::-webkit-scrollbar-track': {
                      background: 'transparent'
                    },
                    '&::-webkit-scrollbar-thumb': {
                      background: theme.palette.primary.main,
                      borderRadius: '4px'
                    }
                  }}
                >
                  {upcomingOccurences?.map((event) => (
                    <UpcomingMeetingsCard
                      key={event.eventId + event.scheduleSlotId}
                      event={event}
                      calendars={allCalendars ?? []}
                      eventTypes={allEventTypes ?? []}
                    />
                  ))}
                </Box>
              )}
            </Box>

            {/* Calendar Selector Section */}
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                flex: 1,
                minHeight: 0,
                overflow: 'hidden'
              }}
            >
              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
                justifyContent="space-between"
                sx={{ mb: 1, flexShrink: 0 }}
              >
                <Typography
                  variant="h6"
                  sx={{
                    fontFamily: (t) => t.typography.h4.fontFamily,
                    fontWeight: 400,
                    fontSize: 22
                  }}
                >
                  Calendars:
                </Typography>

                <Stack direction="row" spacing={1} alignItems="center">
                  <FormControlLabel
                    control={
                      <Switch size="small" checked={allEventsMode} onChange={(e) => setAllEventsMode(e.target.checked)} />
                    }
                    label={<Typography sx={{ fontSize: 12, color: 'white', whiteSpace: 'nowrap' }}>All Events</Typography>}
                    sx={{ mr: 0 }}
                  />
                  <Button
                    size="small"
                    variant="outlined"
                    id="filter-events-button"
                    disabled={allEventsMode}
                    onClick={() => setOpenFilterModal(true)}
                    sx={{
                      px: 1,
                      py: 0,
                      color: 'white',
                      borderColor: 'white',
                      backgroundColor: 'transparent',
                      textTransform: 'none',
                      fontSize: 14,
                      fontFamily: (t) => t.typography.h4.fontFamily,
                      '&:hover': {
                        borderColor: 'white',
                        backgroundColor: 'rgba(255, 255, 255, 0.1)'
                      },
                      '&.Mui-disabled': {
                        color: 'rgba(255, 255, 255, 0.3)',
                        borderColor: 'rgba(255, 255, 255, 0.3)'
                      }
                    }}
                  >
                    Filters
                  </Button>
                </Stack>
              </Stack>

              {calendars.length > 0 && (
                <Box
                  sx={{
                    flex: 1,
                    minHeight: 0,
                    overflowY: 'auto',
                    overflowX: 'hidden',
                    p: 2,
                    borderRadius: 2,
                    scrollbarColor: `${theme.palette.primary.main} transparent`,
                    '&::-webkit-scrollbar': {
                      width: '8px'
                    },
                    '&::-webkit-scrollbar-track': {
                      background: 'transparent'
                    },
                    '&::-webkit-scrollbar-thumb': {
                      background: theme.palette.primary.main,
                      borderRadius: '4px'
                    }
                  }}
                >
                  <FormGroup>
                    {calendars.map((cal) => {
                      const { calendarId, color } = cal;
                      const checked = selectedCalendarIds.includes(calendarId);
                      return (
                        <FormControlLabel
                          key={calendarId}
                          sx={{
                            ml: -1,
                            mb: 1.5
                          }}
                          control={
                            <Checkbox
                              checked={checked}
                              onChange={() => toggleCalendar(calendarId)}
                              icon={<RadioButtonUncheckedIcon />}
                              checkedIcon={<CheckCircleOutlineIcon />}
                              sx={{
                                p: 0.5,
                                color,
                                '&.Mui-checked': { color }
                              }}
                            />
                          }
                          label={
                            <Typography
                              variant="body2"
                              sx={{
                                fontFamily: (t) => t.typography.h6.fontFamily,
                                fontSize: 16,
                                color,
                                fontWeight: 500
                              }}
                            >
                              {cal.name}
                            </Typography>
                          }
                        />
                      );
                    })}
                  </FormGroup>
                </Box>
              )}
            </Box>
          </Box>
        </Box>

        <FilterModal
          open={openFilterModal}
          onClose={() => setOpenFilterModal(false)}
          filterValues={{ memberIds, teamIds, showInvited: showInvitedEvents, showTeam: showTeamEvents, allEventsMode }}
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
