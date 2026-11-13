import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from 'react-query';
import {
  Shop,
  Machinery,
  Calendar,
  AvailabilityCreateArgs,
  EventTypeCreateArgs,
  BaseEvent,
  CalendarEvent,
  EventDetail,
  UpcomingEvent,
  EventConflict,
  GuestEventInstance,
  UserEventAttendance,
  EventStatus,
  EventType,
  FilterArgs,
  ScheduleSlotCreateArgs,
  ScheduleSlot,
  SlackMentionType
} from 'shared';
import {
  getAllShops,
  postCreateShop,
  postDeleteShop,
  getAllMachinery,
  postCreateMachinery,
  postEditMachinery,
  postDeleteMachinery,
  postAddMachineryToShop,
  editShop,
  postDeleteCalendar,
  getAllCalendars,
  postEditCalendar,
  postCreateCalendar,
  postCreateEventType,
  postEditEventType,
  postDeleteEventType,
  markUserConfirmed,
  getSingleEvent,
  getNewMemberEvents,
  getReviewEvents,
  getUpcomingEvents,
  getMyConflicts,
  getEventAttendance,
  deleteEvent,
  setEventStatus,
  getAllEventTypes,
  postFilterEvents,
  approveEvent,
  denyEvent,
  postCreateEvent,
  uploadSingleDocument,
  downloadDocumentPdf,
  postEditEvent,
  postEditScheduleSlot,
  previewScheduleSlotRecurringEdits,
  postDeleteScheduleSlot,
  scheduleEvent,
  getAllEventsPaginated,
  getIcsToken,
  remindUnconfirmed
} from '../apis/calendar.api';
import { useCurrentUser } from './users.hooks';
import { PDFDocument } from 'pdf-lib';
import saveAs from 'file-saver';

export const FILTER_EVENTS_KEY = ['filter_events'] as const;

export const MACHINERY_KEY = ['machinery'] as const;
const SHOP_KEY = ['shops'] as const;
const CALENDAR_KEY = ['calendars'] as const;
export const EVENT_TYPE_KEY = ['event-types'] as const;
export const EVENT_KEY = ['events'] as const;
export interface EventCreateArgs {
  title: string;
  eventTypeId: string;
  requiredMemberIds: string[];
  optionalMemberIds: string[];
  teamIds: string[];
  teamTypeId?: string;
  location?: string;
  zoomLink?: string;
  shopIds: string[];
  machineryIds: string[];
  workPackageIds: string[];
  documentIds: string[];
  questionDocument?: string;
  description?: string;
  notificationChannelIds: string[];
  initialDateScheduled: Date;
  scheduleSlots: ScheduleSlotCreateArgs[];
  mention?: SlackMentionType;
}

export interface EditEventArgs {
  title: string;
  requiredMemberIds: string[];
  optionalMemberIds: string[];
  teamIds: string[];
  teamTypeId?: string;
  status: EventStatus;
  location?: string;
  zoomLink?: string;
  shopIds: string[];
  machineryIds: string[];
  workPackageIds: string[];
  documents: Array<{ name: string; googleFileId: string }>;
  questionDocumentLink?: string;
  description?: string;
  notificationChannelIds: string[];
}

export interface EditScheduleSlotArgs {
  startTime: Date;
  endTime: Date;
  allDay: boolean;
  editAllInSeries: boolean;
}

export interface DownloadDocumentsFormInput {
  fileIds: string[];
  startDate: Date;
  endDate: Date;
  event: BaseEvent;
}

export const useAllCalendars = () =>
  useQuery<Calendar[], Error>(['calendars'], async () => {
    const res = await getAllCalendars();
    return res.data;
  });

export const useCreateCalendar = () => {
  const qc = useQueryClient();
  return useMutation<
    Calendar,
    Error,
    { name: string; description: string; colorHexCode: string; isNewMemberCalendar: boolean }
  >(
    async (payload) => {
      const { data } = await postCreateCalendar(payload);
      return data;
    },
    {
      onSuccess: () => {
        qc.invalidateQueries(['calendars']);
      }
    }
  );
};

