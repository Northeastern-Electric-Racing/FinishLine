import { Prisma } from '@prisma/client';
import { Machinery, Shop, ShopMachinery, EventType, Calendar, Event, ScheduleSlot, DayOfWeek, EventStatus } from 'shared';
import { MachineryQueryArgs, ShopMachineryQueryArgs } from '../prisma-query-args/machinery.query-args';
import { userTransformer, userWithScheduleSettingsTransformer } from './user.transformer';
import { EventTypeQueryArgs } from '../prisma-query-args/event-type.query-args';
import { CalendarQueryArgs } from '../prisma-query-args/calendar.query-args';
import { EventQueryArgs } from '../prisma-query-args/event.query-args';
import { ShopQueryArgs } from '../prisma-query-args/shop.query-args';

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
  shopMachinery: Prisma.Shop_MachineryGetPayload<ShopMachineryQueryArgs>
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

export const eventTypeTransformer = (eventType: Prisma.Event_TypeGetPayload<EventTypeQueryArgs>): EventType => {
  return {
    eventTypeId: eventType.eventTypeId,
    name: eventType.name,
    userCreated: userTransformer(eventType.userCreated),
    dateCreated: eventType.dateCreated,
    calendarIds: eventType.calendars?.map((c) => c.calendarId) || [],
    initialDateScheduled: eventType.initialDateScheduled,
    allDay: eventType.allDay,
    recurring: eventType.recurring,
    requiredMembers: eventType.requiredMembers,
    optionalMembers: eventType.optionalMembers,
    teams: eventType.teams,
    location: eventType.location,
    zoomLink: eventType.zoomLink,
    shop: eventType.shop,
    machinery: eventType.machinery,
    workPackage: eventType.workPackage,
    questionDocument: eventType.questionDocument,
    documents: eventType.documents,
    description: eventType.description,
    onlyHeadsOrAboveForEventCreation: eventType.onlyHeadsOrAboveForEventCreation
  };
};

export const calendarTransformer = (calendar: Prisma.CalendarGetPayload<CalendarQueryArgs>): Calendar => {
  return {
    calendarId: calendar.calendarId,
    name: calendar.name,
    description: calendar.description,
    color: calendar.colorHexCode,
    userCreated: userTransformer(calendar.userCreated),
    dateCreated: calendar.dateCreated,
    eventTypes: calendar.eventTypes.map(eventTypeTransformer)
  };
};

export const scheduleTimesTransformer = (scheduleTimes: Prisma.Schedule_SlotGetPayload<null>): ScheduleSlot => {
  return {
    scheduleSlotId: scheduleTimes.scheduleSlotId,
    days: scheduleTimes.days.map((d) => d as DayOfWeek),
    startTime: scheduleTimes.startTime ?? undefined,
    endTime: scheduleTimes.endTime ?? undefined,
    recurrenceNumber: scheduleTimes.recurrenceNumber,
    initialDateScheduled: scheduleTimes.initialDateScheduled,
    endDate: scheduleTimes.endDate,
    allDay: scheduleTimes.allDay
  };
};

export const eventTransformer = (event: Prisma.EventGetPayload<EventQueryArgs>): Event => {
  return {
    eventId: event.eventId,
    title: event.title,
    userCreated: userTransformer(event.userCreated),
    dateCreated: event.dateCreated,
    eventTypeId: event.eventTypeId,
    requiredMembers: event.requiredMembers.map(userTransformer),
    optionalMembers: event.optionalMembers.map(userTransformer),
    confirmedMembers: event.confirmedMembers.map(userWithScheduleSettingsTransformer),
    deniedMembers: event.deniedMembers.map(userTransformer),
    teams: event.teams,
    shops: event.shops,
    machinery: event.machinery,
    workPackages: event.workPackages,
    documentIds: event.documentIds,
    scheduledTimes: event.scheduledTimes.map(scheduleTimesTransformer),
    approved: event.approved,
    approvalRequiredFrom: event.approvalRequiredBy ?? undefined,
    location: event.location ?? undefined,
    zoomLink: event.zoomLink ?? undefined,
    questionDocument: event.questionDocument ?? undefined,
    description: event.description ?? undefined,
    status: event.status as EventStatus
  };
};
