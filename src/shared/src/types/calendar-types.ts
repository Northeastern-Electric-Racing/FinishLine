import { WorkPackage } from './project-types';
import { Availability, User } from './user-types';

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
  MONDAY,
  TUESDAY,
  WEDNESDAY,
  THURSDAY,
  FRIDAY,
  SATURDAY,
  SUNDAY
}

export interface ScheduleSlot {
  scheduleSlotId: string;
  days: DayOfWeek[];
  startTime?: Date;
  endTime?: Date;
  recurrenceNumber: number;
  initialDateScheduled: Date;
  allDay: Boolean;
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
  availability: boolean;
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
  name: string;
  approved: boolean;
  userCreated: User;
  dateCreated: Date;
  eventTypeId: string;
  approvedBy?: User;
  scheduledTimes?: ScheduleSlot[];
  people?: User[];
  location?: string;
  zoomLink?: string;
  availability?: Availability[];
  shop?: Shop[];
  machinery?: Machinery[];
  workPackage?: WorkPackage[];
  documentIds?: string[];
  description?: string;
}
