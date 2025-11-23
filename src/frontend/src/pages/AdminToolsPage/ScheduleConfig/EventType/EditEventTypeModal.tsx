import ErrorPage from '../../../ErrorPage';
import LoadingIndicator from '../../../../components/LoadingIndicator';
import { useEditEventType, EVENT_TYPE_KEY } from '../../../../hooks/calendar.hooks';
import { useQueryClient } from 'react-query';
import { EventType } from 'shared';
import EventTypeFormModal, { EventTypeFormValues } from './EventTypeFormModal';

interface EditEventTypeModalProps {
  open: boolean;
  onClose: () => void;
  eventType: EventType;
}

const EditEventTypeModal = ({ open, onClose, eventType }: EditEventTypeModalProps) => {
  const queryClient = useQueryClient();

  const {
    isLoading: isEditing,
    isError: isEditError,
    error: editError,
    mutateAsync: editEventType
  } = useEditEventType(eventType.eventTypeId);

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
    location: eventType.location,
    zoomLink: eventType.zoomLink,
    shop: eventType.shop,
    machinery: eventType.machinery,
    workPackage: eventType.workPackage,
    questionDocument: eventType.questionDocument || false,
    documents: eventType.documents,
    description: eventType.description,
    onlyHeadsOrAbove: eventType.onlyHeadsOrAboveForEventCreation,
    requiresConfirmation: false
  };

  if (isError) return <ErrorPage message={error?.message} />;
  if (isLoading) return <LoadingIndicator />;

  const onSubmit = async (data: EventTypeFormValues) => {
    const result = await editEventType(data);
    await queryClient.invalidateQueries(EVENT_TYPE_KEY);
    await queryClient.refetchQueries(EVENT_TYPE_KEY);
    return result;
  };

  return <EventTypeFormModal open={open} onClose={onClose} onSubmit={onSubmit} initialValues={eventTypeData} />;
};

export default EditEventTypeModal;

