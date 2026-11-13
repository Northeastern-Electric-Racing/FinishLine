import { BaseEvent, ConflictStatus, DayOfWeek, EventDetail, EventStatus, ScheduleSlot } from 'shared';
import { EventFormValues } from '../pages/CalendarPage/Components/EventModal';

/**
 * Gets the reason why an event is pending for display purposes.
 */
export const getSundayOfWeek = (date: Date): Date => {
  const d = new Date(date);
  d.setDate(d.getDate() - d.getDay());
  d.setHours(0, 0, 0, 0);
  return d;
};

/** One slot of an event model, the way the calendar views render events */
export type EventInstance<T extends BaseEvent> = Omit<T, 'scheduledTimes'> &
  ScheduleSlot & {
    recurring: boolean;
    totalScheduledSlots: number;
  };

/** What the calendar views know about a clicked slot before its details load */
export type EventSlotTarget = Pick<
  EventInstance<BaseEvent>,
  'eventId' | 'title' | 'scheduleSlotId' | 'startTime' | 'endTime' | 'allDay' | 'recurring' | 'totalScheduledSlots'
>;

export const getPendingReason = (event: Pick<BaseEvent, 'approved' | 'status'>): string | null => {
  if (event.approved === ConflictStatus.PENDING) {
    return 'This event has a scheduling conflict and requires approval.';
  } else if (event.approved === ConflictStatus.DENIED) {
    return 'This event was denied due to a scheduling conflict.';
  } else if (event.status === EventStatus.CONFIRMED) {
    return 'This event is waiting to be scheduled.';
  } else if (event.status !== EventStatus.SCHEDULED) {
    return 'This event is unconfirmed and waiting to be scheduled.';
  }
  return null;
};

/**
 * Converts a hex color to a muted (lighter, lower opacity) version.
 * Used for pending events to show them in a less prominent way.
 */