export const useEditCalendar = (calendarId: string) => {
  const qc = useQueryClient();
  return useMutation<
    Calendar,
    Error,
    { name: string; description: string; colorHexCode: string; isNewMemberCalendar: boolean }
  >(
    async (payload) => {
      const { data } = await postEditCalendar(calendarId, payload);
      return data;
    },
    {
      onSuccess: () => {
        qc.invalidateQueries(['calendars']);
      }
    }
  );
};

export const useAllShops = () =>
  useQuery<Shop[], Error>(SHOP_KEY, async () => {
    const res = await getAllShops();
    return res.data;
  });

export const useCreateShop = () => {
  const qc = useQueryClient();
  return useMutation<Shop, Error, { name: string; description: string }>(
    async (payload) => {
      const { data } = await postCreateShop(payload);
      return data;
    },
    {
      onSuccess: () => {
        qc.invalidateQueries(SHOP_KEY);
      }
    }
  );
};

export const useEditShop = (shopId: string) => {
  const qc = useQueryClient();
  return useMutation<Shop, Error, { name: string; description: string }>(
    async (payload) => {
      const { data } = await editShop(shopId, payload);
      return data;
    },
    {
      onSuccess: () => {
        qc.invalidateQueries(SHOP_KEY);
      }
    }
  );
};

export const useAllMachines = () =>
  useQuery<Machinery[], Error>(MACHINERY_KEY, async () => {
    const res = await getAllMachinery();
    return res.data;
  });

export const useCreateMachinery = () => {
  const qc = useQueryClient();
  return useMutation<Machinery, Error, { machineName: string }>(
    async (payload) => {
      return await postCreateMachinery(payload);
    },
    {
      onSuccess: () => {
        qc.invalidateQueries(MACHINERY_KEY);
      }
    }
  );
};

export const useEditMachinery = (machineryId: string) => {
  const qc = useQueryClient();
  return useMutation<Machinery, Error, { machineName: string }>(
    async (payload) => {
      return await postEditMachinery({
        machineryId,
        name: payload.machineName
      });
    },
    {
      onSuccess: () => {
        qc.invalidateQueries(MACHINERY_KEY);
      }
    }
  );
};

export const useAddMachineryToShop = (machineryId: string) => {
  const qc = useQueryClient();
  return useMutation<Machinery, Error, { shopId: string; quantity: number; originalShopId?: string }>(
    async (payload) => {
      return await postAddMachineryToShop({
        machineryId,
        ...payload
      });
    },
    {
      onSuccess: () => {
        qc.invalidateQueries(MACHINERY_KEY);
      }
    }
  );
};

export const useDeleteShop = () => {
  const qc = useQueryClient();
  return useMutation<{ shopId: string }, Error, string>(
    async (shopId: string) => {
      const { data } = await postDeleteShop(shopId);
      return data;
    },
    {
      onSuccess: () => {
        qc.invalidateQueries(SHOP_KEY);
      }
    }
  );
};

export const useDeleteMachinery = () => {
  const qc = useQueryClient();
  return useMutation<Machinery, Error, string>(
    async (machineryId: string) => {
      return await postDeleteMachinery(machineryId);
    },
    {
      onSuccess: () => {
        qc.invalidateQueries(MACHINERY_KEY);
      }
    }
  );
};

export const useCreateEventType = () => {
  const qc = useQueryClient();
  return useMutation<EventType, Error, EventTypeCreateArgs>(
    async (payload) => {
      const { data } = await postCreateEventType(payload);
      return data;
    },
    {
      onSuccess: () => {
        qc.invalidateQueries(EVENT_TYPE_KEY);
      }
    }
  );
};

