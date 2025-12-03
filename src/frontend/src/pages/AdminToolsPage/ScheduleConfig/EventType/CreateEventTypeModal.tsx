import ErrorPage from '../../../ErrorPage';
import LoadingIndicator from '../../../../components/LoadingIndicator';
import { useCreateEventType, EVENT_TYPE_KEY } from '../../../../hooks/calendar.hooks';
import { useQueryClient } from 'react-query';
import EventTypeFormModal, { EventTypeFormValues } from './EventTypeFormModal';

interface CreateEventTypeModalProps {
  open: boolean;
  onClose: () => void;
}

const CreateEventTypeModal = ({ open, onClose }: CreateEventTypeModalProps) => {
  const { isLoading, isError, error, mutateAsync: createEventType } = useCreateEventType();
  const queryClient = useQueryClient();

  if (isError) return <ErrorPage message={error?.message} />;
  if (isLoading) return <LoadingIndicator />;

  const onSubmit = async (data: EventTypeFormValues) => {
    const result = await createEventType(data);
    await queryClient.invalidateQueries(EVENT_TYPE_KEY);
    await queryClient.refetchQueries(EVENT_TYPE_KEY);
    return result;
  };

  return <EventTypeFormModal open={open} onClose={onClose} onSubmit={onSubmit} />;
};

export default CreateEventTypeModal;
