import ErrorPage from '../../../ErrorPage';
import LoadingIndicator from '../../../../components/LoadingIndicator';
import { useCreateEventType } from '../../../../hooks/calendar.hooks';
import { useToast } from '../../../../hooks/toasts.hooks';
import EventTypeFormModal, { EventTypeFormValues } from './EventTypeFormModal';

interface CreateEventTypeModalProps {
  open: boolean;
  onClose: () => void;
}

const CreateEventTypeModal = ({ open, onClose }: CreateEventTypeModalProps) => {
  const { isLoading, isError, error, mutateAsync: createEventType } = useCreateEventType();
  const toast = useToast();

  if (isError) return <ErrorPage message={error?.message} />;
  if (isLoading) return <LoadingIndicator />;

  const onSubmit = async (data: EventTypeFormValues) => {
    try {
      const result = await createEventType(data);
      toast.success('Event type created successfully');
      return result;
    } catch (e: unknown) {
      if (e instanceof Error) {
        toast.error(e.message);
      } else {
        toast.error('An error occurred while creating the event type');
      }
      throw e;
    }
  };

  return <EventTypeFormModal open={open} onClose={onClose} onSubmit={onSubmit} />;
};

export default CreateEventTypeModal;
