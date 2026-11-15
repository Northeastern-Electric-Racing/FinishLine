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
  BaseEvent,
  CalendarEvent,
  EventDetail,
  UpcomingEvent,
  GuestEventInstance,
  ScheduleSlot,
  ShopPreview,
  MachineryPreview,
  TeamCalendarPreview,
  WorkPackageCalendarPreview,
  EventStatus,
  DayOfWeek,
  ConflictStatus,
  Document
} from 'shared';
import { CalendarQueryArgs } from '../prisma-query-args/calendar.query-args.js';
import { EventTypeQueryArgs } from '../prisma-query-args/event-type.query-args.js';
import {
  BaseEventQueryArgs,
  CalendarEventQueryArgs,
  eventWorkPackageSelect
} from '../prisma-query-args/event.query-args.js';
import { BaseUserQueryArgs } from '../prisma-query-args/user.query-args.js';
import { IcsEvent } from '../utils/ics.utils.js';
import { ShopMachineryQueryArgs, MachineryQueryArgs } from '../prisma-query-args/machinery.query-args.js';
import { ShopQueryArgs } from '../prisma-query-args/shop.query-args.js';
import { baseUserTransformer, userTransformer } from './user.transformer.js';

export const documentTransformer = (
  document: Pick<Prisma.DocumentGetPayload<null>, 'documentId' | 'googleFileId' | 'name'>
): Document => {
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
    sendSlackNotifications: eventType.sendSlackNotifications,
    takeAttendance: eventType.takeAttendance
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
    eventTypes: calendar.eventTypes.map(eventTypeTransformer),
    isNewMemberCalendar: calendar.isNewMemberCalendar
  };
};

export const scheduleTimesTransformer = (
  scheduleTimes: Pick<Prisma.Schedule_SlotGetPayload<null>, 'scheduleSlotId' | 'startTime' | 'endTime' | 'allDay'>
): ScheduleSlot => {
  return {
    scheduleSlotId: scheduleTimes.scheduleSlotId,
    startTime: scheduleTimes.startTime ?? undefined,
    endTime: scheduleTimes.endTime ?? undefined,
    allDay: scheduleTimes.allDay
  };
};

type BaseUserPayload = Prisma.UserGetPayload<BaseUserQueryArgs>;
type BaseEventPayload = Prisma.EventGetPayload<BaseEventQueryArgs>;
type EventWorkPackagePayload = Prisma.Work_PackageGetPayload<typeof eventWorkPackageSelect>;
type EventTeamPayload = { teamId: string; teamName: string };

// every BaseEvent field except its slots, so slot-based models (one row per slot) can reuse it
const baseEventFieldsTransformer = (event: Omit<BaseEventPayload, 'scheduledTimes'>): Omit<BaseEvent, 'scheduledTimes'> => {
  return {
    eventId: event.eventId,
    title: event.title,
    eventTypeId: event.eventTypeId,
    status: eventStatusTransformer(event.status),
    approved: conflictStatusTransformer(event.approved),
    location: event.location ?? undefined,
    zoomLink: event.zoomLink ?? undefined,
    description: event.description ?? undefined,
    questionDocumentLink: event.questionDocumentLink ?? undefined,
    initialDateScheduled: event.initialDateScheduled ?? undefined,
    dateCreated: event.dateCreated,
    notificationChannelIds: event.notificationChannelIds,
    userCreated: baseUserTransformer(event.userCreated),
    teamType: event.teamType ?? undefined
  };
};

export const baseEventTransformer = (event: BaseEventPayload): BaseEvent => {
  return {
    ...baseEventFieldsTransformer(event),
    scheduledTimes: event.scheduledTimes.map(scheduleTimesTransformer)
  };
};

export const calendarEventTransformer = (event: Prisma.EventGetPayload<CalendarEventQueryArgs>): CalendarEvent => {
  const [firstRequiredMember] = event.requiredMembers;
  return {
    ...baseEventTransformer(event),
    approvalRequiredFrom: event.approvalRequiredBy ? baseUserTransformer(event.approvalRequiredBy) : undefined,
    firstRequiredMember: firstRequiredMember ? baseUserTransformer(firstRequiredMember) : undefined,
    numRequiredMembers: event._count.requiredMembers,
    numOptionalMembers: event._count.optionalMembers,
    numDeniedMembers: event._count.deniedMembers,
    numScheduledSlots: event._count.scheduledTimes
  };
};

