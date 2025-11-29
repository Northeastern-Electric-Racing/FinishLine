/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */
import { useState } from 'react';
import { Box, Grid, Stack, Tooltip, Typography, useMediaQuery, useTheme } from '@mui/material';
import PageLayout from '../../components/PageLayout';
import { Event, EventStatus } from 'shared';
import MonthSelector from '../CalendarPage/CalendarComponents/MonthSelector';
import CalendarDayCard, { getTeamTypeIcon } from '../CalendarPage/CalendarComponents/CalendarDayCard';
import { DAY_NAMES, enumToArray } from '../../utils/design-review.utils';
import ActionsMenu from '../../components/ActionsMenu';
import { useAllEvents } from '../../hooks/calendar.hooks';
import ErrorPage from '../ErrorPage';
import { useCurrentUser } from '../../hooks/users.hooks';
import { datePipe } from '../../utils/pipes';
import LoadingIndicator from '../../components/LoadingIndicator';
import DRCSummaryModal from './EventSummaryModal';
import { useAllTeamTypes } from '../../hooks/team-types.hooks';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

const CalendarPage = () => {
  const theme = useTheme();
  const {
    data: allTeamTypes,
    isLoading: allTeamTypesLoading,
    isError: allTeamTypesIsError,
    error: allTeamTypesError
  } = useAllTeamTypes();

  const [displayMonthYear, setDisplayMonthYear] = useState<Date>(new Date());
  const { isLoading, isError, error, data: allEvents } = useAllEvents();
  const user = useCurrentUser();
  const [selectedEvent, setSelectedEvent] = useState<Event>();
  const isLargerView = useMediaQuery(theme.breakpoints.up('md'));
  const isExtraSmallView = useMediaQuery(theme.breakpoints.down('sm'));
  if (isLoading || !allEvents) return <LoadingIndicator />;
  if (isError) return <ErrorPage message={error.message} />;

  // Sort events by date and time
  const sortedEvents = [...allEvents].sort((event1, event2) => {
    const date1 = event1.scheduledTimes[0]?.initialDateScheduled
      ? new Date(event1.scheduledTimes[0].initialDateScheduled).getTime()
      : 0;
    const date2 = event2.scheduledTimes[0]?.initialDateScheduled
      ? new Date(event2.scheduledTimes[0].initialDateScheduled).getTime()
      : 0;

    if (date1 === date2) {
      const time1 = event1.scheduledTimes[0]?.startTime ? new Date(event1.scheduledTimes[0].startTime).getTime() : 0;
      const time2 = event2.scheduledTimes[0]?.startTime ? new Date(event2.scheduledTimes[0].startTime).getTime() : 0;
      return time1 - time2;
    }
    return date1 - date2;
  });

  const eventDict = new Map<string, Event[]>();
  sortedEvents.forEach((event) => {
    const firstScheduledDate = event.scheduledTimes[0]?.initialDateScheduled;
    if (!firstScheduledDate) return;

    // Convert string to Date
    const dateObj = new Date(firstScheduledDate);
    const date = datePipe(new Date(dateObj.getTime() - dateObj.getTimezoneOffset() * -60000));
    if (eventDict.has(date)) {
      eventDict.get(date)?.push(event);
    } else {
      eventDict.set(date, [event]);
    }
  });

  const currentUserEvents = allEvents.filter(
    (event) => event.userCreated.userId === user.userId && event.status !== EventStatus.DONE
  );

  // Generate calendar dates
  const firstDayOfMonth = new Date(displayMonthYear.getFullYear(), displayMonthYear.getMonth(), 1);
  const lastDayOfMonth = new Date(displayMonthYear.getFullYear(), displayMonthYear.getMonth() + 1, 0);

  const paddingStart = firstDayOfMonth.getDay(); // 0-6 (Sun-Sat)
  const totalDays = lastDayOfMonth.getDate();
  const totalCells = Math.ceil((paddingStart + totalDays) / 7) * 7;

  const calendarDates: Date[] = [];

  // Add padding days from previous month
  const prevMonthLastDay = new Date(displayMonthYear.getFullYear(), displayMonthYear.getMonth(), 0);
  const prevMonthDays = prevMonthLastDay.getDate();
  for (let i = paddingStart - 1; i >= 0; i--) {
    calendarDates.push(new Date(displayMonthYear.getFullYear(), displayMonthYear.getMonth() - 1, prevMonthDays - i));
  }

  // Add current month days
  for (let day = 1; day <= totalDays; day++) {
    calendarDates.push(new Date(displayMonthYear.getFullYear(), displayMonthYear.getMonth(), day));
  }

  // Add padding days from next month
  const remainingCells = totalCells - calendarDates.length;
  for (let day = 1; day <= remainingCells; day++) {
    calendarDates.push(new Date(displayMonthYear.getFullYear(), displayMonthYear.getMonth() + 1, day));
  }

  const eventButtons = (events: Event[]) => {
    return events.map((event) => {
      // Get team type name directly from event
      const teamTypeName = event.teamType?.name || 'Default';

      // Get title from work packages or event title
      const title =
        event.workPackages.length > 0 ? event.workPackages.map((wp) => wp.wbsElement.name).join(', ') : event.title;

      return {
        icon: getTeamTypeIcon(teamTypeName),
        title,
        onClick: () => {
          setSelectedEvent(event);
        },
        disabled: false
      };
    });
  };

  const NoEventsButton = () => {
    return [
      {
        title: 'No Events',
        disabled: true,
        onClick: () => {}
      }
    ];
  };

  const unconfirmedEventsDropdown = (
    <ActionsMenu
      title="My Events"
      buttons={currentUserEvents.length === 0 ? NoEventsButton() : eventButtons(currentUserEvents)}
    >
      My Unconfirmed DRs
    </ActionsMenu>
  );

  if (!allTeamTypes || allTeamTypesLoading) return <LoadingIndicator />;
  if (allTeamTypesIsError) return <ErrorPage error={allTeamTypesError} message={allTeamTypesError?.message} />;

  return (
    <>
      {selectedEvent && (
        <DRCSummaryModal
          open={!!selectedEvent}
          onHide={() => {
            setSelectedEvent(undefined);
          }}
          event={selectedEvent}
          teamTypes={allTeamTypes}
        />
      )}
      <PageLayout hidePageTitle>
        <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between" sx={{ mt: 2, mb: 2 }}>
          <Typography variant="h4">Calendar</Typography>
          <Stack direction="row" spacing={1} alignItems="center">
            <Tooltip title="Click on a day to schedule an event">
              <HelpOutlineIcon fontSize="medium" sx={{ position: 'relative' }} />
            </Tooltip>
            <Box marginLeft={1}>{unconfirmedEventsDropdown}</Box>
          </Stack>
        </Stack>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Grid container>
              {enumToArray(DAY_NAMES).map((day, index) => (
                <Grid item xs={12 / 7} key={index}>
                  <Typography align={'center'} sx={{ fontWeight: 'bold', fontSize: 18 }}>
                    {isLargerView ? day : isExtraSmallView ? day.charAt(0) : day.substring(0, 3)}
                  </Typography>
                </Grid>
              ))}
            </Grid>
            <Box sx={{ border: '2px solid grey', borderRadius: 2, bgcolor: theme.palette.background.paper }}>
              <Grid container marginBottom={2}>
                {Array.from({ length: Math.ceil(calendarDates.length / 7) }, (_, weekIndex) => (
                  <Grid container key={weekIndex}>
                    {calendarDates.slice(weekIndex * 7, weekIndex * 7 + 7).map((cardDate, dayIndex) => (
                      <Grid item xs={12 / 7} key={dayIndex}>
                        <Box marginTop={2} sx={{ justifyContent: 'center', display: 'flex' }}>
                          <CalendarDayCard
                            cardDate={cardDate}
                            events={
                              eventDict.get(
                                datePipe(new Date(cardDate.getTime() - cardDate.getTimezoneOffset() * -60000))
                              ) ?? []
                            }
                            teamTypes={allTeamTypes}
                          />
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                ))}
              </Grid>
            </Box>
          </Box>
          <Box sx={{ width: 320 }}>
            <MonthSelector displayMonth={displayMonthYear} setDisplayMonth={setDisplayMonthYear} />
          </Box>
        </Box>
      </PageLayout>
    </>
  );
};

export default CalendarPage;
