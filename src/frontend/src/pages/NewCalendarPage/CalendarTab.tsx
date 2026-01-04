import { routes } from '../../utils/routes';
import NewCalendarPage from './NewCalendarPage';
import PageLayout from '../../components/PageLayout';
import { Box } from '@mui/material';
import FullPageTabs from '../../components/FullPageTabs';
import { useState } from 'react';
import { useCurrentUser } from '../../hooks/users.hooks';
import { Event, ConflictStatus, isHead, isLead } from 'shared';
import {
  EditEventArgs,
  useAllCalendars,
  useAllEventTypes,
  useFilterEvents,
  useUploadManyDocuments
} from '../../hooks/calendar.hooks';
import LoadingIndicator from '../../components/LoadingIndicator';
import ErrorPage from '../ErrorPage';
import { filterEventTransformer } from '../../apis/transformers/calendar.transformer';
import EventsTable from './EventsTable';
import { EventRoutePayload } from './Components/EventModal';
import { useToast } from '../../hooks/toasts.hooks';

const CalendarTab: React.FC = () => {
  const [tabIndex, setTabIndex] = useState<number>(0);
  const user = useCurrentUser();
  const canViewReviews = isHead(user.role) || isLead(user.role);
  const toast = useToast();
  const { mutateAsync: uploadDocuments } = useUploadManyDocuments();

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

  const handleEditSubmit = async (
    data: EventRoutePayload,
    event: Event,
    editEvent: (editArgs: EditEventArgs) => Promise<Event>,
    onClose: () => void
  ) => {
    if (!event) return;

    try {
      const { scheduleSlot, documentFiles, ...eventData } = data;

      if (!scheduleSlot || scheduleSlot.length === 0) {
        throw new Error('Missing scheduleSlot');
      }

      // Convert EventRoutePayload to EditEventArgs format
      const editArgs: EditEventArgs = {
        ...eventData,
        status: event.status, // Use existing event status
        documents: event.documents.map((doc) => ({
          name: doc.name,
          googleFileId: doc.googleFileId
        })),
        scheduleSlot: scheduleSlot.map((slot) => ({
          days: slot.days,
          startTime: slot.startTime,
          endTime: slot.endTime,
          recurrenceNumber: slot.recurrenceNumber,
          initialDateScheduled: slot.initialDateScheduled,
          allDay: slot.allDay
        }))
      };

      const editedEvent = await editEvent(editArgs);

      // Upload new documents if any
      const filesToUpload = documentFiles.map((doc) => doc.file).filter((file): file is File => file !== undefined);

      if (filesToUpload.length > 0) {
        await uploadDocuments({
          id: editedEvent.eventId,
          files: filesToUpload
        });
      }

      toast.success('Event updated successfully!');
      onClose();
    } catch (err) {
      if (err instanceof Error) {
        toast.error(err.message);
      }
    }
  };

  return (
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
    >
      {tabIndex === 0 ? (
        <NewCalendarPage
          allEventTypes={allEventTypes}
          reviewEvents={reviewEvents ?? []}
          yourEvents={yourEvents ?? []}
          allCalendars={allCalendars}
        />
      ) : (
        <EventsTable
          tab={tabIndex}
          yourEvents={yourEvents ?? []}
          reviewEvents={reviewEvents ?? []}
          allEventTypes={allEventTypes}
          allCalendars={allCalendars}
          handleEditSubmit={handleEditSubmit}
        />
      )}
    </PageLayout>
  );
};

export default CalendarTab;
