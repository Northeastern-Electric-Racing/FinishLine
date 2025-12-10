import { useMutation, useQuery, useQueryClient } from 'react-query';
import {
  Shop,
  Machinery,
  Calendar,
  AvailabilityCreateArgs,
  Event,
  EventStatus,
  ScheduleSlotCreateArgs,
  EventType
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
  markUserConfirmed,
  getSingleEvent,
  getAllEvents,
  deleteEvent,
  setEventStatus,
  postCreateEvent,
  getAllEventTypes,
  uploadSingleDocument,
  downloadDocumentPdf
} from '../apis/calendar.api';
import { useCurrentUser } from './users.hooks';
import { PDFDocument } from 'pdf-lib';
import saveAs from 'file-saver';

export const MACHINERY_KEY = ['machinery'] as const;
const SHOP_KEY = ['shops'] as const;
const CALENDAR_KEY = ['calendars'] as const;

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
  scheduleSlot: ScheduleSlotCreateArgs[];
}

export interface DownloadDocumentsFormInput {
  fileIds: string[];
  startDate: Date;
  endDate: Date;
  event: Event;
}

export const useAllCalendars = () =>
  useQuery<Calendar[], Error>(['calendars'], async () => {
    const res = await getAllCalendars();
    return res.data;
  });

export const useCreateCalendar = () => {
  const qc = useQueryClient();
  return useMutation<Calendar, Error, { name: string; description: string; colorHexCode: string }>(
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
  return useMutation<Calendar, Error, { name: string; description: string; colorHexCode: string }>(
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

export const useMarkUserConfirmed = (id: string) => {
  const user = useCurrentUser();
  const queryClient = useQueryClient();
  return useMutation<Event, Error, { availability: AvailabilityCreateArgs[] }>(
    ['events', 'mark-confirmed'],
    async (eventPayload: { availability: AvailabilityCreateArgs[] }) => {
      const { data } = await markUserConfirmed(id, eventPayload);
      return data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['events']);
        queryClient.invalidateQueries(['users', user.userId, 'schedule-settings']);
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
  return useQuery<Event, Error>(
    ['events', id],
    async () => {
      const { data } = await getSingleEvent(id!);
      return data;
    },
    { enabled: !!id }
  );
};

export const useAllEvents = () => {
  return useQuery<Event[], Error>(['events'], async () => {
    const { data } = await getAllEvents();
    return data;
  });
};

export const useAllEventTypes = () => {
  return useQuery<EventType[], Error>(['eventTypes'], async () => {
    const { data } = await getAllEventTypes();
    return data;
  });
};

export const useDeleteEvent = (id: string) => {
  const queryClient = useQueryClient();
  return useMutation<Event, Error>(
    ['events', 'delete'],
    async () => {
      const { data } = await deleteEvent(id);
      return data;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['events']);
      }
    }
  );
};

export const useSetEventStatus = (id: string) => {
  const queryClient = useQueryClient();
  return useMutation<Event, Error, { status: EventStatus }>(
    ['events', id],
    async (payload: { status: EventStatus }) => {
      const { data } = await setEventStatus(id, payload);
      return data;
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
  return useMutation<Event, Error, EventCreateArgs>(
    async (payload) => {
      const { data } = await postCreateEvent(payload);
      return data;
    },
    {
      onSuccess: () => {
        qc.invalidateQueries('events');
      }
    }
  );
};

/**
 * Custom React Hook to upload a new document.
 */
export const useUploadSingleDocument = () => {
  return useMutation<{ googleFileId: string; name: string }, Error, { file: File; id: string }>(
    ['events', 'upload', 'single'],
    async (formData: { file: File; id: string }) => {
      const { data } = await uploadSingleDocument(formData.file, formData.id);
      return data;
    }
  );
};

/**
 * Custom hook that uploads many documents to a given event
 *
 * @returns The created document information
 */
export const useUploadManyDocuments = () => {
  return useMutation<{ googleFileId: string; name: string }[], Error, { files: File[]; id: string }>(
    ['events', 'upload', 'many'],
    async (formData: { files: File[]; id: string }) => {
      const results = [];
      for (const file of formData.files) {
        results.push(await uploadSingleDocument(file, formData.id));
      }
      return results.map((result) => result.data);
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
