import React from 'react';
import EventModal, { EventPayload } from './EventModal';
import type { EventType, EventDocumentUploadArgs } from 'shared';
import { useCreateEvent, useUploadManyDocuments } from '../../../hooks/calendar.hooks';
import { useToast } from '../../../hooks/toasts.hooks';
import { convertDayToInt } from '../../../utils/calendar.utils';

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

  const handleSubmit = async (payload: EventPayload) => {
    try {
      const { documentFiles, createScheduleSlotArgs, initialDateScheduled, ...eventData } = payload;

      const scheduleSlots: Array<{
        startTime: Date;
        endTime: Date;
        allDay: boolean;
      }> = [];

      // Generate schedule slots from createScheduleSlotArgs if provided
      if (createScheduleSlotArgs) {
        const { startTime, endTime, days, recurrenceNumber, allDay } = createScheduleSlotArgs;

        // Helper function to create a date/time for a specific occurrence
        const createSlotDateTime = (baseDate: Date, time: Date): Date => {
          const result = new Date(baseDate);
          result.setHours(time.getHours(), time.getMinutes(), time.getSeconds(), time.getMilliseconds());
          return result;
        };

        // Convert selected days to day indices for comparison
        const dayIndices = days.map(convertDayToInt);

        // Generate recurring occurrences
        let occurrencesGenerated = 0;
        const searchDate = new Date(startTime);

        const maxDaysToSearch = 365; // Search up to a year
        let daysSearched = 0;

        while (occurrencesGenerated < recurrenceNumber && daysSearched < maxDaysToSearch) {
          const currentDayIndex = searchDate.getDay();

          if ((dayIndices as number[]).includes(currentDayIndex)) {
            scheduleSlots.push({
              startTime: createSlotDateTime(searchDate, startTime),
              endTime: createSlotDateTime(searchDate, endTime),
              allDay
            });
            occurrencesGenerated++;
          }

          searchDate.setDate(searchDate.getDate() + 1);
          daysSearched++;
        }
      }

      const createArgs = {
        ...eventData,
        initialDateScheduled: initialDateScheduled ?? new Date(),
        scheduleSlots,
        documentIds: []
      };

      const createdEvent = await createEvent(createArgs);

      const filesToUpload = documentFiles
        .map((doc: EventDocumentUploadArgs) => doc.file)
        .filter((file: File | undefined): file is File => file !== undefined);
      if (filesToUpload.length > 0) {
        await uploadDocuments({
          id: createdEvent.eventId,
          files: filesToUpload
        });
      }

      toast.success('Event created successfully!');
    } catch (e: unknown) {
      if (e instanceof Error) {
        toast.error(e.message, 5000);
      } else {
        toast.error('Failed to create event', 5000);
      }
      throw e;
    }
  };

  return (
    <EventModal
      key={open ? 'create-event-open' : 'create-event-closed'}
      open={open}
      onClose={onClose}
      onSubmit={handleSubmit}
      eventTypes={eventTypes}
      defaultDate={defaultDate}
    />
  );
};

export default CreateEventModal;
