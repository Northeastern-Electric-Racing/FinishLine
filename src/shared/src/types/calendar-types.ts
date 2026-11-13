import { BaseUser, User } from './user-types.js';

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

export interface NotificationChannelPreview {
  slackChannelId: string;
  name?: string;
  hasAccess?: boolean;
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
  takeAttendance: boolean;
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
  takeAttendance: boolean;
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

/** The minimum every consumer of an event needs. Served as-is by the new member events widget and nested in conflicts */
export interface BaseEvent {
  eventId: string;
  title: string;
  eventTypeId: string;
  status: EventStatus;
  approved: ConflictStatus;
  location?: string;
  zoomLink?: string;
  description?: string;
  questionDocumentLink?: string;
  initialDateScheduled?: Date;
  dateCreated: Date;
  notificationChannelIds: string[];
  userCreated: BaseUser;
  teamType?: TeamTypeCalendarPreview;
  scheduledTimes: ScheduleSlot[];
}

/** The calendar grid, the "+N" overflow card, and the Your Events / Review Bookings tables */
export interface CalendarEvent extends BaseEvent {
  approvalRequiredFrom?: BaseUser;
  firstRequiredMember?: BaseUser;
  numRequiredMembers: number;
  numOptionalMembers: number;
  numDeniedMembers: number;
  numScheduledSlots: number;
}

/** A single CalendarEvent slot, as the calendar grid and tables render it */
export type CalendarEventInstance = Omit<CalendarEvent, 'scheduledTimes'> &
  ScheduleSlot & {
    recurring: boolean;
    totalScheduledSlots: number;
  };

/** The event click popup, edit modal, availability page, and event deep links */
export interface EventDetail extends BaseEvent {
  approvalRequiredFrom?: BaseUser;
  requiredMembers: BaseUser[];
  optionalMembers: BaseUser[];
  confirmedMembers: BaseUser[];
  deniedMembers: BaseUser[];
  teams: TeamCalendarPreview[];
  shops: ShopPreview[];
  machinery: MachineryPreview[];
  workPackages: WorkPackageCalendarPreview[];
  documents: Document[];
  isCurrentUserOnEvent: boolean;
}

/** The calendar "My Upcoming Meetings" sidebar and the lead home page upcoming design reviews */
export interface UpcomingEvent extends BaseEvent {
  requiredMembers: BaseUser[];
  optionalMembers: BaseUser[];
  teams: TeamCalendarPreview[];
  workPackages: WorkPackageCalendarPreview[];
  isCurrentUserConfirmed: boolean;
}

/**
 * A conflict banner on the calendar page. `event` is either one of the current user's pending or denied events, or (when
 * isCurrentUserApprover) an event waiting on the current user's approval. `conflictingEvent` is the event it overlaps,
 * and `overlapStart` is when the conflicting event's overlapping slot starts
 */
export interface EventConflict {
  event: BaseEvent;
  conflictingEvent: BaseEvent;
  overlapStart: Date;
  isCurrentUserApprover: boolean;
}

/** One slot of an event on the guest events page */
export type GuestEventInstance = Omit<BaseEvent, 'scheduledTimes'> &
  ScheduleSlot & {
    teams: TeamCalendarPreview[];
    workPackages: WorkPackageCalendarPreview[];
  };

/** The admin design review attendance table */
export interface UserEventAttendance {
  userId: string;
  numAttended: number;
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

export interface IcsBusyInterval {
  start: Date;
  end: Date;
}

export interface BusySlots {
  dateSet: Date;
  busySlots: number[];
}
