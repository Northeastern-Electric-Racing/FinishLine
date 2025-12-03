import { User, UserWithScheduleSettings } from './user-types';

export interface ShopPreview {
  shopId: string;
  name: string;
}

export interface MachineryPreview {
  machineryId: string;
  name: string;
}

export interface TeamCalendarPreview {
  teamId: string;
  teamName: string;
}

export interface TeamTypeCalendarPreview {
  teamTypeId: string;
  name: string;
}

export interface WorkPackageCalendarPreview {
  workPackageId: string;
  wbsElement: {
    name: string;
    carNumber: number;
    projectNumber: number;
    workPackageNumber: number;
  };
}

export enum EventStatus {
  UNCONFIRMED = 'UNCONFIRMED',
  CONFIRMED = 'CONFIRMED',
  SCHEDULED = 'SCHEDULED',
  DONE = 'DONE'
}

export enum DayOfWeek {
  MONDAY = 'MONDAY',
  TUESDAY = 'TUESDAY',
  WEDNESDAY = 'WEDNESDAY',
  THURSDAY = 'THURSDAY',
  FRIDAY = 'FRIDAY',
  SATURDAY = 'SATURDAY',
  SUNDAY = 'SUNDAY'
}

export interface Calendar {
  calendarId: string;
  name: string;
  description: string;
  color: string;
  userCreated: User;
  dateCreated: Date;
  eventTypes: EventType[];
}

export interface ScheduleSlot {
  scheduleSlotId: string;
  days: DayOfWeek[];
  startTime?: Date;
  endTime?: Date;
  recurrenceNumber: number;
  initialDateScheduled: Date;
  endDate: Date;
  allDay: boolean;
}

export interface ScheduleSlotCreateArgs {
  days: DayOfWeek[];
  startTime?: Date;
  endTime?: Date;
  recurrenceNumber: number;
  initialDateScheduled: Date;
  allDay: boolean;
}

export interface FilterArgs {
  memberIds?: string[];
  teamIds?: string[];
  calendarIds?: string[];
  eventTypeIds?: string[];
  eventIds?: string[];
  approvalStatus?: boolean;
  startPeriod?: Date;
  endPeriod?: Date;
}

export interface EventType {
  eventTypeId: string;
  name: string;
  userCreated: User;
  dateCreated: Date;
  calendarIds: string[];
  initialDateScheduled: boolean;
  allDay: boolean;
  recurring: boolean;
  requiredMembers: boolean;
  optionalMembers: boolean;
  teams: boolean;
  teamType: boolean;
  location: boolean;
  zoomLink: boolean;
  shop: boolean;
  machinery: boolean;
  workPackage: boolean;
  questionDocument: boolean;
  documents: boolean;
  description: boolean;
  onlyHeadsOrAboveForEventCreation: boolean;
  requiresConfirmation: boolean;
  sendSlackNotifications: boolean;
}

export interface Shop {
  shopId: string;
  name: string;
  description: string;
  userCreated: User;
  dateCreated: Date;
}

export interface ShopMachinery {
  shopMachineryId: string;
  shop: Shop;
  quantity: number;
  description?: string;
}

export interface Machinery {
  machineryId: string;
  name: string;
  userCreated: User;
  dateCreated: Date;
  shops: ShopMachinery[];
}

export interface Event {
  eventId: string;
  title: string;
  approved: boolean;
  userCreated: UserWithScheduleSettings;
  dateCreated: Date;
  eventTypeId: string;
  approvalRequiredFrom?: User;
  scheduledTimes: ScheduleSlot[];
  requiredMembers: User[];
  optionalMembers: User[];
  confirmedMembers: UserWithScheduleSettings[];
  deniedMembers: User[];
  teams: TeamCalendarPreview[];
  teamType?: TeamTypeCalendarPreview;
  location?: string;
  zoomLink?: string;
  shops: ShopPreview[];
  machinery: MachineryPreview[];
  workPackages: WorkPackageCalendarPreview[];
  documentIds: string[];
  questionDocument?: string;
  description?: string;
  status: EventStatus;
}

export type EventPreview = {
  eventId: string;
  title: string;
  dateScheduled: Date;
  status: EventStatus;
  userCreated: User;
  wbsName: string;
};
