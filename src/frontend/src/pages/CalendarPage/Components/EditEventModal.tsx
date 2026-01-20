import React from 'react';
import EventModal, { EventFormSubmitResult } from './EventModal';
import type { Event, EventType } from 'shared';
import { convertEventToFormValues } from '../../../utils/calendar.utils';
import { useEditEvent, useUploadManyDocuments } from '../../../hooks/calendar.hooks';
import { useToast } from '../../../hooks/toasts.hooks';

export interface EditEventModalProps {
  open: boolean;
  onClose: () => void;
  event: Event;
  eventTypes: EventType[];
  defaultDate?: Date;
}

const EditEventModal: React.FC<EditEventModalProps> = ({ open, onClose, event, eventTypes, defaultDate }) => {
  const toast = useToast();
  const { mutateAsync: editEvent } = useEditEvent(event.eventId);
  const { mutateAsync: uploadDocuments } = useUploadManyDocuments();

  const initialValues = convertEventToFormValues(event);
  const computedDefaultDate =
    defaultDate ?? (event.scheduledTimes[0]?.startTime ? new Date(event.scheduledTimes[0].startTime) : new Date());

  const handleSubmit = async ({ basePayload }: EventFormSubmitResult) => {
    const { documentFiles, ...eventData } = basePayload;

    const editArgs = {
      ...eventData,
      status: event.status,
      documents: event.documents.map((doc) => ({
        name: doc.name,
        googleFileId: doc.googleFileId
      }))
    };

    // Don't wrap in try catch because we want errors to propagate to the modal
    const editedEvent = await editEvent(editArgs);

    const filesToUpload = documentFiles.map((doc) => doc.file).filter((file): file is File => file !== undefined);
    if (filesToUpload.length > 0) {
      await uploadDocuments({
        id: editedEvent.eventId,
        files: filesToUpload
      });
    }

    toast.success('Event updated successfully!');
  };

  return (
    <EventModal
      open={open}
      onClose={onClose}
      onSubmit={handleSubmit}
      initialValues={initialValues}
      eventTypes={eventTypes}
      defaultDate={computedDefaultDate}
    />
  );
};

export default EditEventModal;
