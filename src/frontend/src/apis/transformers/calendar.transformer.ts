import { Event, Shop } from 'shared';
import { userTransformer } from './users.transformers';

export const shopTransformer = (shop: Shop): Shop => {
  return {
    ...shop,
    dateCreated: new Date(shop.dateCreated),
    userCreated: userTransformer(shop.userCreated)
  };
};

export const filterEventsTransformer = (events: Event[]): any => {
  return events.map((event) => ({
    ...event,
    dateCreated: new Date(event.dateCreated),
    scheduledTimes: event.scheduledTimes.map((schedule) => ({
      ...schedule,
      startTime: schedule.startTime ? new Date(schedule.startTime) : undefined,
      endTime: schedule.endTime ? new Date(schedule.endTime) : undefined
    }))
  }));
};
