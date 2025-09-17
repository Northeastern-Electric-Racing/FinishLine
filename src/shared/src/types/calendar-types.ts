import { WorkPackage } from './project-types';
import { Availability, User } from './user-types';

export interface Calendar {
  name: string;
  description: string;
  color: string;
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
  dateCreated: Date;
  userCreated: User;
}

export interface ShopMachinery {
  shop: Shop;
  quantity: number;
  description?: string;
}

export interface Machinery {
  machineryId: string;
  name: string;
  shops: ShopMachinery[];
  dateCreated: Date;
  userCreated: User;
}

export interface Event {
  name: string;
  approved: boolean;
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