export const getMutedColor = (hexColor: string, opacity: number = 0.35): string => {
  // Remove # if present
  const hex = hexColor.replace('#', '');

  // Parse RGB values
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  // Return rgba with reduced opacity
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

export const convertDayToInt = (day: DayOfWeek) => {
  switch (day) {
    case DayOfWeek.MONDAY:
      return 1;
    case DayOfWeek.TUESDAY:
      return 2;
    case DayOfWeek.WEDNESDAY:
      return 3;
    case DayOfWeek.THURSDAY:
      return 4;
    case DayOfWeek.FRIDAY:
      return 5;
    case DayOfWeek.SATURDAY:
      return 6;
    case DayOfWeek.SUNDAY:
      return 0;
  }
};

export const convertIntToDay = (num: number) => {
  switch (num) {
    case 1:
      return DayOfWeek.MONDAY;
    case 2:
      return DayOfWeek.TUESDAY;
    case 3:
      return DayOfWeek.WEDNESDAY;
    case 4:
      return DayOfWeek.THURSDAY;
    case 5:
      return DayOfWeek.FRIDAY;
    case 6:
      return DayOfWeek.SATURDAY;
    case 0:
      return DayOfWeek.SUNDAY;
    default:
      return DayOfWeek.MONDAY;
  }
};

export const convertDayToDayShorthand = (day: DayOfWeek) => {
  switch (day) {
    case DayOfWeek.MONDAY:
      return 'M';
    case DayOfWeek.TUESDAY:
      return 'T';
    case DayOfWeek.WEDNESDAY:
      return 'W';
    case DayOfWeek.THURSDAY:
      return 'Th';
    case DayOfWeek.FRIDAY:
      return 'F';
    case DayOfWeek.SATURDAY:
      return 'Sat';
    case DayOfWeek.SUNDAY:
      return 'S';
    default:
      return 'Undefined';
  }
};

// Get a list of dates for user viewing purposes (formatted to their timezone, with date and start/end time)
// After the recurring events refactor, each schedule slot contains the actual date/time
// Should be used when events need to be populated/displayed
export const getMeetingDates = (event: Pick<BaseEvent, 'scheduledTimes'>, startTimes: boolean = true) => {
  const times: Date[] = [];

  event.scheduledTimes.forEach((schedule) => {
    const specificTime = startTimes ? schedule.startTime : schedule.endTime;

    // With the new schema, startTime and endTime contain the full date/time
    // Just return the dates directly
    if (specificTime) {
      times.push(new Date(specificTime));
    } else if (schedule.allDay && schedule.startTime) {
      // For all-day events, use startTime for the date
      times.push(new Date(schedule.startTime));
    }
  });

  return times;
};

// the event's total slot count: models that only return the slots in view also send the full count
const totalSlotsOf = (event: BaseEvent & { numScheduledSlots?: number }) =>
  event.numScheduledSlots ?? event.scheduledTimes.length;

export const eventsToEventInstances = <T extends BaseEvent>(events: T[]): EventInstance<T>[] => {
  return events.flatMap((event): EventInstance<T>[] => {
    if (event.scheduledTimes.length === 0 && event.initialDateScheduled) {
      // unscheduled design review, include slot with start and end time as initialDateScheduled
      return [
        {
          ...event,
          startTime: event.initialDateScheduled,
          endTime: event.initialDateScheduled,
          recurring: false,
          totalScheduledSlots: 0,
          scheduleSlotId: event.eventId + '_unscheduled',
          allDay: true
        }
      ];
    }
    return event.scheduledTimes.map((scheduledTime) => ({
      ...event,
      ...scheduledTime,
      recurring: totalSlotsOf(event) > 1,
      totalScheduledSlots: totalSlotsOf(event)
    }));
  });
};

// converts events to event instances, but only the next event instance for each event
// If an event has no times in the future it will not be included in the result
// if an event has multiple times in the future it will only include the next schedule slot
export const eventsToNextEventInstance = <T extends BaseEvent>(events: T[]): EventInstance<T>[] => {
  const now = new Date();

  const eventsWithSlotInFuture = events.filter((event) => {
    return event.scheduledTimes.some((scheduleSlot) => scheduleSlot.endTime > now);
  });

  // For each event, find the next schedule slot in the future
  const eventsWithOnlyNextSlot = eventsWithSlotInFuture.map((event) => ({
    ...event,
    scheduledTimes: [
      event.scheduledTimes.reduce((acc, current) => {
        if ((current.startTime < acc.startTime && current.startTime > now) || acc.startTime < now) return current;
        return acc;
      })
    ]
  }));

  return eventsToEventInstances(eventsWithOnlyNextSlot);
};

// converts an Event into Event Form Values
// Note: Because users can only edit a single instaces time, editModal is always populated with an event instance
// representing a single occurrence of the event. However, event edits will effect the entire series for all values
// except for the schedule slot (date/time), and users are prompted if they want the time effects to propogate to other schedule slots
export const convertEventToFormValues = (event: EventDetail, slot: ScheduleSlot): Partial<EventFormValues> => {
  // For edit mode, use the actual scheduled date of this occurrence, not initialDateScheduled
  const scheduleDate = slot.startTime ? new Date(slot.startTime) : undefined;

  return {
    title: event.title,
    eventTypeId: event.eventTypeId,
    requiredMemberIds: event.requiredMembers.map((m) => m.userId),
    optionalMemberIds: event.optionalMembers.map((m) => m.userId),
    teamIds: event.teams.map((t) => t.teamId),
    teamTypeId: event.teamType?.teamTypeId,
    location: event.location,
    zoomLink: event.zoomLink,
    shopIds: event.shops.map((s) => s.shopId),
    machineryIds: event.machinery.map((m) => m.machineryId),
    workPackageIds: event.workPackages.map((wp) => wp.workPackageId),
    documentFiles: event.documents.map((doc) => ({
      name: doc.name,
      googleFileId: doc.googleFileId
    })),
    questionDocumentLink: event.questionDocumentLink,
    description: event.description,
    notificationChannelIds: event.notificationChannelIds,
    scheduleDate,
    startTime: slot.startTime ? new Date(slot.startTime) : undefined,
    endTime: slot.endTime ? new Date(slot.endTime) : undefined,
    allDay: slot.allDay ?? false,
    // Set recurrence to 0 since we've already expanded the schedule
    recurrenceNumber: 0,
    // No days since this is now a single occurrence
    days: [],
    selectedScheduleSlotId: slot.scheduleSlotId
  };
};
