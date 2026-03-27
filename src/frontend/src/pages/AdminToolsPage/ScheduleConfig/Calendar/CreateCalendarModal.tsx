import React from 'react';
import CalendarModal, { CalendarFormValues } from './CalendarModal';
import { useCreateCalendar } from '../../../../hooks/calendar.hooks';
import { useToast } from '../../../../hooks/toasts.hooks';

interface CreateCalendarModalProps {
  open: boolean;
  onClose: () => void;
}

const CreateCalendarModal: React.FC<CreateCalendarModalProps> = ({ open, onClose }) => {
  const { mutateAsync: createCalendar } = useCreateCalendar();
  const toast = useToast();

  const onSubmit = async (data: CalendarFormValues) => {
    try {
      const result = await createCalendar({
        name: data.name,
        description: data.description,
        colorHexCode: data.colorHexCode
      });
      toast.success('Calendar created successfully');
      return result;
    } catch (e: unknown) {
      if (e instanceof Error) {
        toast.error(e.message);
      } else {
        toast.error('An error occurred while creating the calendar');
      }
      throw e;
    }
  };

  return <CalendarModal open={open} onClose={onClose} onSubmit={onSubmit} />;
};

export default CreateCalendarModal;
