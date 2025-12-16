import { routes } from '../../utils/routes';
import NewCalendarPage from './NewCalendarPage';
import YourEventsPage from './YourEventsPage';
import PageLayout from '../../components/PageLayout';
import { Box } from '@mui/material';
import FullPageTabs from '../../components/FullPageTabs';
import { useState } from 'react';
import { useCurrentUser } from '../../hooks/users.hooks';
import { ConflictStatus, isHead, isLead } from 'shared';
import { useFilterEvents } from '../../hooks/calendar.hooks';
import LoadingIndicator from '../../components/LoadingIndicator';
import ErrorPage from '../ErrorPage';
import { filterEventTransformer } from '../../apis/transformers/calendar.transformer';

const CalendarTab: React.FC = () => {
  const [tabIndex, setTabIndex] = useState<number>(0);
  const user = useCurrentUser();
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

  const yourEvents = untransformedYourEvents?.map(filterEventTransformer);
  const reviewEvents = untransformedReviewEvents?.map(filterEventTransformer);

  if (!yourEvents || yourEventsLoading) return <LoadingIndicator />;
  if (yourEventsIsError) return <ErrorPage error={yourEventsError} message={yourEventsError?.message} />;

  if (!reviewEvents || reviewEventsLoading) return <LoadingIndicator />;
  if (reviewEventsIsError) return <ErrorPage error={reviewEventsError} message={reviewEventsError?.message} />;

  if (canViewReviews) tabs.push({ tabUrlValue: 'reviews', tabName: 'Review Bookings' });

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
        <NewCalendarPage />
      ) : (
        <YourEventsPage tab={tabIndex} yourEvents={yourEvents ?? []} reviewEvents={reviewEvents ?? []} />
      )}
    </PageLayout>
  );
};

export default CalendarTab;
