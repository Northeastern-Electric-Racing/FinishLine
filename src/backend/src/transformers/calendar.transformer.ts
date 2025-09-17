import { Prisma } from '@prisma/client';
import { Machinery, Shop, ShopMachinery } from 'shared';
import { MachineryQueryArgs, ShopQueryArgs, ShopMachineryQueryArgs } from '../prisma-query-args/machinery.query-args';
import { userTransformer } from './user.transformer';
import { EventType } from 'shared';
import { EventTypeQueryArgs } from '../prisma-query-args/event-type.query-args';

export const shopTransformer = (shop: Prisma.ShopGetPayload<ShopQueryArgs>): Shop => {
  return {
    shopId: shop.shopId,
    name: shop.name,
    description: shop.description,
    dateCreated: shop.dateCreated,
    userCreated: userTransformer(shop.userCreated)
  };
};

export const shopMachineryTransformer = (
  shopMachinery: Prisma.ShopMachineryGetPayload<ShopMachineryQueryArgs>
): ShopMachinery => {
  return {
    shopMachineryId: shopMachinery.shopMachineryId,
    shop: shopTransformer(shopMachinery.shop),
    quantity: shopMachinery.quantity,
    description: shopMachinery.description ?? undefined
  };
};

export const machineryTransformer = (machinery: Prisma.MachineryGetPayload<MachineryQueryArgs>): Machinery => {
  return {
    machineryId: machinery.machineryId,
    name: machinery.name,
    shops: machinery.shops.map(shopMachineryTransformer),
    dateCreated: machinery.dateCreated,
    userCreated: userTransformer(machinery.userCreated)
  };
};

export const eventTypeTransformer = (eventType: Prisma.EventTypeGetPayload<EventTypeQueryArgs>): EventType => {
  return {
    eventTypeId: eventType.eventTypeId,
    name: eventType.name,
    userCreated: userTransformer(eventType.userCreated),
    dateCreated: eventType.dateCreated,
    initialDateScheduled: eventType.initialDateScheduled ?? false,
    allDay: eventType.allDay ?? false,
    recurring: eventType.recurring ?? false,
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
