import CalendarModal, { CalendarFormValues } from './CalendarModal';

interface CreateCalendarModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CalendarFormValues) => Promise<unknown> | unknown;
}

const CreateCalendarModal: React.FC<CreateCalendarModalProps> = (props) => {
  return <CalendarModal {...props} />;
};

export default CreateCalendarModal;
