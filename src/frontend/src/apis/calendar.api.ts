import axios from '../utils/axios';
import { apiUrls } from '../utils/urls';
import {
  Shop,
  Machinery,
  EventType,
  AvailabilityCreateArgs,
  Event,
  EventStatus,
  EventTypeCreateArgs,
  Calendar,
  FilterArgs
} from 'shared';
import { eventTransformer } from './transformers/calendar.transformer';
import { EditEventArgs, EventCreateArgs } from '../hooks/calendar.hooks';

export const getAllCalendars = () => {
  return axios.get<Calendar[]>(apiUrls.calendarCalendars(), {
    transformResponse: (data) => JSON.parse(data) as Calendar[]
  });
};

export const postCreateCalendar = (payload: { name: string; description: string; colorHexCode: string }) => {
  return axios.post<Calendar>(apiUrls.calendarCreateCalendar(), payload, {
    transformResponse: (data) => JSON.parse(data) as Calendar
  });
};

export const postEditCalendar = (
  calendarId: string,
  payload: { name: string; description: string; colorHexCode: string }
) => {
  return axios.post<Calendar>(apiUrls.calendarEditCalendar(calendarId), payload, {
    transformResponse: (data) => JSON.parse(data) as Calendar
  });
};

export const getAllShops = () => {
  return axios.get<Shop[]>(apiUrls.calendarShops(), {
    transformResponse: (data) => JSON.parse(data) as Shop[]
  });
};

export const postCreateShop = (payload: { name: string; description: string }) => {
  return axios.post<Shop>(apiUrls.calendarCreateShop(), payload, {
    transformResponse: (data) => JSON.parse(data) as Shop
  });
};

export const postFilterEvents = (payload: FilterArgs) => {
  return axios.post<Event[]>(apiUrls.calendarFilterEvents(), payload, {
    transformResponse: (data) => JSON.parse(data).map(eventTransformer)
  });
};

export const postDeleteShop = async (id: string) => {
  return axios.post<Shop>(apiUrls.calendarDeleteShop(id));
};

export const getAllMachinery = () => {
  return axios.get<Machinery[]>(apiUrls.calendarMachinery(), {
    transformResponse: (data) => JSON.parse(data) as Machinery[]
  });
};

export const postCreateMachinery = async (payload: { machineName: string }) => {
  const { data } = await axios.post<Machinery>(
    apiUrls.calendarCreateMachinery(),
    { name: payload.machineName },
    {
      transformResponse: (data) => JSON.parse(data) as Machinery
    }
  );
  return data;
};

export const postEditMachinery = async (payload: { machineryId: string; name: string }) => {
  const { machineryId, name } = payload;
  const { data } = await axios.post<Machinery>(
    apiUrls.calendarEditMachinery(machineryId),
    { name },
    {
      transformResponse: (data) => JSON.parse(data) as Machinery
    }
  );
  return data;
};

export const postDeleteMachinery = async (machineryId: string) => {
  const { data } = await axios.post<Machinery>(
    apiUrls.calendarDeleteMachinery(machineryId),
    {},
    {
      transformResponse: (data) => JSON.parse(data) as Machinery
    }
  );
  return data;
};

export const postAddMachineryToShop = async (payload: {
  machineryId: string;
  shopId: string;
  quantity: number;
  originalShopId?: string;
}) => {
  const { machineryId, ...body } = payload;
  const { data } = await axios.post<Machinery>(apiUrls.calendarAddMachineryToShop(machineryId), body, {
    transformResponse: (data) => JSON.parse(data) as Machinery
  });
  return data;
};

export const editShop = (shopId: string, payload: { name: string; description: string }) => {
  return axios.post<Shop>(apiUrls.calendarEditShop(shopId), payload, {
    transformResponse: (data) => JSON.parse(data) as Shop
  });
};

export const markUserConfirmed = async (id: string, payload: { availability: AvailabilityCreateArgs[] }) => {
  return axios.post<Event>(apiUrls.calendarEventMarkUserConfirmed(id), payload);
};

