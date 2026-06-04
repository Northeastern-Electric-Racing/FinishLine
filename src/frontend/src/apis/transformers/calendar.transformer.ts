import { Shop, Event, EventPreview, EventWithMembers } from 'shared';
import { userTransformer } from './users.transformers';

export const shopTransformer = (shop: Shop): Shop => {
  return {
    ...shop,
    dateCreated: new Date(shop.dateCreated),
    userCreated: userTransformer(shop.userCreated)
  };
};

export const filterEventTransformer = (event: Event): Event => {
  // Guard against error responses being passed through transformResponse
  if (!event || !event.scheduledTimes) {
    return event;
  }
  return {
    ...event,
    initialDateScheduled: event.initialDateScheduled ? new Date(event.initialDateScheduled) : undefined,
    dateCreated: new Date(event.dateCreated),
    previousDate: event.previousDate ? new Date(event.previousDate) : undefined,
    scheduledTimes: event.scheduledTimes.map((schedule) => ({
      ...schedule,
      startTime: new Date(schedule.startTime),
      endTime: new Date(schedule.endTime)
    }))
  };
};

export const eventTransformer = (event: Event): Event => {
  // Guard against error responses being passed through transformResponse
  if (!event || !event.scheduledTimes) {
    return event;
  }
  return {
    ...event,
    dateCreated: new Date(event.dateCreated),
    initialDateScheduled: event.initialDateScheduled ? new Date(event.initialDateScheduled) : undefined,
    previousDate: event.previousDate ? new Date(event.previousDate) : undefined,
    scheduledTimes: event.scheduledTimes.map((slot: any) => ({
      ...slot,
      startTime: new Date(slot.startTime),
      endTime: new Date(slot.endTime)
    }))
  };
};

export const eventWithMembersTransformer = (event: EventWithMembers): EventWithMembers => {
  // Guard against error responses being passed through transformResponse
  if (!event || !event.scheduledTimes) {
    return event;
  }
  return {
    ...event,
    dateCreated: new Date(event.dateCreated),
    initialDateScheduled: event.initialDateScheduled ? new Date(event.initialDateScheduled) : undefined,
    previousDate: event.previousDate ? new Date(event.previousDate) : undefined,
    scheduledTimes: event.scheduledTimes.map((slot: any) => ({
      ...slot,
      startTime: new Date(slot.startTime),
      endTime: new Date(slot.endTime)
    }))
  };
};

export const eventPreviewTransformer = (event: EventPreview): EventPreview => {
  return {
    eventId: event.eventId,
    title: event.title,
    dateScheduled: new Date(event.dateScheduled),
    status: event.status,
    userCreated: userTransformer(event.userCreated),
    wbsName: event.wbsName
  };
};
