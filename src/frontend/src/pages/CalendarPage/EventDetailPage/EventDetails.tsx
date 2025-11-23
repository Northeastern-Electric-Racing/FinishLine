/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */
import LoadingIndicator from '../../../components/LoadingIndicator';
import { useParams } from 'react-router-dom';
import ErrorPage from '../../ErrorPage';
import { useSingleEvent } from '../../../hooks/calendar.hooks';
import EventDetailPage from './EventDetailPage';

const EventDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { data: event, isError, error, isLoading } = useSingleEvent(id);

  if (isError) return <ErrorPage error={error} />;
  if (!event || isLoading) return <LoadingIndicator />;

  return <EventDetailPage event={event} />;
};

export default EventDetails;
