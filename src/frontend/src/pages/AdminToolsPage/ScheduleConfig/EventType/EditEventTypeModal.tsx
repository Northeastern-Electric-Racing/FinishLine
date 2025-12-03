import ErrorPage from '../../../ErrorPage';
import LoadingIndicator from '../../../../components/LoadingIndicator';
import { useEditEventType } from '../../../../hooks/calendar.hooks';
import { useToast } from '../../../../hooks/toasts.hooks';
import { EventType } from 'shared';
import EventTypeFormModal, { EventTypeFormValues } from './EventTypeFormModal';

interface EditEventTypeModalProps {
  open: boolean;
  onClose: () => void;
  eventType: EventType;
}

const EditEventTypeModal = ({ open, onClose, eventType }: EditEventTypeModalProps) => {
  const {
    isLoading: isEditing,
    isError: isEditError,
    error: editError,
    mutateAsync: editEventType
  } = useEditEventType(eventType.eventTypeId);
  const toast = useToast();

  const isLoading = isEditing;
  const isError = isEditError;
  const error = editError;

  const eventTypeData: EventTypeFormValues = {
    name: eventType.name,
    calendarIds: eventType.calendarIds || [],
    initialDateScheduled: eventType.initialDateScheduled,
    allDay: eventType.allDay,
    recurring: eventType.recurring,
    requiredMembers: eventType.requiredMembers,
    optionalMembers: eventType.optionalMembers,
    teams: eventType.teams,
    teamType: eventType.teamType || false,
    location: eventType.location,
    zoomLink: eventType.zoomLink,
    shop: eventType.shop,
    machinery: eventType.machinery,
    workPackage: eventType.workPackage,
    questionDocument: eventType.questionDocument || false,
    documents: eventType.documents,
    description: eventType.description,
    onlyHeadsOrAbove: eventType.onlyHeadsOrAboveForEventCreation,
    requiresConfirmation: eventType.requiresConfirmation || false,
    sendSlackNotifications: eventType.sendSlackNotifications || false
  };

  if (isError) return <ErrorPage message={error?.message} />;
  if (isLoading) return <LoadingIndicator />;

  const onSubmit = async (data: EventTypeFormValues) => {
    try {
      const result = await editEventType(data);
      toast.success('Event type updated successfully');
      return result;
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('An error occurred while updating the event type');
      }
      throw error;
    }
  };

  return <EventTypeFormModal open={open} onClose={onClose} onSubmit={onSubmit} initialValues={eventTypeData} />;
};

export default EditEventTypeModal;
