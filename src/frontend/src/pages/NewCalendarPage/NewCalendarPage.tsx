/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */
import { useState } from 'react';
import { Box, Grid, Stack, Typography, useMediaQuery, useTheme, Button, IconButton } from '@mui/material';
import PageLayout from '../../components/PageLayout';
import { Event } from 'shared';
import MonthSelector from '../CalendarPage/CalendarComponents/MonthSelector';
import CalendarDayCard from '../CalendarPage/CalendarComponents/CalendarDayCard';
import { DAY_NAMES, enumToArray, calendarPaddingDays, daysInMonth } from '../../utils/design-review.utils';
import { useAllEvents } from '../../hooks/calendar.hooks';
import ErrorPage from '../ErrorPage';
import DeleteIcon from '@mui/icons-material/Delete';
import { datePipe } from '../../utils/pipes';
import { useToast } from '../../hooks/toasts.hooks';
import LoadingIndicator from '../../components/LoadingIndicator';
import EventSummaryModal from '../CalendarPage/EventSummaryModal';
import { useAllTeamTypes } from '../../hooks/team-types.hooks';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import NERModal from '../../components/NERModal';

const NewCalendarPage = () => {
  const theme = useTheme();
  const {
    data: allTeamTypes,
    isLoading: allTeamTypesLoading,
    isError: allTeamTypesIsError,
    error: allTeamTypesError
  } = useAllTeamTypes();

  const DeleteModal = () => {
    return (
      <NERModal
        open={showDeleteModal}
        onHide={() => setDeleteModal(false)}
        title="Warning!"
        cancelText="No"
        submitText="Yes"
        onSubmit={() => handleDelete}
      >
        <Typography>Are you sure you want to delete this event?</Typography>
      </NERModal>
    );
  };

  const handleDelete = () => {
    try {
      // deleteEvent();
      // history.push(routes.CALENDAR);
    } catch (e: unknown) {
      if (e instanceof Error) {
        toast.error(e.message, 3000);
      }
    }
    setDeleteModal(false);
  };

  const [displayMonthYear, setDisplayMonthYear] = useState<Date>(new Date());
  const { isLoading, isError, error, data: allEvents } = useAllEvents();
  const [selectedEvent, setSelectedEvent] = useState<Event>();
  const isLargerView = useMediaQuery(theme.breakpoints.up('md'));
  const [showDeleteModal, setDeleteModal] = useState(false);
  const toast = useToast();
  const isExtraSmallView = useMediaQuery(theme.breakpoints.down('sm'));

  if (isLoading || !allEvents) return <LoadingIndicator />;
  if (isError) return <ErrorPage message={error.message} />;

  // Sort events by their first occurrence's start time
  const sortedEvents = [...allEvents].sort((event1, event2) => {
    const time1 = event1.scheduledTimes[0]?.startTime ? new Date(event1.scheduledTimes[0].startTime).getTime() : 0;
    const time2 = event2.scheduledTimes[0]?.startTime ? new Date(event2.scheduledTimes[0].startTime).getTime() : 0;
    return time1 - time2;
  });

  const eventDict = new Map<string, Event[]>();

  sortedEvents.forEach((event) => {
    event.scheduledTimes.forEach((slot) => {
      if (!slot.startTime) return;

      // startTime is already a full timestamp, just use it directly
      const startTimeDate = new Date(slot.startTime);
      const date = datePipe(new Date(startTimeDate.getTime() - startTimeDate.getTimezoneOffset() * -60000));

      if (eventDict.has(date)) {
        // Check if this event is already in this date's array to avoid duplicates
        const existingEvents = eventDict.get(date)!;
        if (!existingEvents.find((e) => e.eventId === event.eventId)) {
          existingEvents.push(event);
        }
      } else {
        eventDict.set(date, [event]);
      }
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
        <DeleteModal />
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
            <IconButton onClick={() => setDeleteModal(true)}>
              <DeleteIcon />
            </IconButton>
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
            <Box sx={{ border: '2px solid grey', borderRadius: 2, bgcolor: theme.palette.background.paper }}>
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
            <MonthSelector displayMonth={displayMonthYear} setDisplayMonth={setDisplayMonthYear} />
          </Box>
        </Box>
      </PageLayout>
    </>
  );
};

export default NewCalendarPage;
