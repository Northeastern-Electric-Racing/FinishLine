import { WorkPackagePreview } from './project-types';
import { User, UserWithScheduleSettings } from './user-types';
import { TeamPreview } from './team-types';

export enum EventStatus {
  UNCONFIRMED = 'UNCONFIRMED',
  CONFIRMED = 'CONFIRMED',
  SCHEDULED = 'SCHEDULED',
  DONE = 'DONE'
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
  requiredMembers: boolean;
  optionalMembers: boolean;
  teams: boolean;
  location: boolean;
  zoomLink: boolean;
  shop: boolean;
  machinery: boolean;
  workPackage: boolean;
  questionDocument: boolean;
  documents: boolean;
  description: boolean;
  onlyHeadsOrAboveForEventCreation: boolean;
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
  approvalRequiredFrom?: User;
  scheduledTimes: ScheduleSlot[];
  requiredMembers: User[];
  optionalMembers: User[];
  confirmedMembers: UserWithScheduleSettings[];
  deniedMembers: User[];
  teams: TeamPreview[];
  location?: string;
  zoomLink?: string;
  shops: Shop[];
  machinery: Machinery[];
  workPackages: WorkPackagePreview[];
  documentIds: string[];
  questionDocument?: string;
  description?: string;
  status: EventStatus;
}
