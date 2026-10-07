import { routes } from '../../utils/routes';
import NewCalendarPage from './CalendarPage';
import PageLayout from '../../components/PageLayout';
import { Box, ToggleButton, ToggleButtonGroup } from '@mui/material';
import FullPageTabs from '../../components/FullPageTabs';
import { useEffect, useState } from 'react';
import { useCurrentUser } from '../../hooks/users.hooks';
import { ConflictStatus, isGuest, isHead, isLead } from 'shared';
import { useAllCalendars, useAllEventTypes, useFilterEvents, useSingleEvent } from '../../hooks/calendar.hooks';
import LoadingIndicator from '../../components/LoadingIndicator';
import ErrorPage from '../ErrorPage';
import { filterEventTransformer } from '../../apis/transformers/calendar.transformer';
import EventsTable from './EventsTable';
import CreateEventModal from './Components/CreateEventModal';
import CalendarCreateTaskModal from './Components/CalendarCreateTaskModal';
import { useHistory, useLocation } from 'react-router-dom';
import { NERButton } from '../../components/NERButton';
import { Add } from '@mui/icons-material';
import { eventsToEventInstances, getSundayOfWeek } from '../../utils/calendar.utils';
import { useToast } from '../../hooks/toasts.hooks';

const CalendarTab: React.FC = () => {
  const [tabIndex, setTabIndex] = useState<number>(0);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createModalDate, setCreateModalDate] = useState<Date>(new Date());
  const [createModalStartTime, setCreateModalStartTime] = useState<Date | undefined>(undefined);
  const [createModalEndTime, setCreateModalEndTime] = useState<Date | undefined>(undefined);
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');
  const [displayMonthYear, setDisplayMonthYear] = useState<Date>(new Date());
  const [displayWeek, setDisplayWeek] = useState<Date>(() => getSundayOfWeek(new Date()));
  const [isCreateTaskModalOpen, setIsCreateTaskModalOpen] = useState(false);
  const [createTaskDefaultDeadline, setCreateTaskDefaultDeadline] = useState<Date | undefined>(undefined);
  const user = useCurrentUser();
  const history = useHistory();
  const location = useLocation();
  const toast = useToast();
  const canViewReviews = isHead(user.role) || isLead(user.role);

  const selectedEventId = new URLSearchParams(location.search).get('eventId') ?? undefined;
  const {
    data: selectedEvent,
    isLoading: selectedEventIsLoading,
    isError: selectedEventIsError,
    error: selectedEventError
  } = useSingleEvent(selectedEventId);

  useEffect(() => {
    if (selectedEventIsError) {
      toast.error(selectedEventError?.message ?? 'Failed to load the linked event');
      return;
    }
    if (selectedEventIsLoading || !selectedEvent) return;
    const eventDate = selectedEvent.initialDateScheduled ?? selectedEvent.scheduledTimes[0]?.startTime;
    if (!eventDate) return;
    const date = new Date(eventDate);
    setDisplayMonthYear(new Date(date.getFullYear(), date.getMonth(), 1));
    setDisplayWeek(getSundayOfWeek(date));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedEvent, selectedEventIsLoading, selectedEventIsError, selectedEventError]);

  const handleViewModeToggle = (_: React.MouseEvent, newMode: 'month' | 'week' | null) => {
    if (!newMode || newMode === viewMode) return;
    if (newMode === 'week') {
      setDisplayWeek(getSundayOfWeek(displayMonthYear));
    } else {
      // Show the month containing Thursday of the displayed week (majority month rule)
      const thursday = new Date(displayWeek);
      thursday.setDate(thursday.getDate() + 4);
      setDisplayMonthYear(new Date(thursday.getFullYear(), thursday.getMonth(), 1));
    }
    setViewMode(newMode);
  };

  const tabs = [
    { tabUrlValue: '', tabName: 'Calendar' },
    { tabUrlValue: 'yourEvents', tabName: 'Your Events' }
  ];

  const {
    data: untransformedYourEvents,
    isLoading: yourEventsLoading,
    isError: yourEventsIsError,
    error: yourEventsError
  } = useFilterEvents({
    memberIds: [user.userId],
    startPeriod: new Date(0),
    endPeriod: new Date(2099, 11, 31) // Adjust as needed
  });

  const {
    data: untransformedReviewEvents,
    isLoading: reviewEventsLoading,
    isError: reviewEventsIsError,
    error: reviewEventsError
  } = useFilterEvents({
    approvalIds: canViewReviews ? [] : [user.userId],
    statuses: canViewReviews ? [ConflictStatus.PENDING] : [],
    startPeriod: new Date(0),
    endPeriod: new Date(2099, 11, 31) // Adjust as needed
  });

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

  const yourEvents = untransformedYourEvents?.map(filterEventTransformer);
  const reviewEvents = untransformedReviewEvents?.map(filterEventTransformer);

  if (yourEventsIsError) return <ErrorPage error={yourEventsError} message={yourEventsError?.message} />;

  if (reviewEventsIsError) return <ErrorPage error={reviewEventsError} message={reviewEventsError?.message} />;

  if (allEventTypesIsError) return <ErrorPage error={allEventTypesError} message={allEventTypesError?.message} />;

  if (allCalendarsIsError) return <ErrorPage error={allCalendarsError} message={allCalendarsError?.message} />;

  if (
    !yourEvents ||
    yourEventsLoading ||
    !reviewEvents ||
    reviewEventsLoading ||
    !allEventTypes ||
    allEventTypesLoading ||
    !allCalendars ||
    allCalendarsLoading
  )
    return <LoadingIndicator />;

  if (canViewReviews) tabs.push({ tabUrlValue: 'reviews', tabName: 'Review Bookings' });

  const handleNewEventClick = (date?: Date, startTime?: Date, endTime?: Date) => {
    if (tabIndex !== 0) {
      history.push(routes.CALENDAR);
    }
    setCreateModalDate(date || new Date());
    setCreateModalStartTime(startTime);
    setCreateModalEndTime(endTime);
    setIsCreateModalOpen(true);
  };

  return (
    <>
      <PageLayout
        title="Calendar"
        tabs={
          <Box borderBottom={1} borderColor={'divider'} width={'100%'}>
            <FullPageTabs
              noUnderline
              setTab={setTabIndex}
              tabsLabels={tabs}
              baseUrl={routes.CALENDAR}
              defaultTab=""
              id="calendar-tabs"
            />
          </Box>
        }
        headerRight={
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={handleViewModeToggle}
              size="small"
              sx={{
                '& .MuiToggleButton-root': {
                  color: 'white',
                  borderColor: 'rgba(255,255,255,0.3)',
                  textTransform: 'none',
                  px: 2,
                  '&.Mui-selected': {
                    bgcolor: 'rgba(255,255,255,0.15)',
                    color: 'white'
                  },
                  '&:hover': {
                    bgcolor: 'rgba(255,255,255,0.08)'
                  }
                }
              }}
            >
              <ToggleButton value="month" data-testid="month-view-toggle">
                Month
              </ToggleButton>
              <ToggleButton value="week" data-testid="week-view-toggle">
                Week
              </ToggleButton>
            </ToggleButtonGroup>
            <NERButton
              variant="contained"
              disabled={isGuest(user.role)}
              startIcon={<Add />}
              onClick={() => handleNewEventClick()}
            >
              New Event
            </NERButton>
          </Box>
        }
      >
        {tabIndex === 0 ? (
          <NewCalendarPage
            allEventTypes={allEventTypes}
            reviewEvents={reviewEvents ?? []}
            yourEvents={eventsToEventInstances(yourEvents)}
            allCalendars={allCalendars}
            onCreateEventClick={handleNewEventClick}
            viewMode={viewMode}
            displayMonthYear={displayMonthYear}
            setDisplayMonthYear={setDisplayMonthYear}
            displayWeek={displayWeek}
            setDisplayWeek={setDisplayWeek}
            selectedEventId={selectedEventId}
          />
        ) : (
          <EventsTable
            tab={tabIndex}
            yourEvents={yourEvents ?? []}
            reviewEvents={reviewEvents ?? []}
            allEventTypes={allEventTypes}
            allCalendars={allCalendars}
          />
        )}
      </PageLayout>

      {isCreateModalOpen && (
        <CreateEventModal
          open={isCreateModalOpen}
          onClose={() => {
            setIsCreateModalOpen(false);
            setCreateModalStartTime(undefined);
            setCreateModalEndTime(undefined);
          }}
          eventTypes={allEventTypes}
          defaultDate={createModalDate}
          defaultStartTime={createModalStartTime}
          defaultEndTime={createModalEndTime}
          onSwitchToCreateTask={() => {
            setCreateTaskDefaultDeadline(createModalDate);
            setIsCreateModalOpen(false);
            setCreateModalStartTime(undefined);
            setCreateModalEndTime(undefined);
            setIsCreateTaskModalOpen(true);
          }}
        />
      )}

      {isCreateTaskModalOpen && (
        <CalendarCreateTaskModal
          open={isCreateTaskModalOpen}
          onClose={() => {
            setIsCreateTaskModalOpen(false);
            setCreateTaskDefaultDeadline(undefined);
          }}
          defaultDeadline={createTaskDefaultDeadline}
        />
      )}
    </>
  );
};

export default CalendarTab;
