import axios from '../utils/axios';
import { apiUrls } from '../utils/urls';
import {
  Shop,
  Machinery,
  EventType,
  AvailabilityCreateArgs,
  dateToMidnightUTC,
  BaseEvent,
  CalendarEvent,
  EventDetail,
  UpcomingEvent,
  EventConflict,
  GuestEventInstance,
  UserEventAttendance,
  EventStatus,
  EventTypeCreateArgs,
  Calendar,
  FilterArgs,
  ScheduleSlot
} from 'shared';
import {
  baseEventTransformer,
  eventConflictTransformer,
  guestEventInstanceTransformer
} from './transformers/calendar.transformer';
import { EditEventArgs, EditScheduleSlotArgs, EventCreateArgs } from '../hooks/calendar.hooks';

// error responses pass through transformResponse too, so only map when the body is the expected list
const parseList =
  <T>(transform: (item: T) => T) =>
  (data: string) => {
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed.map(transform) : parsed;
  };

export const getAllCalendars = () => {
  return axios.get<Calendar[]>(apiUrls.calendarCalendars(), {
    transformResponse: (data) => JSON.parse(data) as Calendar[]
  });
};

export const postCreateCalendar = (payload: {
  name: string;
  description: string;
  colorHexCode: string;
  isNewMemberCalendar: boolean;
}) => {
  return axios.post<Calendar>(apiUrls.calendarCreateCalendar(), payload, {
    transformResponse: (data) => JSON.parse(data) as Calendar
  });
};

export const postEditCalendar = (
  calendarId: string,
  payload: { name: string; description: string; colorHexCode: string; isNewMemberCalendar: boolean }
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
  return axios.post<CalendarEvent[]>(apiUrls.calendarFilterEvents(), payload, {
    transformResponse: parseList<CalendarEvent>(baseEventTransformer)
  });
};

export const getReviewEvents = (startPeriod?: Date) => {
  return axios.get<CalendarEvent[]>(apiUrls.calendarReviewEvents(), {
    params: { startPeriod },
    transformResponse: parseList<CalendarEvent>(baseEventTransformer)
  });
};

export const getUpcomingEvents = (days: number, includeTeamEvents: boolean) => {
  return axios.get<UpcomingEvent[]>(apiUrls.calendarUpcomingEvents(), {
    params: { days, includeTeamEvents },
    transformResponse: parseList<UpcomingEvent>(baseEventTransformer)
  });
};

export const getMyConflicts = () => {
  return axios.get<EventConflict[]>(apiUrls.calendarMyConflicts(), {
    transformResponse: parseList(eventConflictTransformer)
  });
};

export const getEventAttendance = () => {
  return axios.get<UserEventAttendance[]>(apiUrls.calendarEventAttendance());
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
  return axios.post(apiUrls.calendarEventMarkUserConfirmed(id), {
    availability: payload.availability.map((a) => ({ ...a, dateSet: dateToMidnightUTC(a.dateSet) }))
  });
};

export const remindUnconfirmed = async (id: string) => {
  return axios.post(apiUrls.calendarEventRemindUnconfirmed(id));
};

export const getSingleEvent = async (id: string) => {
  return axios.get<EventDetail>(apiUrls.calendarGetSingleEvent(id), {
    transformResponse: (data) => baseEventTransformer(JSON.parse(data))
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

export const getNewMemberEvents = () => {
  return axios.get<BaseEvent[]>(apiUrls.calendarNewMemberEvents(), {
    transformResponse: parseList<BaseEvent>(baseEventTransformer)
  });
};

export const getAllEventTypes = () => {
  return axios.get<EventType[]>(apiUrls.calendarEventTypes(), {
    transformResponse: (data) => JSON.parse(data) as EventType[]
  });
};

export const deleteEvent = async (id: string) => {
  return axios.post(apiUrls.calendarDeleteEvent(id));
};

export const setEventStatus = async (id: string, payload: { status: EventStatus }) => {
  return axios.post(apiUrls.calendarEventSetStatus(id), payload);
};

export const approveEvent = async (id: string) => {
  return axios.post(apiUrls.calendarApproveEvent(id));
};

export const denyEvent = async (id: string) => {
  return axios.post(apiUrls.calendarDenyEvent(id));
};

export const postDeleteCalendar = async (id: string) => {
  return axios.post<Calendar>(apiUrls.calendarDeleteCalendar(id));
};

export const postCreateEvent = async (payload: EventCreateArgs) => {
  return axios.post<{ eventId: string }>(apiUrls.calendarCreateEvent(), payload);
};

export const postEditEvent = async (eventId: string, payload: EditEventArgs) => {
  return axios.post(apiUrls.calendarEditEvent(eventId), payload);
};

export const postEditScheduleSlot = async (eventId: string, scheduleSlotId: string, payload: EditScheduleSlotArgs) => {
  return axios.post(apiUrls.calendarEditScheduleSlot(eventId, scheduleSlotId), payload);
};

export const previewScheduleSlotRecurringEdits = async (eventId: string, scheduleSlotId: string) => {
  return axios.get<ScheduleSlot[]>(apiUrls.calendarPreviewScheduleSlotRecurringEdits(eventId, scheduleSlotId), {
    transformResponse: (data) =>
      JSON.parse(data).map((slot: { scheduleSlotId: string; startTime: string; endTime: string; allDay: boolean }) => ({
        ...slot,
        startTime: new Date(slot.startTime),
        endTime: new Date(slot.endTime)
      }))
  });
};

export const postDeleteScheduleSlot = async (eventId: string, scheduleSlotId: string) => {
  return axios.post(apiUrls.calendarDeleteScheduleSlot(eventId, scheduleSlotId));
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

/**
 * Schedules an event by adding a schedule slot and changing status to SCHEDULED
 *
 * @param eventId The id of the event to schedule
 * @param payload The start and end times for the new schedule slot
 */
export const scheduleEvent = async (eventId: string, payload: { startTime: Date; endTime: Date }) => {
  return axios.post(apiUrls.calendarScheduleEvent(eventId), payload);
};

export const getAllEventsPaginated = (direction: 'future' | 'past', cursor?: string) => {
  return axios.post<{ instances: GuestEventInstance[]; nextCursor: string | null }>(
    apiUrls.calendarEventsPaginated(),
    { direction, cursor },
    {
      transformResponse: (data) => {
        const parsed = JSON.parse(data);
        if (!Array.isArray(parsed.instances)) return parsed;
        return { instances: parsed.instances.map(guestEventInstanceTransformer), nextCursor: parsed.nextCursor };
      }
    }
  );
};

export const getIcsToken = () => {
  return axios.get<{ icsToken: string; organizationId: string }>(apiUrls.calendarIcsToken(), {
    transformResponse: (data) => JSON.parse(data)
  });
};
