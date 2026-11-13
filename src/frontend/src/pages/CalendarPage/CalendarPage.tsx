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
import {
  Calendar,
  TaskBoardItem,
  ConflictStatus,
  DayOfWeek,
  EventType,
  FilterTaskArgs,
  CalendarEventInstance
} from 'shared';
import CalendarDayCard from './CalendarDayCard';
import { DAY_NAMES, enumToArray, calendarPaddingDays, daysInMonth } from '../../utils/design-review.utils';
import { useFilterEvents, useMyConflicts, useUpcomingEvents } from '../../hooks/calendar.hooks';
import ErrorPage from '../ErrorPage';
import { datePipe } from '../../utils/pipes';
import LoadingIndicator from '../../components/LoadingIndicator';
import { useAllTeamTypes } from '../../hooks/team-types.hooks';
import FilterModal from './FilterModal';
import IcsSubscribeModal from './IcsSubscribeModal';
import { DateCalendar } from '@mui/x-date-pickers';
import { useCurrentUser } from '../../hooks/users.hooks';
import { useGetUsersTeams } from '../../hooks/teams.hooks';
import {
  convertIntToDay,
  eventsToEventInstances,
  eventsToNextEventInstance,
  getSundayOfWeek
} from '../../utils/calendar.utils';
import WarningIcon from '@mui/icons-material/Warning';
import { useHistory } from 'react-router-dom';
import UpcomingMeetingsCard from './UpcomingMeetingsCard';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import CalendarWeekView from './CalendarWeekView';
import { useFilterTasks } from '../../hooks/tasks.hooks';

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
  showEvents: boolean;
  showTasks: boolean;
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
  allCalendars: Calendar[];
  onCreateEventClick: (date: Date, startTime?: Date, endTime?: Date) => void;
  viewMode: 'month' | 'week';
  displayMonthYear: Date;
  setDisplayMonthYear: (date: Date) => void;
  displayWeek: Date;
  setDisplayWeek: (date: Date) => void;
  selectedEventId?: string;
}

