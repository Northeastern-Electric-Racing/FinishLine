/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import DesignReviewCard from './EventCard';
import { useAllEvents } from '../../../hooks/calendar.hooks';
import ErrorPage from '../../ErrorPage';
import { AuthenticatedUser, EventStatus } from 'shared';
import LoadingIndicator from '../../../components/LoadingIndicator';
import ScrollablePageBlock from './ScrollablePageBlock';
import EmptyPageBlockDisplay from './EmptyPageBlockDisplay';
import { Error } from '@mui/icons-material';

interface UpcomingEventProps {
  user: AuthenticatedUser;
}

const NoUpcomingEventsDisplay: React.FC = () => {
  return (
    <EmptyPageBlockDisplay
      icon={<Error sx={{ fontSize: 70 }} />}
      heading={'No Upcoming Design Reviews'}
      message={'There are no Upcoming Design Reviews to Display'}
    />
  );
};

const UpcomingEvents: React.FC<UpcomingEventProps> = ({ user }) => {
  const { data: events, isLoading, isError, error } = useAllEvents();

  if (isLoading || !events) return <LoadingIndicator />;
  if (isError) return <ErrorPage error={error} message={error.message} />;

  const filteredEvents = events.filter((event) => {
    // Get the first scheduled date
    const scheduledDate = event.scheduledTimes[0]?.initialDateScheduled;
    if (!scheduledDate) return false;

    const currentDate = new Date();
    const inTwoWeeks = new Date();
    inTwoWeeks.setDate(currentDate.getDate() + 14);

    const memberUserIds = [
      ...event.requiredMembers.map((user) => user.userId),
      ...event.optionalMembers.map((user) => user.userId)
    ];

    memberUserIds.push(event.userCreated.userId);
    return (
      scheduledDate >= currentDate &&
      scheduledDate <= inTwoWeeks &&
      event.status !== EventStatus.DONE &&
      memberUserIds.includes(user.userId)
    );
  });

  const fullDisplay = (
    <ScrollablePageBlock title={`Upcoming Design Reviews (${filteredEvents.length})`}>
      {filteredEvents.length === 0 ? (
        <NoUpcomingEventsDisplay />
      ) : (
        filteredEvents.map((event) => <DesignReviewCard key={event.eventId} event={event} user={user} />)
      )}
    </ScrollablePageBlock>
  );

  return fullDisplay;
};

export default UpcomingEvents;