export const eventWorkPackageTransformer = (workPackage: EventWorkPackagePayload): WorkPackageCalendarPreview => {
  return { workPackageId: workPackage.workPackageId, wbsElement: workPackage.wbsElement };
};

const eventTeamTransformer = (team: EventTeamPayload): TeamCalendarPreview => {
  return { teamId: team.teamId, teamName: team.teamName };
};

export const eventDetailTransformer = (
  event: BaseEventPayload & {
    approvalRequiredBy: BaseUserPayload | null;
    requiredMembers: BaseUserPayload[];
    optionalMembers: BaseUserPayload[];
    confirmedMembers: BaseUserPayload[];
    deniedMembers: BaseUserPayload[];
    teams: EventTeamPayload[];
    shops: ShopPreview[];
    machinery: MachineryPreview[];
    workPackages: EventWorkPackagePayload[];
    documents: Document[];
  },
  isCurrentUserOnEvent: boolean
): EventDetail => {
  return {
    ...baseEventTransformer(event),
    approvalRequiredFrom: event.approvalRequiredBy ? baseUserTransformer(event.approvalRequiredBy) : undefined,
    requiredMembers: event.requiredMembers.map(baseUserTransformer),
    optionalMembers: event.optionalMembers.map(baseUserTransformer),
    confirmedMembers: event.confirmedMembers.map(baseUserTransformer),
    deniedMembers: event.deniedMembers.map(baseUserTransformer),
    teams: event.teams.map(eventTeamTransformer),
    shops: event.shops.map((shop) => ({ shopId: shop.shopId, name: shop.name })),
    machinery: event.machinery.map((machine) => ({ machineryId: machine.machineryId, name: machine.name })),
    workPackages: event.workPackages.map(eventWorkPackageTransformer),
    documents: event.documents.map(documentTransformer),
    isCurrentUserOnEvent
  };
};

export const upcomingEventTransformer = (
  event: BaseEventPayload & {
    requiredMembers: BaseUserPayload[];
    optionalMembers: BaseUserPayload[];
    confirmedMembers: { userId: string }[];
    teams: EventTeamPayload[];
    workPackages: EventWorkPackagePayload[];
  }
): UpcomingEvent => {
  return {
    ...baseEventTransformer(event),
    requiredMembers: event.requiredMembers.map(baseUserTransformer),
    optionalMembers: event.optionalMembers.map(baseUserTransformer),
    teams: event.teams.map(eventTeamTransformer),
    workPackages: event.workPackages.map(eventWorkPackageTransformer),
    // the query only selects the current user out of the confirmed members
    isCurrentUserConfirmed: event.confirmedMembers.length > 0
  };
};

export const guestEventInstanceTransformer = (
  slot: Pick<Prisma.Schedule_SlotGetPayload<null>, 'scheduleSlotId' | 'startTime' | 'endTime' | 'allDay'> & {
    event: Omit<BaseEventPayload, 'scheduledTimes'> & {
      teams: EventTeamPayload[];
      workPackages: EventWorkPackagePayload[];
    };
  }
): GuestEventInstance => {
  return {
    ...baseEventFieldsTransformer(slot.event),
    ...scheduleTimesTransformer(slot),
    teams: slot.event.teams.map(eventTeamTransformer),
    workPackages: slot.event.workPackages.map(eventWorkPackageTransformer)
  };
};

export const icsEventTransformer = (
  event: Omit<BaseEventPayload, 'userCreated'> & {
    userCreated: BaseUserPayload & { email: string };
    requiredMembers: BaseUserPayload[];
    optionalMembers: BaseUserPayload[];
    teams: { teamName: string }[];
    shops: { name: string }[];
    machinery: { name: string }[];
    workPackages: EventWorkPackagePayload[];
  }
): IcsEvent => {
  return {
    ...baseEventTransformer(event),
    userCreated: { ...baseUserTransformer(event.userCreated), email: event.userCreated.email },
    requiredMembers: event.requiredMembers.map(baseUserTransformer),
    optionalMembers: event.optionalMembers.map(baseUserTransformer),
    teams: event.teams.map((team) => ({ teamName: team.teamName })),
    shops: event.shops.map((shop) => ({ name: shop.name })),
    machinery: event.machinery.map((machine) => ({ name: machine.name })),
    workPackages: event.workPackages.map(eventWorkPackageTransformer)
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
