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
  return {
    ...event,
    dateCreated: new Date(event.dateCreated),
    scheduledTimes: event.scheduledTimes.map((schedule) => ({
      ...schedule,
      startTime: schedule.startTime ? new Date(schedule.startTime) : undefined,
      endTime: schedule.endTime ? new Date(schedule.endTime) : undefined
    }))
  };
};

export const eventTransformer = (event: Event): Event => {
  return {
    ...event
  };
};

export const eventWithMembersTransformer = (event: EventWithMembers): EventWithMembers => {
  return {
    ...event,
    dateCreated: new Date(event.dateCreated),
    scheduledTimes: event.scheduledTimes.map((slot: any) => ({
      ...slot,
      startTime: slot.startTime ? new Date(slot.startTime) : undefined,
      endTime: slot.endTime ? new Date(slot.endTime) : undefined,
      initialDateScheduled: new Date(slot.initialDateScheduled),
      endDate: new Date(slot.endDate)
    }))
  };
};

export const eventPreviewTransformer = (event: EventPreview): EventPreview => {
  return {
    eventId: event.eventId,
    title: event.title,
    dateScheduled: event.dateScheduled,
    status: event.status,
    userCreated: userTransformer(event.userCreated),
    wbsName: event.wbsName
  };
};