export const useEditEventType = (eventTypeId: string) => {
  const qc = useQueryClient();
  return useMutation<EventType, Error, EventTypeCreateArgs>(
    async (payload) => {
      const { data } = await postEditEventType(eventTypeId, payload);
      return data;
    },
    {
      onSuccess: () => {
        qc.invalidateQueries(EVENT_TYPE_KEY);
      }
    }
  );
};

export const useDeleteEventType = () => {
  const qc = useQueryClient();
  return useMutation<{ eventTypeId: string }, Error, string>(
    async (eventTypeId: string) => {
      const { data } = await postDeleteEventType(eventTypeId);
      return data;
    },
    {
      onSuccess: () => {
        qc.invalidateQueries(EVENT_TYPE_KEY);
      }
    }
  );
};

export const useMarkUserConfirmed = (id: string) => {
  const user = useCurrentUser();
  const queryClient = useQueryClient();
  return useMutation<void, Error, { availability: AvailabilityCreateArgs[] }>(
    ['events', 'mark-confirmed'],
    async (eventPayload: { availability: AvailabilityCreateArgs[] }) => {
      await markUserConfirmed(id, eventPayload);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(EVENT_KEY);
        queryClient.invalidateQueries(['users', user.userId, 'schedule-settings']);
        queryClient.invalidateQueries(['users', 'many-with-schedule-settings']);
        queryClient.invalidateQueries(['users']);
      }
    }
  );
};

export const useRemindUnconfirmed = (id: string) => {
  const queryClient = useQueryClient();
  return useMutation<void, Error>(
    ['events', 'remind-unconfirmed'],
    async () => {
      await remindUnconfirmed(id);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(EVENT_KEY);
      }
    }
  );
};

export const useDeleteCalendar = () => {
  const qc = useQueryClient();
  return useMutation<{ calendarId: string }, Error, string>(
    async (calendarId: string) => {
      const { data } = await postDeleteCalendar(calendarId);
      return data;
    },
    {
      onSuccess: () => {
        qc.invalidateQueries(CALENDAR_KEY);
      }
    }
  );
};

export const useSingleEvent = (id?: string) => {
  return useQuery<EventDetail, Error>(
    ['events', id],
    async () => {
      const { data } = await getSingleEvent(id!);
      return data;
    },
    { enabled: !!id }
  );
};

/**
 * The current user's events that conflict with another: their own pending or denied ones, and those waiting on their
 * approval. Kept under 'filter-events' so approving, denying, and editing events refresh it
 */
export const useMyConflicts = () => {
  return useQuery<EventConflict[], Error>(['filter-events', 'my-conflicts'], async () => {
    const { data } = await getMyConflicts();
    return data;
  });
};

/**
 * Events waiting on a conflict review, for the Review Bookings table
 *
 * @param startPeriod when given, only events happening on or after it
 */
export const useReviewEvents = (startPeriod?: Date, enabled: boolean = true) => {
  return useQuery<CalendarEvent[], Error>(
    ['filter-events', 'reviews', startPeriod?.toISOString()],
    async () => {
      const { data } = await getReviewEvents(startPeriod);
      return data;
    },
    { enabled }
  );
};

/**
 * The current user's events in the next `days` days, with only their upcoming slots
 *
 * @param includeTeamEvents whether to include events the user is only on through one of their teams
 */
export const useUpcomingEvents = (days: number, includeTeamEvents: boolean) => {
  return useQuery<UpcomingEvent[], Error>(['events', 'upcoming', days, includeTeamEvents], async () => {
    const { data } = await getUpcomingEvents(days, includeTeamEvents);
    return data;
  });
};

export const useEventAttendance = () => {
  return useQuery<UserEventAttendance[], Error>(['events', 'attendance'], async () => {
    const { data } = await getEventAttendance();
    return data;
  });
};

export const useNewMemberEvents = () => {
  return useQuery<BaseEvent[], Error>(['events', 'new-member'], async () => {
    const { data } = await getNewMemberEvents();
    return data;
  });
};

