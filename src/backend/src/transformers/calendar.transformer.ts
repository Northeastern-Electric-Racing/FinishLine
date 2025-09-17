import { Prisma } from '@prisma/client';
import { EventType } from 'shared';
import { Shop } from 'shared';
import { ShopQueryArgs } from '../prisma-query-args/shop.query-args';
import { EventTypeQueryArgs } from '../prisma-query-args/event-type.query-args';
import { userTransformer } from './user.transformer';

export const eventTypeTransformer = (eventType: Prisma.EventTypeGetPayload<EventTypeQueryArgs>): EventType => {
  return {
    eventTypeId: eventType.eventTypeId,
    name: eventType.name,
    userCreated: userTransformer(eventType.userCreated),
    dateCreated: eventType.dateCreated,
    initialDateScheduled: eventType.initialDateScheduled,
    allDay: eventType.allDay,
    recurring: eventType.recurring,
    members: eventType.members,
    location: eventType.location,
    zoomLink: eventType.zoomLink,
    availability: eventType.availabilities,
    shop: eventType.shop,
    machinery: eventType.machinery,
    workPackage: eventType.workPackage,
    questionDocument: eventType.questionDocument,
    documents: eventType.documents,
    description: eventType.description
  };
};
export const shopTransformer = (shop: Prisma.ShopGetPayload<ShopQueryArgs>): Shop => {
  return {
    shopId: shop.shopId,
    name: shop.name,
    description: shop.description ?? '',
    userCreated: userTransformer(shop.userCreated),
    dateCreated: shop.dateCreated
  };
};
