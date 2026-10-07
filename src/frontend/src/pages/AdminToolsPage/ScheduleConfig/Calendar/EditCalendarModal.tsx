import React from 'react';
import CalendarModal, { CalendarFormValues } from './CalendarModal';
import { useEditCalendar } from '../../../../hooks/calendar.hooks';
import { useToast } from '../../../../hooks/toasts.hooks';
import { Calendar } from 'shared';

export interface EditCalendarModalProps {
  open: boolean;
  onClose: () => void;
  calendar: Calendar;
}

const EditCalendarModal: React.FC<EditCalendarModalProps> = ({ open, onClose, calendar }) => {
  const { mutateAsync: editCalendar } = useEditCalendar(calendar.calendarId);
  const toast = useToast();

  const initialValues: CalendarFormValues = {
    name: calendar.name,
    description: calendar.description ?? '',
    colorHexCode: calendar.color ?? '',
    isNewMemberCalendar: calendar.isNewMemberCalendar
  };

  const onSubmit = async (data: CalendarFormValues) => {
    try {
      const result = await editCalendar({
        name: data.name,
        description: data.description,
        colorHexCode: data.colorHexCode,
        isNewMemberCalendar: data.isNewMemberCalendar
      });
      toast.success('Calendar updated successfully');
      return result;
    } catch (e: unknown) {
      if (e instanceof Error) {
        toast.error(e.message);
      } else {
        toast.error('An error occurred while updating the calendar');
      }
      throw e;
    }
  };

  return <CalendarModal open={open} onClose={onClose} onSubmit={onSubmit} initialValues={initialValues} />;
};

export default EditCalendarModal;