export const useFilterEvents = (filterArgs: FilterArgs, enabled: boolean = true) => {
  return useQuery<CalendarEvent[], Error>(
    ['filter-events', filterArgs],
    async () => {
      const { data } = await postFilterEvents(filterArgs);
      return data;
    },
    {
      keepPreviousData: true,
      enabled
    }
  );
};

export const useAllEventTypes = () => {
  return useQuery<EventType[], Error>(EVENT_TYPE_KEY, async () => {
    const { data } = await getAllEventTypes();
    return data;
  });
};

export const useDeleteEvent = (id: string) => {
  const queryClient = useQueryClient();
  return useMutation<void, Error>(
    ['events', 'delete'],
    async () => {
      await deleteEvent(id);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(EVENT_KEY);
        queryClient.invalidateQueries(['filter-events']);
      }
    }
  );
};

export const useSetEventStatus = (id: string) => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, { status: EventStatus }>(
    ['events', id],
    async (payload: { status: EventStatus }) => {
      await setEventStatus(id, payload);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['events', id]);
      }
    }
  );
};

export const useCreateEvent = () => {
  const qc = useQueryClient();
  return useMutation<{ eventId: string }, Error, EventCreateArgs>(
    async (payload) => {
      const { data } = await postCreateEvent(payload);
      return data;
    },
    {
      onSuccess: () => {
        qc.invalidateQueries(['filter-events']);
        qc.invalidateQueries(EVENT_KEY);
      }
    }
  );
};

export const useApproveEvent = (id: string) => {
  const queryClient = useQueryClient();
  return useMutation<void, Error>(
    ['events', id],
    async () => {
      await approveEvent(id);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['events', id]);
        queryClient.invalidateQueries(['filter-events']);
      }
    }
  );
};

export const useEditEvent = (eventId: string) => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, EditEventArgs>(
    ['events', 'edit', eventId],
    async (payload) => {
      await postEditEvent(eventId, payload);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['filter-events']);
        queryClient.invalidateQueries(EVENT_KEY);
      }
    }
  );
};

export const useEditScheduleSlot = (eventId: string, scheduleSlotId: string) => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, EditScheduleSlotArgs>(
    ['events', 'edit-schedule-slot', eventId, scheduleSlotId],
    async (payload) => {
      await postEditScheduleSlot(eventId, scheduleSlotId, payload);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['filter-events']);
        queryClient.invalidateQueries(EVENT_KEY);
        queryClient.invalidateQueries(['events', eventId]);
      }
    }
  );
};

/**
 * Hook to get a preview of other schedule slots that would be affected
 * when editing a schedule slot with "edit all in series" enabled.
 */
export const usePreviewScheduleSlotRecurringEdits = (eventId: string, scheduleSlotId: string, enabled: boolean = true) => {
  return useQuery<ScheduleSlot[], Error>(
    ['events', 'schedule-slot-recurring-edits-preview', eventId, scheduleSlotId],
    async () => {
      const { data } = await previewScheduleSlotRecurringEdits(eventId, scheduleSlotId);
      return data;
    },
    {
      enabled: enabled && !!eventId && !!scheduleSlotId
    }
  );
};

/**
 * Hook to delete a single schedule slot from an event.
 * If this is the last schedule slot, the entire event will be deleted instead.
 */
export const useDeleteScheduleSlot = (eventId: string, scheduleSlotId: string) => {
  const queryClient = useQueryClient();
  return useMutation<void, Error>(
    ['events', 'delete-schedule-slot', eventId, scheduleSlotId],
    async () => {
      await postDeleteScheduleSlot(eventId, scheduleSlotId);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['filter-events']);
        queryClient.invalidateQueries(EVENT_KEY);
        queryClient.invalidateQueries(['events', eventId]);
      }
    }
  );
};