export const getSingleEvent = async (id: string) => {
  return axios.get(apiUrls.calendarGetSingleEvent(id), {
    transformResponse: (data) => eventTransformer(JSON.parse(data))
  });
};

export const getSingleEventWithMembers = async (id: string) => {
  return axios.get(apiUrls.calendarGetSingleEventWithMembers(id), {
    transformResponse: (data) => eventTransformer(JSON.parse(data))
  });
};

export const getConflictingEvent = async (id: string) => {
  return axios.get(apiUrls.calendarGetConflictingEvent(id), {
    transformResponse: (data) => eventTransformer(JSON.parse(data))
  });
};

export const postCreateEventType = (payload: EventTypeCreateArgs) => {
  return axios.post<EventType>(apiUrls.calendarCreateEventType(), payload, {
    transformResponse: (data) => JSON.parse(data) as EventType
  });
};

export const postEditEventType = (eventTypeId: string, payload: EventTypeCreateArgs) => {
  return axios.post<EventType>(apiUrls.calendarEditEventType(eventTypeId), payload, {
    transformResponse: (data) => JSON.parse(data) as EventType
  });
};

export const postDeleteEventType = async (eventTypeId: string) => {
  return axios.post<EventType>(apiUrls.calendarDeleteEventType(eventTypeId));
};

export const getAllEvents = () => {
  return axios.get(apiUrls.calendarEvents(), {
    transformResponse: (data) => JSON.parse(data).map(eventTransformer)
  });
};

export const getAllEventTypes = () => {
  return axios.get(apiUrls.calendarEventTypes(), {
    transformResponse: (data) => JSON.parse(data).map(eventTransformer)
  });
};

export const deleteEvent = async (id: string) => {
  return axios.post(apiUrls.calendarDeleteEvent(id));
};

export const setEventStatus = async (id: string, payload: { status: EventStatus }) => {
  return axios.post<Event>(apiUrls.calendarEventSetStatus(id), payload, {
    transformResponse: (data) => eventTransformer(JSON.parse(data))
  });
};

export const approveEvent = async (id: string) => {
  return axios.post<Event>(apiUrls.calendarApproveEvent(id));
};

export const denyEvent = async (id: string) => {
  return axios.post<Event>(apiUrls.calendarDenyEvent(id));
};

export const postDeleteCalendar = async (id: string) => {
  return axios.post<Calendar>(apiUrls.calendarDeleteCalendar(id));
};

export const postCreateEvent = async (payload: EventCreateArgs) => {
  return axios.post<Event>(apiUrls.calendarCreateEvent(), payload, {
    transformResponse: (data) => eventTransformer(JSON.parse(data))
  });
};

export const postEditEvent = async (eventId: string, payload: EditEventArgs) => {
  return axios.post<Event>(apiUrls.calendarEditEvent(eventId), payload, {
    transformResponse: (data) => eventTransformer(JSON.parse(data))
  });
};

export const postEditScheduleSlot = async (
  eventId: string,
  scheduleSlotId: string,
  payload: { startTime?: Date; endTime?: Date; allDay: boolean }
) => {
  return axios.post<Event>(apiUrls.calendarEditScheduleSlot(eventId, scheduleSlotId), payload, {
    transformResponse: (data) => eventTransformer(JSON.parse(data))
  });
};

/**
 * Upload a document
 *
 * @param payload Payload containing the document data
 */
export const uploadSingleDocument = (file: File, id: string) => {
  const formData = new FormData();
  formData.append('pdf', file);
  return axios.post(apiUrls.calendarUploadDocument(id), formData);
};

/**
 * Downloads a PDF file from google drive
 *
 * @param fileId the google id of the file to download
 * @returns the downloaded file as a Blob
 */
export const downloadDocumentPdf = async (fileId: string): Promise<Blob> => {
  const response = await axios.get(apiUrls.calendarPDFById(fileId), {
    responseType: 'blob' // Simply use 'blob' for PDF downloads
  });
  return response.data; // response.data is already a Blob
};
