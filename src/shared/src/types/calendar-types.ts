import { WorkPackage } from './project-types';
import { Availability, User } from './user-types';

export interface Calendar {
  name: string;
  description: string;
  color: string;
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
  name: string;
  events: Event[];
}

export interface Shop {
  name: string;
  description: string;
}

export interface ShopMachinery {
  shop: Shop;
  quantity: number;
  description?: string;
}

export interface Machinery {
  name: string;
  shops: ShopMachinery[];
}

export interface Event {
  name: string;
  approved: boolean;
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
