import { routes } from '../../utils/routes';
import NewCalendarPage from './NewCalendarPage';
import PageLayout from '../../components/PageLayout';
import { Box, Button } from '@mui/material';
import FullPageTabs from '../../components/FullPageTabs';
import { useState } from 'react';
import { useCurrentUser } from '../../hooks/users.hooks';
import { ConflictStatus, isHead, isLead } from 'shared';
import { useAllCalendars, useAllEventTypes, useFilterEvents } from '../../hooks/calendar.hooks';
import LoadingIndicator from '../../components/LoadingIndicator';
import ErrorPage from '../ErrorPage';
import { filterEventTransformer } from '../../apis/transformers/calendar.transformer';
import EventsTable from './EventsTable';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import CreateEventModal from './Components/CreateEventModal';
import { useHistory } from 'react-router-dom';

const CalendarTab: React.FC = () => {
  const [tabIndex, setTabIndex] = useState<number>(0);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createModalDate, setCreateModalDate] = useState<Date>(new Date());
  const user = useCurrentUser();
  const history = useHistory();
  const canViewReviews = isHead(user.role) || isLead(user.role);

  const tabs = [
    { tabUrlValue: 'mainCalendar', tabName: 'Calendar' },
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
  if (yourEventsIsError) return <ErrorPage error={yourEventsError} message={yourEventsError?.message} />;

  if (reviewEventsIsError) return <ErrorPage error={reviewEventsError} message={reviewEventsError?.message} />;

  if (allEventTypesIsError) return <ErrorPage error={allEventTypesError} message={allEventTypesError?.message} />;

  if (allCalendarsIsError) return <ErrorPage error={allCalendarsError} message={allCalendarsError?.message} />;

  if (canViewReviews) tabs.push({ tabUrlValue: 'reviews', tabName: 'Review Bookings' });

  const handleNewEventClick = (date?: Date) => {
    if (tabIndex !== 0) {
      history.push(`${routes.NEW_CALENDAR}/mainCalendar`);
    }
    setCreateModalDate(date || new Date());
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
              baseUrl={routes.NEW_CALENDAR}
              defaultTab="mainCalendar"
              id="calendar-tabs"
            />
          </Box>
        }
        headerRight={
          <Button
            variant="contained"
            disableElevation
            onClick={() => handleNewEventClick()}
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
        }
      >
        {tabIndex === 0 ? (
          <NewCalendarPage
            allEventTypes={allEventTypes}
            reviewEvents={reviewEvents ?? []}
            yourEvents={
              yourEvents.flatMap((event) => event.scheduledTimes.map((scheduledTime) => ({ ...event, ...scheduledTime }))) ??
              []
            }
            allCalendars={allCalendars}
            onCreateEventClick={handleNewEventClick}
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
          onClose={() => setIsCreateModalOpen(false)}
          eventTypes={allEventTypes}
          defaultDate={createModalDate}
        />
      )}
    </>
  );
};

export default CalendarTab;
