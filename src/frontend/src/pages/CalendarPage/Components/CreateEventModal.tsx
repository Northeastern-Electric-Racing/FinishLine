import React from 'react';
import EventModal, { EventFormSubmitResult } from './EventModal';
import type { EventType } from 'shared';
import { useCreateEvent, useUploadManyDocuments } from '../../../hooks/calendar.hooks';
import { useToast } from '../../../hooks/toasts.hooks';

interface CreateEventModalProps {
  open: boolean;
  onClose: () => void;
  eventTypes: EventType[];
  defaultDate?: Date;
}

const CreateEventModal: React.FC<CreateEventModalProps> = ({ open, onClose, eventTypes, defaultDate }) => {
  const toast = useToast();
  const { mutateAsync: createEvent } = useCreateEvent();
  const { mutateAsync: uploadDocuments } = useUploadManyDocuments();

  const handleSubmit = async ({ basePayload, scheduleSlots, scheduleDate, requiresConfirmation }: EventFormSubmitResult) => {
    const { documentFiles, ...eventData } = basePayload;

    const createArgs = {
      ...eventData,
      initialDateScheduled: scheduleDate,
      scheduleSlot: requiresConfirmation ? [] : scheduleSlots,
      documentIds: []
    };

    // Don't wrap in try catch because we want errors to propagate to the modal
    const createdEvent = await createEvent(createArgs);

    const filesToUpload = documentFiles.map((doc) => doc.file).filter((file): file is File => file !== undefined);
    if (filesToUpload.length > 0) {
      await uploadDocuments({
        id: createdEvent.eventId,
        files: filesToUpload
      });
    }

    toast.success('Event created successfully!');
  };

  return (
    <EventModal open={open} onClose={onClose} onSubmit={handleSubmit} eventTypes={eventTypes} defaultDate={defaultDate} />
  );
};

export default CreateEventModal;