const NewCalendarPage: React.FC<NewCalendarPageProps> = ({
  allEventTypes,
  allCalendars,
  onCreateEventClick,
  viewMode,
  displayMonthYear,
  setDisplayMonthYear,
  displayWeek,
  setDisplayWeek,
  selectedEventId
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
  const [showInvitedEvents, setShowInvitedEvents] = useState<boolean>(savedFilters.showInvitedEvents ?? true);
  const [showTeamEvents, setShowTeamEvents] = useState<boolean>(savedFilters.showTeamEvents ?? true);
  const [openFilterModal, setOpenFilterModal] = useState(false);
  const [openSubscribeModal, setOpenSubscribeModal] = useState(false);
  const [additionalMemberIds, setAdditionalMemberIds] = useState<string[]>([user.userId]);
  const [additionalTeamIds, setAdditionalTeamIds] = useState<string[]>([]);
  const [allEventsMode, setAllEventsMode] = useState<boolean>(savedFilters.allEventsMode ?? true);
  const [showEvents, setShowEvents] = useState<boolean>(savedFilters.showEvents ?? true);
  const [showTasks, setShowTasks] = useState<boolean>(savedFilters.showTasks ?? false);
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
      showEvents,
      selectedCalendarIds,
      showTasks
    });
  }, [allEventsMode, memberIds, teamIds, showInvitedEvents, showTeamEvents, showEvents, selectedCalendarIds, showTasks]);

  useEffect(() => {
    if (allTeams && additionalTeamIds.length === 0 && showTeamEvents && !allEventsMode) {
      setAdditionalTeamIds(teamList);
    }
  }, [allTeams, teamList, additionalTeamIds.length, showTeamEvents, allEventsMode]);

  const startPeriod =
    viewMode === 'week'
      ? new Date(displayWeek.getFullYear(), displayWeek.getMonth(), displayWeek.getDate())
      : new Date(displayMonthYear.getFullYear(), displayMonthYear.getMonth() - 1, 15);
  const endPeriod =
    viewMode === 'week'
      ? new Date(displayWeek.getFullYear(), displayWeek.getMonth(), displayWeek.getDate() + 7, 23, 59, 59)
      : new Date(displayMonthYear.getFullYear(), displayMonthYear.getMonth() + 1, 15);

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

  // Task filtering - uses same date range and member/team filters as events
  const taskFilterArgs: FilterTaskArgs | null = showTasks
    ? allEventsMode
      ? { startPeriod, endPeriod }
      : {
          startPeriod,
          endPeriod,
          memberIds: [...new Set(memberIds.concat(additionalMemberIds))],
          teamIds: [...new Set(teamIds.concat(additionalTeamIds))]
        }
    : null;

  const {
    isLoading: tasksIsLoading,
    isError: tasksIsError,
    error: tasksError,
    data: filteredTasks
  } = useFilterTasks(taskFilterArgs);

  // the user's own pending events in view, which the grid shows on top of the approved ones
  const {
    data: ownPendingEvents,
    isError: ownPendingIsError,
    error: ownPendingError
  } = useFilterEvents({
    startPeriod,
    endPeriod,
    memberIds: [user.userId],
    statuses: [ConflictStatus.PENDING]
  });

  // conflict banners load on their own and appear once ready; each can be dismissed
  const { data: myConflicts } = useMyConflicts();
  const [showPendingBanner, setShowPendingBanner] = useState(true);
  const [showDeniedBanner, setShowDeniedBanner] = useState(true);
  const [showReviewBanner, setShowReviewBanner] = useState(true);

  const pendingConflicts = (myConflicts ?? []).filter(
    (conflict) => !conflict.isCurrentUserApprover && conflict.event.approved === ConflictStatus.PENDING
  );
  const deniedConflicts = (myConflicts ?? []).filter(
    (conflict) => !conflict.isCurrentUserApprover && conflict.event.approved === ConflictStatus.DENIED
  );
  const reviewConflicts = (myConflicts ?? []).filter((conflict) => conflict.isCurrentUserApprover);

  // Upcoming meetings is independent of filters - shows events where user is creator, member, or on associated team
  const { data: upcomingEvents } = useUpcomingEvents(7, true);

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
  if (ownPendingIsError) return <ErrorPage message={ownPendingError.message} />;
  if (tasksIsError) return <ErrorPage message={tasksError.message} />;

  if (isLoading || !allEvents || !ownPendingEvents || tasksIsLoading || (showTasks && !filteredTasks))
    return <LoadingIndicator />;

  // the user's own pending events that aren't already in the grid's events
  const userPendingConflictEvents = ownPendingEvents.filter(
    (event) => event.userCreated.userId === user.userId && !allEvents.some((e) => e.eventId === event.eventId)
  );

  const eventDict = new Map<string, CalendarEventInstance[]>();
  const dayDict = new Map<string, DayOfWeek>();

  // Remove duplicates (same eventId + same scheduleSlotId)
  const seenKeys = new Set<string>();
  const eventInstances = eventsToEventInstances([...allEvents, ...userPendingConflictEvents])
    .filter((event) => {
      const key = `${event.eventId}-${event.scheduleSlotId}`;
      if (seenKeys.has(key)) return false;
      seenKeys.add(key);
      return true;
    })
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

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

  // Build task dict keyed by date string (using deadline)
  const taskDict = new Map<string, TaskBoardItem[]>();
  if (showTasks && filteredTasks) {
    filteredTasks.forEach((task) => {
      if (!task.deadline) return;
      const deadlineDate = new Date(task.deadline);
      const dateString = datePipe(deadlineDate);
      if (taskDict.has(dateString)) {
        taskDict.get(dateString)!.push(task);
      } else {
        taskDict.set(dateString, [task]);
      }
    });
  }

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
        {showDeniedBanner && deniedConflicts.length > 0 && (
          <Alert
            icon={<WarningIcon fontSize="inherit" sx={{ marginTop: 1 }} />}
            variant="filled"
            severity="error"
            onClick={() => setShowDeniedBanner(false)}
            onClose={() => setShowDeniedBanner(false)}
            sx={{
              cursor: 'pointer'
            }}
          >
            <Stack direction="row" alignItems="center" spacing={2}>
              <Typography fontSize={14}>
                {' '}
                You have scheduled an event at the same time and location as{' '}
                <i>{deniedConflicts[0].conflictingEvent.title}</i> and was denied. Edit the event to put it up for
                re-approval, or change the time/location to not conflict with other events.
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
        {showPendingBanner && pendingConflicts.length > 0 && (
          <Alert
            icon={<WarningIcon fontSize="inherit" />}
            variant="filled"
            severity="error"
            onClick={() => setShowPendingBanner(false)}
            onClose={() => setShowPendingBanner(false)}
            sx={{
              cursor: 'pointer'
            }}
          >
            You have scheduled an event at the same time and location as <i>{pendingConflicts[0].conflictingEvent.title}</i>.{' '}
            <i>
              {pendingConflicts[0].conflictingEvent.userCreated.firstName}{' '}
              {pendingConflicts[0].conflictingEvent.userCreated.lastName}
            </i>{' '}
            has been notified of this and must allow your event to take place in order to continue.
          </Alert>
        )}
        {showReviewBanner && reviewConflicts.length > 0 && (
          <Alert
            icon={<WarningIcon fontSize="inherit" sx={{ marginTop: 1 }} />}
            variant="filled"
            severity="error"
            onClick={() => setShowReviewBanner(false)}
            onClose={() => setShowReviewBanner(false)}
            sx={{
              cursor: 'pointer'
            }}
          >
            <Stack direction="row" alignItems="center" spacing={2}>
              <Typography fontSize={14}>
                {' '}
                <i>
                  {reviewConflicts[0].event.userCreated.firstName} {reviewConflicts[0].event.userCreated.lastName}
                </i>{' '}
                has scheduled an event at the same time and location as your meeting at{' '}
                {reviewConflicts[0].overlapStart.toLocaleTimeString('en-US', {
                  hour: 'numeric',
                  minute: '2-digit'
                })}{' '}
                in {reviewConflicts[0].conflictingEvent.location}.
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
      <PageLayout title="Calendar" hidePageTitle>
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
            {viewMode === 'week' ? (
              <CalendarWeekView
                allEventTypes={allEventTypes ?? []}
                allCalendars={allCalendars ?? []}
                eventInstances={showEvents ? eventInstances : []}
                displayWeek={displayWeek}
                onNavigateWeek={(offset) => {
                  const newWeek = new Date(displayWeek);
                  newWeek.setDate(newWeek.getDate() + offset * 7);
                  setDisplayWeek(newWeek);
                }}
                onCreateEventClick={onCreateEventClick}
                tasks={showTasks && filteredTasks ? filteredTasks : []}
                selectedEventId={selectedEventId}
              />
            ) : (
              <>
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
                                events={showEvents ? (eventDict.get(datePipe(cardDate)) ?? []) : []}
                                eventTypes={allEventTypes ?? []}
                                calendars={allCalendars ?? []}
                                dayOfWeek={dayDict.get(datePipe(cardDate)) ?? DayOfWeek.SUNDAY}
                                onCreateEventClick={onCreateEventClick}
                                tasks={taskDict.get(datePipe(cardDate)) ?? []}
                                selectedEventId={selectedEventId}
                              />
                            </Box>
                          );
                        })}
                      </Box>
                    ))}
                </Box>
              </>
            )}
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
                value={viewMode === 'week' ? displayWeek : displayMonthYear}
                onMonthChange={(newDate) => {
                  if (viewMode !== 'week') setDisplayMonthYear(newDate);
                }}
                onChange={(newDate) => {
                  if (!newDate) return;
                  if (viewMode === 'week') {
                    setDisplayWeek(getSundayOfWeek(newDate));
                  } else {
                    setDisplayMonthYear(newDate);
                  }
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
              <Stack direction="row" sx={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
                {/* Left column: heading + scrollable calendar list */}
                <Box sx={{ flex: 2, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
                  <Typography
                    variant="h6"
                    sx={{
                      fontFamily: (t) => t.typography.h4.fontFamily,
                      fontWeight: 400,
                      fontSize: 22,
                      flexShrink: 0,
                      mb: 1
                    }}
                  >
                    Calendars:
                  </Typography>
                  {calendars.length > 0 && (
                    <Box
                      sx={{
                        flex: 1,
                        minHeight: 0,
                        overflowY: 'auto',
                        overflowX: 'hidden',
                        p: 2,
                        pt: 0,
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

                {/* Right column: filters + toggles */}
                <Stack sx={{ flex: 1, alignItems: 'flex-end', pt: 0.5, overflowY: 'auto' }} spacing={0.5}>
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
                  <FormControlLabel
                    control={
                      <Switch size="small" checked={allEventsMode} onChange={(e) => setAllEventsMode(e.target.checked)} />
                    }
                    label={<Typography sx={{ fontSize: 12, color: 'white', whiteSpace: 'nowrap' }}>Show All</Typography>}
                    sx={{ mr: 0 }}
                  />
                  <FormControlLabel
                    control={<Switch size="small" checked={showEvents} onChange={(e) => setShowEvents(e.target.checked)} />}
                    label={<Typography sx={{ fontSize: 12, color: 'white', whiteSpace: 'nowrap' }}>Events</Typography>}
                    sx={{ mr: 0 }}
                  />
                  <FormControlLabel
                    control={<Switch size="small" checked={showTasks} onChange={(e) => setShowTasks(e.target.checked)} />}
                    label={<Typography sx={{ fontSize: 12, color: 'white', whiteSpace: 'nowrap' }}>Tasks</Typography>}
                    sx={{ mr: 0 }}
                  />
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={() => setOpenSubscribeModal(true)}
                    sx={{
                      px: 1,
                      py: 0,
                      color: 'white',
                      borderColor: 'white',
                      backgroundColor: 'transparent',
                      textTransform: 'none',
                      fontSize: 12,
                      fontFamily: (t) => t.typography.h4.fontFamily,
                      '&:hover': {
                        borderColor: 'white',
                        backgroundColor: 'rgba(255, 255, 255, 0.1)'
                      }
                    }}
                  >
                    Connect With Your Calendar
                  </Button>
                </Stack>
              </Stack>
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
        <IcsSubscribeModal open={openSubscribeModal} onClose={() => setOpenSubscribeModal(false)} />
      </PageLayout>
    </>
  );
};

export default NewCalendarPage;
