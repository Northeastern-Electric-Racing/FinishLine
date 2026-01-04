import {
  Prisma,
  DayOfWeek as PrismaDayOfWeek,
  Event_Status as PrismaEventStatus,
  Conflict_Status as PrismaConflictStatus
} from '@prisma/client';
import {
  Machinery,
  Shop,
  ShopMachinery,
  EventType,
  Calendar,
  Event,
  ScheduleSlot,
  EventStatus,
  EventPreview,
  DayOfWeek,
  ConflictStatus,
  Document,
  EventWithMembers
} from 'shared';
import { MachineryQueryArgs, ShopMachineryQueryArgs } from '../prisma-query-args/machinery.query-args';
import { userTransformer, userWithScheduleSettingsTransformer } from './user.transformer';
import { EventTypeQueryArgs } from '../prisma-query-args/event-type.query-args';
import { CalendarQueryArgs } from '../prisma-query-args/calendar.query-args';
import { EventQueryArgs, EventWithMembersQueryArgs } from '../prisma-query-args/event.query-args';
import { ShopQueryArgs } from '../prisma-query-args/shop.query-args';

export const documentTransformer = (document: Prisma.DocumentGetPayload<null>): Document => {
  return { documentId: document.documentId, googleFileId: document.googleFileId, name: document.name };
};

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
    quantity: shopMachinery.quantity
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
  const eventTypeWithCalendars = eventType as typeof eventType & {
    calendars?: { calendarId: string }[];
  };
  return {
    eventTypeId: eventType.eventTypeId,
    name: eventType.name,
    userCreated: userTransformer(eventType.userCreated),
    dateCreated: eventType.dateCreated,
    calendarIds: eventTypeWithCalendars.calendars?.map((c: { calendarId: string }) => c.calendarId) || [],
    requiredMembers: eventType.requiredMembers,
    optionalMembers: eventType.optionalMembers,
    teams: eventType.teams,
    teamType: eventType.teamType,
    location: eventType.location,
    zoomLink: eventType.zoomLink,
    shop: eventType.shop,
    machinery: eventType.machinery,
    workPackage: eventType.workPackage,
    questionDocument: eventType.questionDocument,
    documents: eventType.documents,
    description: eventType.description,
    onlyHeadsOrAboveForEventCreation: eventType.onlyHeadsOrAboveForEventCreation,
    requiresConfirmation: eventType.requiresConfirmation,
    sendSlackNotifications: eventType.sendSlackNotifications
  } as EventType;
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
    days: scheduleTimes.days.map(dayOfWeekTransformer),
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
    teamType: event.teamType ?? undefined,
    shops: event.shops,
    machinery: event.machinery,
    workPackages: event.workPackages,
    documents: event.documents.filter((document) => !document.dateDeleted).map(documentTransformer),
    scheduledTimes: event.scheduledTimes.map(scheduleTimesTransformer),
    approved: conflictStatusTransformer(event.approved),
    approvalRequiredFrom: event.approvalRequiredBy ?? undefined,
    location: event.location ?? undefined,
    zoomLink: event.zoomLink ?? undefined,
    questionDocumentLink: event.questionDocumentLink ?? undefined,
    description: event.description ?? undefined,
    status: eventStatusTransformer(event.status)
  };
};

export const eventWithMembersTransformer = (event: Prisma.EventGetPayload<EventWithMembersQueryArgs>): EventWithMembers => {
  return {
    eventId: event.eventId,
    title: event.title,
    userCreated: userWithScheduleSettingsTransformer(event.userCreated),
    dateCreated: event.dateCreated,
    eventTypeId: event.eventTypeId,
    requiredMembers: event.requiredMembers.map(userTransformer),
    optionalMembers: event.optionalMembers.map(userTransformer),
    confirmedMembers: event.confirmedMembers.map(userWithScheduleSettingsTransformer),
    deniedMembers: event.deniedMembers.map(userTransformer),
    teams: event.teams.map((team) => ({
      ...team,
      members: team.members.map(userTransformer),
      leads: team.leads.map(userTransformer),
      head: userTransformer(team.head)
    })),
    teamType: event.teamType
      ? {
          teamTypeId: event.teamType.teamTypeId,
          name: event.teamType.name,
          teams: event.teamType.teams.map((team) => ({
            members: team.members.map(userTransformer),
            leads: team.leads.map(userTransformer),
            head: userTransformer(team.head)
          }))
        }
      : undefined,
    shops: event.shops,
    machinery: event.machinery,
    workPackages: event.workPackages,
    documents: event.documents.filter((document) => !document.dateDeleted).map(documentTransformer),
    scheduledTimes: event.scheduledTimes.map(scheduleTimesTransformer),
    approved: conflictStatusTransformer(event.approved),
    approvalRequiredFrom: event.approvalRequiredBy ?? undefined,
    location: event.location ?? undefined,
    zoomLink: event.zoomLink ?? undefined,
    questionDocumentLink: event.questionDocumentLink ?? undefined,
    description: event.description ?? undefined,
    status: eventStatusTransformer(event.status)
  };
};

export const eventPreviewTransformer = (event: Prisma.EventGetPayload<EventQueryArgs>, wbsName: string): EventPreview => {
  // Get the earliest scheduled date from scheduledTimes
  const dateScheduled = event.scheduledTimes.length > 0 ? event.scheduledTimes[0].initialDateScheduled : new Date();

  return {
    eventId: event.eventId,
    title: event.title,
    dateScheduled,
    status: event.status as EventStatus,
    userCreated: userTransformer(event.userCreated),
    wbsName
  };
};

export const dayOfWeekTransformer = (day: PrismaDayOfWeek): DayOfWeek => {
  const mapping: Record<PrismaDayOfWeek, DayOfWeek> = {
    MONDAY: DayOfWeek.MONDAY,
    TUESDAY: DayOfWeek.TUESDAY,
    WEDNESDAY: DayOfWeek.WEDNESDAY,
    THURSDAY: DayOfWeek.THURSDAY,
    FRIDAY: DayOfWeek.FRIDAY,
    SATURDAY: DayOfWeek.SATURDAY,
    SUNDAY: DayOfWeek.SUNDAY
  };
  return mapping[day];
};

export const conflictStatusTransformer = (day: PrismaConflictStatus): ConflictStatus => {
  const mapping: Record<PrismaConflictStatus, ConflictStatus> = {
    APPROVED: ConflictStatus.APPROVED,
    PENDING: ConflictStatus.PENDING,
    DENIED: ConflictStatus.DENIED,
    NO_CONFLICT: ConflictStatus.NO_CONFLICT
  };
  return mapping[day];
};

export const eventStatusTransformer = (status: PrismaEventStatus): EventStatus => {
  const mapping: Record<PrismaEventStatus, EventStatus> = {
    UNCONFIRMED: EventStatus.UNCONFIRMED,
    CONFIRMED: EventStatus.CONFIRMED,
    SCHEDULED: EventStatus.SCHEDULED,
    DONE: EventStatus.DONE
  };
  return mapping[status];
};
