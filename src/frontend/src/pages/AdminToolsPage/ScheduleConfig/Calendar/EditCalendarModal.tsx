import CalendarModal, { CalendarFormValues } from './CalendarModal';

export interface EditCalendarModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CalendarFormValues) => Promise<unknown> | unknown;
  initialValues: Partial<CalendarFormValues>;
}

const EditCalendarModal: React.FC<EditCalendarModalProps> = ({ open, onClose, onSubmit, initialValues }) => {
  return <CalendarModal open={open} onClose={onClose} onSubmit={onSubmit} initialValues={initialValues} />;
};

export default EditCalendarModal;
