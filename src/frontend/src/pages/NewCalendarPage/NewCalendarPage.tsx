/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */
import { useEffect, useState } from 'react';
import { ArrowDropDown } from '@mui/icons-material';

import { Box, Grid, Stack, Typography, useMediaQuery, useTheme, Button } from '@mui/material';
import PageLayout from '../../components/PageLayout';
import { DayOfWeek, Event } from 'shared';
import MonthSelector from '../CalendarPage/CalendarComponents/MonthSelector';
import CalendarDayCard from '../CalendarPage/CalendarComponents/CalendarDayCard';
import { DAY_NAMES, enumToArray, calendarPaddingDays, daysInMonth } from '../../utils/design-review.utils';
import { useAllCalendars, useAllEvents, useAllEventTypes, useFilterEvents } from '../../hooks/calendar.hooks';
import ErrorPage from '../ErrorPage';
import { datePipe } from '../../utils/pipes';
import LoadingIndicator from '../../components/LoadingIndicator';
import EventSummaryModal from '../CalendarPage/EventSummaryModal';
import { useAllTeamTypes } from '../../hooks/team-types.hooks';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { NERButton } from '../../components/NERButton';
import FilterModal from './FilterModal';
import { DateCalendar } from '@mui/x-date-pickers';
import { useCurrentUser, useGetCurrentUser } from '../../hooks/users.hooks';
import { useAllArchivedTeams, useAllTeams, useGetUsersTeams } from '../../hooks/teams.hooks';

const NewCalendarPage = () => {
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
  const {
    isLoading,
    isError,
    error,
    data: allEvents
  } = useFilterEvents({ startPeriod: new Date(0), endPeriod: new Date(2099, 11, 31), memberIds, teamIds });
  const { data: allEventTypes } = useAllEventTypes();
  const { data: allCalendars } = useAllCalendars();
  const { data: allTeams } = useGetUsersTeams();
  const user = useCurrentUser();
  const [selectedEvent, setSelectedEvent] = useState<Event>();
  const isLargerView = useMediaQuery(theme.breakpoints.up('md'));
  const isExtraSmallView = useMediaQuery(theme.breakpoints.down('sm'));
  const [openFilterModal, setOpenFilterModal] = useState(false);

  useEffect(() => {
    if (showInvitedEvents) {
      if (!memberIds.includes(user.userId)) {
        setMemberIds([...memberIds, user.userId]);
      }
    } else if (memberIds.includes(user.userId)) {
      setMemberIds(memberIds.filter((id) => id !== user.userId));
    }
  }, [memberIds, showInvitedEvents, user.userId]);

  useEffect(() => {
    const teamList = allTeams?.map((team) => team.teamId) ?? [];

    if (showTeamEvents) {
      teamList.forEach((teamId) => {
        if (!teamIds.includes(teamId)) {
          setTeamIds([...teamIds, teamId]);
        }
      });
    } else {
      teamList.forEach((teamId) => {
        if (teamIds.includes(teamId)) {
          setTeamIds(teamIds.filter((id) => id !== teamId));
        }
      });
    }
  }, [allTeams, memberIds, showTeamEvents, teamIds, user.userId]);

  if (isLoading || !allEvents) return <LoadingIndicator />;

  if (isLoading || !allEvents) return <LoadingIndicator />;
  if (isError) return <ErrorPage message={error.message} />;

  // Sort events by their first occurrence's start time
  const sortedEvents = [...allEvents].sort((event1, event2) => {
    const time1 = event1.scheduledTimes[0]?.startTime ? new Date(event1.scheduledTimes[0].startTime).getTime() : 0;
    const time2 = event2.scheduledTimes[0]?.startTime ? new Date(event2.scheduledTimes[0].startTime).getTime() : 0;
    return time1 - time2;
  });

  const convertDayToInt = (day: DayOfWeek) => {
    if (day === DayOfWeek.MONDAY) {
      return 1;
    } else if (day === DayOfWeek.TUESDAY) {
      return 2;
    } else if (day === DayOfWeek.WEDNESDAY) {
      return 3;
    } else if (day === DayOfWeek.THURSDAY) {
      return 4;
    } else if (day === DayOfWeek.FRIDAY) {
      return 5;
    } else if (day === DayOfWeek.SATURDAY) {
      return 6;
    } else if (day === DayOfWeek.SUNDAY) {
      return 0;
    }

    return -1;
  };

  const eventDict = new Map<string, Event[]>();
  const dayDict = new Map<string, DayOfWeek>();

  sortedEvents.forEach((event) => {
    event.scheduledTimes.forEach((slot) => {
      if (!slot.initialDateScheduled) return;

      // startTime is already a full timestamp, just use it directly
      const startTimeDate = new Date(slot.initialDateScheduled);

      const convertedStartTime = new Date(startTimeDate.getTime() - startTimeDate.getTimezoneOffset() * -60000);

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
    .map(
      (day) =>
        daysInMonth(new Date(displayMonthYear.getFullYear(), displayMonthYear.getMonth() - 1, displayMonthYear.getDate())) -
        day
    )
    .reverse();
  const paddingArrayEnd = [
    ...Array<number>(7 - ((daysInMonth(displayMonthYear) + calendarPaddingDays(displayMonthYear)) % 7)).keys()
  ].map((day) => day + 1);
  const daysThisMonth = paddingArrayStart
    .concat([...Array(daysInMonth(displayMonthYear)).keys()].map((day) => day + 1))
    .concat(paddingArrayEnd.length < 7 ? paddingArrayEnd : []);

  if (!allTeamTypes || allTeamTypesLoading) return <LoadingIndicator />;
  if (allTeamTypesIsError) return <ErrorPage error={allTeamTypesError} message={allTeamTypesError?.message} />;

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
            <NERButton variant="contained" id="filter-events-button" onClick={() => setOpenFilterModal(true)}>
              More Filters
            </NERButton>
            <NERButton variant="contained" id="filter-events-button" onClick={() => {}}>
              Show Invited Events: {String(showInvitedEvents)}
            </NERButton>
            <NERButton variant="contained" id="filter-events-button" onClick={() => {}}>
              Show Team Events: {String(showTeamEvents)}
            </NERButton>
            <NERButton variant="contained" id="filter-events-button" onClick={() => {}}>
              Track Members: {memberIds}
            </NERButton>
            <NERButton variant="contained" id="filter-events-button" onClick={() => {}}>
              Track Teams: {teamIds}
            </NERButton>
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
                                  datePipe(new Date(cardDate.getTime() - cardDate.getTimezoneOffset() * -60000))
                                ) ?? []
                              }
                              teamTypes={allTeamTypes}
                              eventTypes={allEventTypes ?? []}
                              calendars={allCalendars ?? []}
                              dayOfWeek={
                                dayDict.get(
                                  datePipe(new Date(cardDate.getTime() - cardDate.getTimezoneOffset() * -60000))
                                ) ?? DayOfWeek.SUNDAY
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
          </Box>
        </Box>
        <FilterModal
          open={openFilterModal}
          onClose={() => setOpenFilterModal(false)}
          filterValues={{ memberIds, teamIds, showInvited: showInvitedEvents, showTeam: showTeamEvents }}
          setMemberIds={setMemberIds}
          setTeamIds={setTeamIds}
          setShowInvited={setShowInvitedEvents}
          setShowTeam={setShowTeamEvents}
        />
      </PageLayout>
    </>
  );
};

export default NewCalendarPage;
