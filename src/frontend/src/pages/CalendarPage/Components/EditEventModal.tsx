import React from 'react';
import EventModal, { EventPayload } from './EventModal';
import type { EventInstance, EventType, EventDocumentUploadArgs } from 'shared';
import { convertEventToFormValues } from '../../../utils/calendar.utils';
import { useEditEvent, useUploadManyDocuments } from '../../../hooks/calendar.hooks';
import { useToast } from '../../../hooks/toasts.hooks';

export interface EditEventModalProps {
  open: boolean;
  onClose: () => void;
  event: EventInstance;
  eventTypes: EventType[];
}

const EditEventModal: React.FC<EditEventModalProps> = ({ open, onClose, event, eventTypes }) => {
  const toast = useToast();
  const { mutateAsync: editEvent } = useEditEvent(event.eventId);
  const { mutateAsync: uploadDocuments } = useUploadManyDocuments();

  const initialValues = convertEventToFormValues(event);

  const handleSubmit = async (payload: EventPayload) => {
    try {
      const { documentFiles, editScheduleSlotArgs, ...eventData } = payload;

      // First, update the event base information
      const editArgs = {
        ...eventData,
        status: event.status,
        documents: event.documents.map((doc) => ({
          name: doc.name,
          googleFileId: doc.googleFileId
        })),
        scheduleSlots: payload.editScheduleSlotArgs
          ? [
              {
                startTime: payload.editScheduleSlotArgs.newStartTime,
                endTime: payload.editScheduleSlotArgs.newEndTime,
                allDay: payload.editScheduleSlotArgs.newAllDay
              }
            ]
          : []
      };

      const editedEvent = await editEvent(editArgs);

      // Handle document uploads
      const filesToUpload = documentFiles
        .map((doc: EventDocumentUploadArgs) => doc.file)
        .filter((file: File | undefined): file is File => file !== undefined);
      if (filesToUpload.length > 0) {
        await uploadDocuments({
          id: editedEvent.eventId,
          files: filesToUpload
        });
      }

      toast.success('Event updated successfully!');
    } catch (e: unknown) {
      if (e instanceof Error) {
        toast.error(e.message, 5000);
      } else {
        toast.error('Failed to update event', 5000);
      }
      throw e;
    }
  };

  return (
    <EventModal
      key={open ? `edit-event-${event.eventId}-${event.scheduleSlotId}` : 'edit-event-closed'}
      open={open}
      onClose={onClose}
      onSubmit={handleSubmit}
      initialValues={initialValues}
      eventTypes={eventTypes}
      eventId={event.eventId}
    />
  );
};

export default EditEventModal;
