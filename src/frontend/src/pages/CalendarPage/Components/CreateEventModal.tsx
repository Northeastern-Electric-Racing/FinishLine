import EventModal, { EventRoutePayload } from './EventModal';
import type { EventType } from 'shared';

interface CreateEventModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: EventRoutePayload) => void;
  eventTypes: EventType[];
  defaultDate?: Date;
}

const CreateEventModal: React.FC<CreateEventModalProps> = (props) => {
  return <EventModal {...props} />;
};

export default CreateEventModal;
