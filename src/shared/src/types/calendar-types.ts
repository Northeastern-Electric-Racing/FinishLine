import { WorkPackage } from './project-types';
import { User } from './user-types';
import { Team } from './team-types';

export interface Calendar {
  calendarId: string;
  name: string;
  description: string;
  color: string;
  userCreated: User;
  dateCreated: Date;
  eventTypes: EventType[];
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
  initialDateScheduled: boolean;
  allDay: boolean;
  recurring: boolean;
  members: boolean;
  location: boolean;
  zoomLink: boolean;
  shop: boolean;
  machinery: boolean;
  workPackage: boolean;
  questionDocument: boolean;
  documents: boolean;
  description: boolean;
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
  userCreated: User;
  dateCreated: Date;
  eventTypeId: string;
  approvedBy?: User;
  scheduledTimes: ScheduleSlot[];
  people: User[];
  teams: Team[];
  location?: string;
  zoomLink?: string;
  shops: Shop[];
  machinery: Machinery[];
  workPackages: WorkPackage[];
  documentIds: string[];
  questionDocument?: string;
  description?: string;
}
