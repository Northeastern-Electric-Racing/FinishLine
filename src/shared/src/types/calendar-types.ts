import { User, UserWithScheduleSettings } from './user-types.js';

export interface EventDocumentCreateArgs {
  googleFileId: string;
  name: string;
}

export interface EventDocumentUploadArgs extends EventDocumentCreateArgs {
  file?: File;
}

export interface Document {
  documentId: string;
  googleFileId: string;
  name: string;
}

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

export interface TeamWithMembers {
  teamId: string;
  teamName: string;
  members: User[];
  leads: User[];
  head: User;
}

export interface TeamTypeCalendarPreview {
  teamTypeId: string;
  name: string;
}

export interface TeamTypeWithMembersCalendarPreview {
  teamTypeId: string;
  name: string;
  teams: {
    members: User[];
    leads: User[];
    head: User;
  }[];
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

export enum ConflictStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  DENIED = 'DENIED',
  NO_CONFLICT = 'NO_CONFLICT'
}

export enum SlackMentionType {
  USER = 'USER',
  CHANNEL = 'CHANNEL'
}

export interface Calendar {
  calendarId: string;
  name: string;
  description: string;
  color: string;
  userCreated: User;
  dateCreated: Date;
  eventTypes: EventType[];
  isNewMemberCalendar: boolean;
}

export interface ScheduleSlot {
  scheduleSlotId: string;
  startTime: Date;
  endTime: Date;
  allDay: boolean;
}

export interface ScheduleSlotCreateArgs {
  startTime: Date;
  endTime: Date;
  allDay: boolean;
}

export interface FilterArgs {
  memberIds?: string[];
  teamIds?: string[];
  calendarIds?: string[];
  eventTypeIds?: string[];
  eventIds?: string[];
  statuses?: ConflictStatus[];
  approvalIds?: string[];
  startPeriod: Date;
  endPeriod: Date;
}

export interface EventType {
  eventTypeId: string;
  name: string;
  userCreated: User;
  dateCreated: Date;
  calendarIds: string[];
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

export interface EventTypeCreateArgs {
  name: string;
  calendarIds: string[];
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
  onlyHeadsOrAbove: boolean;
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
  approved: ConflictStatus;
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
  documents: Document[];
  questionDocumentLink?: string;
  description?: string;
  status: EventStatus;
  initialDateScheduled?: Date;
}

export type EventInstance = Omit<Event, 'scheduledTimes'> &
  ScheduleSlot & {
    recurring: boolean;
    totalScheduledSlots: number;
  };

export type EventPreview = {
  eventId: string;
  title: string;
  dateScheduled: Date;
  status: EventStatus;
  userCreated: User;
  wbsName: string;
};

export interface EventWithMembers {
  eventId: string;
  title: string;
  approved: ConflictStatus;
  userCreated: UserWithScheduleSettings;
  dateCreated: Date;
  eventTypeId: string;
  approvalRequiredFrom?: User;
  scheduledTimes: ScheduleSlot[];
  requiredMembers: User[];
  optionalMembers: User[];
  confirmedMembers: UserWithScheduleSettings[];
  deniedMembers: User[];
  teams: TeamWithMembers[];
  teamType?: TeamTypeWithMembersCalendarPreview;
  location?: string;
  zoomLink?: string;
  shops: ShopPreview[];
  machinery: MachineryPreview[];
  workPackages: WorkPackageCalendarPreview[];
  documents: Document[];
  questionDocumentLink?: string;
  description?: string;
  status: EventStatus;
  initialDateScheduled?: Date;
}

export interface TeamType {
  teamTypeId: string;
  name: string;
  iconName: string;
  description: string;
  imageFileId: string | null;
  calendarId: string | null;
  dateDeleted: Date | undefined;
  deletedById: string | undefined;
}

export interface AvailabilityCreateArgs {
  availability: number[];
  dateSet: Date;
}
