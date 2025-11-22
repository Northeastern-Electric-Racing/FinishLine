import ErrorPage from '../../../ErrorPage';
import LoadingIndicator from '../../../../components/LoadingIndicator';
import { useCreateEventType, EVENT_TYPE_KEY } from '../../../../hooks/calendar.hooks';
import { useQueryClient } from 'react-query';
import EventFormModal, { EventFormValues } from './EventFormModal';

interface CreateEventModalProps {
  open: boolean;
  onClose: () => void;
}

const CreateEventModal = ({ open, onClose }: CreateEventModalProps) => {
  const { isLoading, isError, error, mutateAsync: createEventType } = useCreateEventType();
  const queryClient = useQueryClient();

  if (isError) return <ErrorPage message={error?.message} />;
  if (isLoading) return <LoadingIndicator />;

  const onSubmit = async (data: EventFormValues) => {
    const result = await createEventType(data);
    await queryClient.invalidateQueries(EVENT_TYPE_KEY);
    await queryClient.refetchQueries(EVENT_TYPE_KEY);
    return result;
  };

  return <EventFormModal open={open} onClose={onClose} onSubmit={onSubmit} />;
};

export default CreateEventModal;
