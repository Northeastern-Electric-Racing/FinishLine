import EventModal, { EventFormValues, EventRoutePayload } from './EventModal';
import type { EventType } from 'shared';

export interface EditEventModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: EventRoutePayload) => void;
  initialValues: Partial<EventFormValues>;
  eventTypes: EventType[];
}

const EditEventModal: React.FC<EditEventModalProps> = (props) => {
  return <EventModal {...props} />;
};

export default EditEventModal;
