import { Shop, Event, EventPreview } from 'shared';
import { userTransformer } from './users.transformers';

export const shopTransformer = (shop: Shop): Shop => {
  return {
    ...shop,
    dateCreated: new Date(shop.dateCreated),
    userCreated: userTransformer(shop.userCreated)
  };
};

export const eventTransformer = (event: Event): Event => {
  return {
    ...event
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
