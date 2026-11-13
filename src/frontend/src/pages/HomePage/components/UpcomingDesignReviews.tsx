/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import DesignReviewCard from './EventCard';
import { useUpcomingEvents } from '../../../hooks/calendar.hooks';
import ErrorPage from '../../ErrorPage';
import { EventStatus } from 'shared';
import LoadingIndicator from '../../../components/LoadingIndicator';
import ScrollablePageBlock from './ScrollablePageBlock';
import EmptyPageBlockDisplay from './EmptyPageBlockDisplay';
import { Error } from '@mui/icons-material';

const NoUpcomingEventsDisplay: React.FC = () => {
  return (
    <EmptyPageBlockDisplay
      icon={<Error sx={{ fontSize: 70 }} />}
      heading={'No Upcoming Design Reviews'}
      message={'There are no Upcoming Design Reviews to Display'}
    />
  );
};

const UpcomingEvents: React.FC = () => {
  // the user's own events in the next two weeks, with only their upcoming slots
  const { data: events, isLoading, isError, error } = useUpcomingEvents(14, false);

  if (isLoading || !events) return <LoadingIndicator />;
  if (isError) return <ErrorPage error={error} message={error.message} />;

  const filteredEvents = events.filter((event) => event.status !== EventStatus.DONE);

  const fullDisplay = (
    <ScrollablePageBlock title={`Upcoming Design Reviews (${filteredEvents.length})`}>
      {filteredEvents.length === 0 ? (
        <NoUpcomingEventsDisplay />
      ) : (
        filteredEvents.map((event) => <DesignReviewCard key={event.eventId} event={event} />)
      )}
    </ScrollablePageBlock>
  );

  return fullDisplay;
};

export default UpcomingEvents;
