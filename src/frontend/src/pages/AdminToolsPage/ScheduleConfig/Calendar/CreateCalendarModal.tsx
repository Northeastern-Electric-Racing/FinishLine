import React from 'react';
import CalendarModal, { CalendarFormValues } from './CalendarModal';

interface CreateCalendarModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CalendarFormValues) => Promise<unknown> | unknown;
}

const CreateCalendarModal: React.FC<CreateCalendarModalProps> = (props) => {
  return <CalendarModal {...props} initialValues={{ name: '', description: '', color: '#F97316' }} />;
};

export default CreateCalendarModal;
