import EventModal, { EventFormValues, EventRoutePayload } from './EventModal';
import type { EventType } from 'shared';

export interface EditEventModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: EventRoutePayload) => void;
  initialValues: Partial<EventFormValues>;
  eventTypes: EventType[];
}

const EditEventModal: React.FC<EditEventModalProps> = ({ open, onClose, onSubmit, initialValues, eventTypes }) => {
  return (
    <EventModal open={open} onClose={onClose} onSubmit={onSubmit} initialValues={initialValues} eventTypes={eventTypes} />
  );
};

export default EditEventModal;
