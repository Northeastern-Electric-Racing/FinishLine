import { DayOfWeek, Event } from 'shared';
import { filterEventTransformer } from '../apis/transformers/calendar.transformer';
import { EventFormValues } from '../pages/CalendarPage/Components/EventModal';

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
export const getMeetingDates = (event: Event, startTimes: boolean = true) => {
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

// check when two events overlap, returning the start and end time for both events that overlap
export const getOverlapTime = (event1: Event, event2: Event) => {
  const starts1 = getMeetingDates(event1, true);
  const ends1 = getMeetingDates(event1, false);
  const starts2 = getMeetingDates(event2, true);
  const ends2 = getMeetingDates(event2, false);

  const overlaps: { event1Time: { start: Date; end: Date }; event2Time: { start: Date; end: Date } }[] = [];

  for (let i = 0; i < starts1.length; i++) {
    const start1 = starts1[i];
    const end1 = ends1[i];

    for (let j = 0; j < starts2.length; j++) {
      const start2 = starts2[j];
      const end2 = ends2[j];

      if (start1 < end2 && end1 > start2) {
        overlaps.push({
          event1Time: { start: start1, end: end1 },
          event2Time: { start: start2, end: end2 }
        });
      }
    }
  }

  return overlaps;
};

// Returns a flat list of event occurrences within a given period
export const getEventsFlattened = (events: Event[], startPeriod: Date, endPeriod: Date): Event[] => {
  const occurrences: { event: Event; date: Date }[] = [];

  events.forEach((event) => {
    const eventDates = getMeetingDates(filterEventTransformer(event));

    eventDates.forEach((date) => {
      if (date >= startPeriod && date <= endPeriod) {
        occurrences.push({ event, date });
      }
    });
  });

  // Sort by date
  occurrences.sort((a, b) => a.date.getTime() - b.date.getTime());

  // Return only the events, possibly repeated for multiple occurrences
  return occurrences.map(({ event }) => event);
};

// converts an Event into Event Form Values
// Note: After the recurring events refactor, we store individual schedule slots
// When editing, we show the first occurrence and set recurrence to 0
// Users will need to delete and recreate if they want to change recurring patterns
export const convertEventToFormValues = (event: Event): Partial<EventFormValues> => {
  // Use the first schedule slot for the form values
  const [firstSlot] = event.scheduledTimes;

  // Extract the date from the first slot's startTime
  // For confirmation-required events, initialDateScheduled represents the start of the week range
  // For regular events, we use the actual startTime from the first slot
  let scheduleDate = new Date();
  if (firstSlot?.startTime) {
    scheduleDate = new Date(firstSlot.startTime);
  } else if (firstSlot?.endTime) {
    scheduleDate = new Date(firstSlot.endTime);
  } else if (event.initialDateScheduled) {
    // Only fall back to initialDateScheduled if no slot times exist (confirmation events)
    scheduleDate = new Date(event.initialDateScheduled);
  }

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
    scheduleDate,
    startTime: firstSlot?.startTime ? new Date(firstSlot.startTime) : undefined,
    endTime: firstSlot?.endTime ? new Date(firstSlot.endTime) : undefined,
    allDay: firstSlot?.allDay ?? false,
    // Set recurrence to 0 since we've already expanded the schedule
    recurrenceNumber: 0,
    // No days since this is now a single occurrence
    days: []
  };
};
