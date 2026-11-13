import { Shop, BaseEvent, EventConflict, GuestEventInstance, ScheduleSlot } from 'shared';
import { userTransformer } from './users.transformers';

export const shopTransformer = (shop: Shop): Shop => {
  return {
    ...shop,
    dateCreated: new Date(shop.dateCreated),
    userCreated: userTransformer(shop.userCreated)
  };
};

const scheduleSlotTransformer = <T extends ScheduleSlot>(slot: T): T => {
  return { ...slot, startTime: new Date(slot.startTime), endTime: new Date(slot.endTime) };
};

/**
 * Revives the dates on any event model (BaseEvent or one that extends it)
 */
export const baseEventTransformer = <T extends BaseEvent>(event: T): T => {
  // error responses pass through transformResponse too; leave them for axios to surface
  if (!event?.scheduledTimes) return event;
  return {
    ...event,
    dateCreated: new Date(event.dateCreated),
    initialDateScheduled: event.initialDateScheduled ? new Date(event.initialDateScheduled) : undefined,
    scheduledTimes: event.scheduledTimes.map(scheduleSlotTransformer)
  };
};

export const eventConflictTransformer = (conflict: EventConflict): EventConflict => {
  return {
    ...conflict,
    event: baseEventTransformer(conflict.event),
    conflictingEvent: baseEventTransformer(conflict.conflictingEvent),
    overlapStart: new Date(conflict.overlapStart)
  };
};

export const guestEventInstanceTransformer = (instance: GuestEventInstance): GuestEventInstance => {
  return {
    ...scheduleSlotTransformer(instance),
    dateCreated: new Date(instance.dateCreated),
    initialDateScheduled: instance.initialDateScheduled ? new Date(instance.initialDateScheduled) : undefined
  };
};