export const useDenyEvent = (id: string) => {
  const queryClient = useQueryClient();
  return useMutation<void, Error>(
    ['events', id],
    async () => {
      await denyEvent(id);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['events', id]);
        queryClient.invalidateQueries(['filter-events']);
      }
    }
  );
};

/**
 * Hook to schedule an event by adding a schedule slot and changing status to SCHEDULED.
 * Only the event creator can schedule the event.
 */
export const useScheduleEvent = (eventId: string) => {
  const queryClient = useQueryClient();
  return useMutation<void, Error, { startTime: Date; endTime: Date }>(
    ['events', 'schedule', eventId],
    async (payload) => {
      await scheduleEvent(eventId, payload);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['events', eventId]);
        queryClient.invalidateQueries(['events', eventId, 'with-members']);
        queryClient.invalidateQueries(['filter-events']);
        queryClient.invalidateQueries(EVENT_KEY);
      }
    }
  );
};

/**
 * Custom React Hook to upload a new document.
 */
export const useUploadSingleDocument = () => {
  return useMutation<void, Error, { file: File; id: string }>(
    ['events', 'upload', 'single'],
    async (formData: { file: File; id: string }) => {
      await uploadSingleDocument(formData.file, formData.id);
    }
  );
};

/**
 * Custom hook that uploads many documents to a given event
 *
 * @returns The created document information
 */
export const useUploadManyDocuments = () => {
  return useMutation<void, Error, { files: File[]; id: string }>(
    ['events', 'upload', 'many'],
    async (formData: { files: File[]; id: string }) => {
      for (const file of formData.files) {
        await uploadSingleDocument(file, formData.id);
      }
    }
  );
};

/**
 * Custom react hook to download PDFs from google drive and combine them into a single PDF
 *
 * @param fileIds The google file ids to fetch the PDFs for
 */
export const useDownloadPDFOfDocuments = () => {
  return useMutation(['events'], async (formData: DownloadDocumentsFormInput) => {
    const promises = formData.fileIds.map((fileId) => {
      return downloadDocumentPdf(fileId);
    });

    const blobs = await Promise.all(promises);
    const pdfName = `${formData.startDate.toLocaleDateString()}-${formData.endDate.toLocaleDateString()}.pdf`;

    const pdfFileName = `documents-${formData.event.title}-${pdfName}`;

    await combinePdfsAndDownload(blobs, pdfFileName);
  });
};

/**
 * Combines multiple PDF blobs into a single PDF and downloads it
 *
 * @param blobData an array of PDF blob data
 * @param filename the name of the created PDF
 */
export const combinePdfsAndDownload = async (blobData: Blob[], filename: string) => {
  const pdfDoc = await PDFDocument.create();

  // Load and copy pages from each PDF
  for (const blob of blobData) {
    const arrayBuffer = await blob.arrayBuffer();
    const pdf = await PDFDocument.load(arrayBuffer);
    const pages = await pdfDoc.copyPages(pdf, pdf.getPageIndices());

    pages.forEach((page) => {
      pdfDoc.addPage(page);
    });
  }

  // Save and download
  const pdfBytes = await pdfDoc.save();
  const pdfBlob = new Blob([new Uint8Array(pdfBytes)], { type: 'application/pdf' });
  saveAs(pdfBlob, filename);
};

const useEventsPaginated = (direction: 'future' | 'past') => {
  return useInfiniteQuery<{ instances: GuestEventInstance[]; nextCursor: string | null }, Error>(
    ['events', direction, 'paginated'],
    async ({ pageParam }: { pageParam?: string }) => {
      const { data } = await getAllEventsPaginated(direction, pageParam);
      return data;
    },
    { getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined }
  );
};

export const useFutureEventsPaginated = () => useEventsPaginated('future');

export const usePastEventsPaginated = () => useEventsPaginated('past');

export const useGetIcsToken = () =>
  useQuery<{ icsToken: string; organizationId: string }, Error>(['icsToken'], async () => {
    const { data } = await getIcsToken();
    return data;
  });
