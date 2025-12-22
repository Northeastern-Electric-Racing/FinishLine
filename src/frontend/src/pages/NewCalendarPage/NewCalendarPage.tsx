/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */
import { useEffect, useRef, useState, useMemo } from 'react';
import {
  Box,
  Grid,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
  Button,
  Checkbox,
  FormControlLabel,
  FormGroup
} from '@mui/material';
import PageLayout from '../../components/PageLayout';
import { DayOfWeek, Event } from 'shared';
import CalendarDayCard from './CalendarDayCard';
import { DAY_NAMES, enumToArray, calendarPaddingDays, daysInMonth } from '../../utils/design-review.utils';
import {
  useAllCalendars,
  useFilterEvents,
  useAllEventTypes,
  useCreateEvent,
  useUploadManyDocuments
} from '../../hooks/calendar.hooks';
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
import { convertDayToInt, getEventsFlattened } from '../../utils/calendar.utils';
import CreateEventModal from './Components/CreateEventModal';
import { EventRoutePayload } from './Components/EventModal';
import { useToast } from '../../hooks/toasts.hooks';
import SchedulingConflictsWarning from './SchedulingConflictsWarning';
import UpcomingMeetingsCard from './UpcomingMeetingsCard';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';

const NewCalendarPage = () => {
  const toast = useToast();
  const theme = useTheme();
  const user = useCurrentUser();

  const [memberIds, setMemberIds] = useState<string[]>([]);
  const [teamIds, setTeamIds] = useState<string[]>([]);
  const [displayMonthYear, setDisplayMonthYear] = useState<Date>(new Date());
  const [showInvitedEvents, setShowInvitedEvents] = useState<boolean>(true);
  const [showTeamEvents, setShowTeamEvents] = useState<boolean>(true);
  const [selectedEvent, setSelectedEvent] = useState<Event>();
  const [openFilterModal, setOpenFilterModal] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [additionalMemberIds, setAdditionalMemberIds] = useState<string[]>([user.userId]);
  const [additionalTeamIds, setAdditionalTeamIds] = useState<string[]>([]);
  const isLargerView = useMediaQuery(theme.breakpoints.up('md'));
  const isExtraSmallView = useMediaQuery(theme.breakpoints.down('sm'));

  const {
    data: allTeamTypes,
    isLoading: allTeamTypesLoading,
    isError: allTeamTypesIsError,
    error: allTeamTypesError
  } = useAllTeamTypes();

  const {
    data: allEventTypes,
    isLoading: allEventTypesLoading,
    isError: allEventTypesIsError,
    error: allEventTypesError
  } = useAllEventTypes();

  const {
    data: allCalendars,
    isLoading: allCalendarsLoading,
    isError: allCalendarsIsError,
    error: allCalendarsError
  } = useAllCalendars();

  const calendars = allCalendars ?? [];

  const [selectedCalendarIds, setSelectedCalendarIds] = useState<string[]>([]);

  const { mutateAsync: createEvent } = useCreateEvent();
  const { isLoading: documentsIsLoading, mutateAsync: uploadDocuments } = useUploadManyDocuments();

  const { data: allTeams, isLoading: allTeamsLoading, isError: allTeamsIsError, error: allTeamsError } = useGetUsersTeams();

  const teamList = useMemo(() => allTeams?.map((team) => team.teamId) ?? [], [allTeams]);

  // Date range for filtering events (current month ±1 month)
  const startPeriod = new Date(displayMonthYear.getFullYear(), displayMonthYear.getMonth() - 1, 15);
  const endPeriod = new Date(displayMonthYear.getFullYear(), displayMonthYear.getMonth() + 1, 15);

  const {
    isLoading,
    isError,
    error,
    data: allEvents
  } = useFilterEvents({
    startPeriod,
    endPeriod,
    memberIds: memberIds.concat(additionalMemberIds),
    teamIds: teamIds.concat(additionalTeamIds),
    calendarIds: selectedCalendarIds
  });

  useEffect(() => {
    if (allTeams && additionalTeamIds.length === 0 && showTeamEvents) {
      setAdditionalTeamIds(teamList);
    }
  }, [allTeams, teamList, additionalTeamIds.length, showTeamEvents]);

  // Date range for upcoming meetings (next 7 days)
  const [upcomingStartPeriod] = useState(() => new Date());

  const [upcomingEndPeriod] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    d.setHours(23, 59, 59, 999);
    return d;
  });

  const { data: upcomingEvents } = useFilterEvents({
    startPeriod: upcomingStartPeriod,
    endPeriod: upcomingEndPeriod,
    memberIds: memberIds.concat(additionalMemberIds),
    teamIds: teamIds.concat(additionalTeamIds)
  });

  const upcomingOccurences = upcomingEvents
    ? getEventsFlattened(upcomingEvents, upcomingStartPeriod, upcomingEndPeriod)
    : [];

  const didInitCalendarFilters = useRef(false);

  useEffect(() => {
    if (didInitCalendarFilters.current) return;
    if (!allCalendars?.length) return;

    setSelectedCalendarIds(allCalendars.map((c) => c.calendarId));
    didInitCalendarFilters.current = true;
  }, [allCalendars]);

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

  if (isLoading || !allEvents) return <LoadingIndicator />;
  if (isError) return <ErrorPage message={error.message} />;
  if (allEventTypesLoading || !allEventTypes) return <LoadingIndicator />;
  if (allEventTypesIsError) return <ErrorPage message={allEventTypesError?.message} />;
  if (documentsIsLoading) return <LoadingIndicator />;
  if (!allTeamTypes || allTeamTypesLoading) return <LoadingIndicator />;
  if (allTeamTypesIsError) return <ErrorPage error={allTeamTypesError} message={allTeamTypesError?.message} />;
  if (!allCalendars || allCalendarsLoading) return <LoadingIndicator />;
  if (allCalendarsIsError) return <ErrorPage error={allCalendarsError} message={allCalendarsError?.message} />;
  if (!allTeams || allTeamsLoading) return <LoadingIndicator />;
  if (allTeamsIsError) return <ErrorPage error={allTeamsError} message={allTeamsError?.message} />;

  // Sort events by their first occurrence's start time
  const sortedEvents = [...allEvents].sort((event1, event2) => {
    const time1 = event1.scheduledTimes[0]?.startTime ? new Date(event1.scheduledTimes[0].startTime).getTime() : 0;
    const time2 = event2.scheduledTimes[0]?.startTime ? new Date(event2.scheduledTimes[0].startTime).getTime() : 0;
    return time1 - time2;
  });

  const eventDict = new Map<string, Event[]>();
  const dayDict = new Map<string, DayOfWeek>();

  sortedEvents.forEach((event) => {
    event.scheduledTimes.forEach((slot) => {
      if (!slot.initialDateScheduled) return;

      // startTime is already a full timestamp, just use it directly
      const startTimeDate = new Date(slot.initialDateScheduled);

      // Accessing the date actually converts it to local time, which causes the date to be off. This is a workaround.
      // 60000 is for millisecond conversion
      const convertedStartTime = new Date(startTimeDate.getTime() + startTimeDate.getTimezoneOffset() * 60000);

      const dayInt = convertedStartTime.getDay();

      slot.days.forEach((day) => {
        const eventDate = new Date(convertedStartTime);
        eventDate.setHours(0, 0, 0, 0);
        const offset = dayInt - convertDayToInt(day);

        eventDate.setDate(eventDate.getDate() - offset);
        const date = datePipe(new Date(eventDate.getTime()));

        dayDict.set(date, day);

        if (eventDict.has(date)) {
          // Check if this event is already in this date's array to avoid duplicates
          const existingEvents = eventDict.get(date)!;
          if (!existingEvents.find((e) => e.eventId === event.eventId)) {
            existingEvents.push(event);
          }
        } else {
          eventDict.set(date, [event]);
        }

        for (let i = 1; i <= slot.recurrenceNumber; i++) {
          const nextDate = new Date(eventDate);
          nextDate.setDate(nextDate.getDate() + 7 * i);

          const date = datePipe(new Date(nextDate.getTime()));
          dayDict.set(date, day);

          if (eventDict.has(date)) {
            const existingEvents = eventDict.get(date)!;
            if (!existingEvents.find((e) => e.eventId === event.eventId)) {
              existingEvents.push(event);
            }
          } else {
            eventDict.set(date, [event]);
          }
        }
      });
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

  const handleCreateEvent = async (data: EventRoutePayload) => {
    try {
      const { scheduleSlot, documentFiles, ...eventData } = data;

      if (!scheduleSlot || scheduleSlot.length === 0) {
        throw new Error('Missing scheduleSlot');
      }

      // Create the event first without documents
      const createArgs = {
        ...eventData,
        documentIds: [],
        scheduleSlot: scheduleSlot.map((slot) => ({
          days: slot.days,
          startTime: slot.startTime,
          endTime: slot.endTime,
          recurrenceNumber: slot.recurrenceNumber,
          initialDateScheduled: slot.initialDateScheduled,
          allDay: slot.allDay
        }))
      };

      const createdEvent = await createEvent(createArgs);

      const filesToUpload = documentFiles.map((doc) => doc.file).filter((file): file is File => file !== undefined);

      if (filesToUpload.length > 0) {
        await uploadDocuments({
          id: createdEvent.eventId,
          files: filesToUpload
        });
      }

      toast.success('Event created successfully!');
      setIsCreateModalOpen(false);
    } catch (err) {
      if (err instanceof Error) {
        toast.error(err.message);
      }
    }
  };

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
      {isCreateModalOpen && (
        <CreateEventModal
          open={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSubmit={handleCreateEvent}
          eventTypes={allEventTypes}
          defaultDate={displayMonthYear}
        />
      )}
      <PageLayout hidePageTitle>
        <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between" sx={{ mt: 2, mb: 2 }}>
          <Typography variant="h4"></Typography>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ flexWrap: 'wrap', columnGap: 1, rowGap: 1 }}>
            <Button
              variant="contained"
              disableElevation
              onClick={() => setIsCreateModalOpen(true)}
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
        <Box
          sx={{
            display: 'flex',
            gap: 2,
            height: '100vh'
          }}
        >
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
              width: 320,
              display: 'flex',
              flexDirection: 'column',
              gap: 2
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

            <Box
              sx={{
                width: 320,
                display: 'flex',
                flexDirection: 'column',
                gap: 2
              }}
            >
              {/* Calendar Selector */}
              <Box sx={{ p: 2, borderRadius: 2 }}>
                <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between" sx={{ mb: 1 }}>
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

                  <Button
                    size="small"
                    variant="outlined"
                    id="filter-events-button"
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
                      }
                    }}
                  >
                    More Filters
                  </Button>
                </Stack>

                {calendars.length > 0 && (
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
                )}
              </Box>
            </Box>

            <SchedulingConflictsWarning
              memberIds={memberIds.concat(additionalMemberIds)}
              teamIds={teamIds.concat(additionalTeamIds)}
              startPeriod={startPeriod}
              endPeriod={endPeriod}
            />

            <Typography align="left" sx={{ fontWeight: 'bold', fontSize: 22, mb: 0.5 }}>
              My Upcoming Meetings:
            </Typography>

            {upcomingOccurences && (
              <Box
                sx={{
                  mt: 2,
                  flex: 1,
                  flexDirection: 'column',
                  overflowX: 'hidden',
                  overflowY: 'auto',
                  scrollbarColor: `${theme.palette.primary.main} transparent`,
                  maxHeight: 'calc(50%)'
                }}
              >
                {upcomingOccurences?.map((event: Event) => (
                  <UpcomingMeetingsCard
                    key={event.eventId}
                    event={event}
                    calendars={allCalendars ?? []}
                    eventTypes={allEventTypes ?? []}
                  />
                ))}
              </Box>
            )}
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
