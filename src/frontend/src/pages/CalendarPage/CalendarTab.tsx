import { routes } from '../../utils/routes';
import NewCalendarPage from './CalendarPage';
import PageLayout from '../../components/PageLayout';
import { Box } from '@mui/material';
import FullPageTabs from '../../components/FullPageTabs';
import { useState } from 'react';
import { useCurrentUser } from '../../hooks/users.hooks';
import { ConflictStatus, isGuest, isHead, isLead } from 'shared';
import { useAllCalendars, useAllEventTypes, useFilterEvents } from '../../hooks/calendar.hooks';
import LoadingIndicator from '../../components/LoadingIndicator';
import ErrorPage from '../ErrorPage';
import { filterEventTransformer } from '../../apis/transformers/calendar.transformer';
import EventsTable from './EventsTable';
import CreateEventModal from './Components/CreateEventModal';
import { useHistory } from 'react-router-dom';
import { NERButton } from '../../components/NERButton';
import { Add } from '@mui/icons-material';
import { eventsToEventInstances } from '../../utils/calendar.utils';

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
      history.push(`${routes.CALENDAR}/mainCalendar`);
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
              baseUrl={routes.CALENDAR}
              defaultTab="mainCalendar"
              id="calendar-tabs"
            />
          </Box>
        }
        headerRight={
          <NERButton
            variant="contained"
            disabled={isGuest(user.role)}
            startIcon={<Add />}
            onClick={() => handleNewEventClick()}
          >
            New Event
          </NERButton>
        }
      >
        {tabIndex === 0 ? (
          <NewCalendarPage
            allEventTypes={allEventTypes}
            reviewEvents={reviewEvents ?? []}
            yourEvents={eventsToEventInstances(yourEvents)}
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
