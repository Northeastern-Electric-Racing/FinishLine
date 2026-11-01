import dayjs from 'dayjs';
import { PublicBayDashboardCalendarEvent } from 'shared';

export interface CalendarDayEvents {
  day: Date;
  events: PublicBayDashboardCalendarEvent[];
}

export interface LimitedCalendarDayEvents extends CalendarDayEvents {
  hiddenCount: number;
}

export const CALENDAR_DAYS_SHOWN = 3;
export const LARGE_CALENDAR_MAX_EVENTS = 5;
export const MEDIUM_CALENDAR_MAX_EVENTS = 2;

/**
 * The days the large calendar widget shows, starting with the day of `now`
 */
export const getCalendarDays = (now: Date, count = CALENDAR_DAYS_SHOWN): Date[] =>
  Array.from({ length: count }, (_, i) => dayjs(now).startOf('day').add(i, 'day').toDate());

/**
 * Whether the event is happening at any point during the given day
 * Multi-day events are shown individually on every day they covers
 */
export const eventOccursOnDay = (event: PublicBayDashboardCalendarEvent, day: Date): boolean => {
  const dayStart = dayjs(day).startOf('day');
  const dayEnd = dayStart.add(1, 'day');
  const start = dayjs(event.startTime);
  const end = dayjs(event.endTime);

  // an event with no length is on the day it starts
  if (!end.isAfter(start)) return !start.isBefore(dayStart) && start.isBefore(dayEnd);

  return start.isBefore(dayEnd) && end.isAfter(dayStart);
};

// all day events come first, then events in the order of start time
const compareEvents = (a: PublicBayDashboardCalendarEvent, b: PublicBayDashboardCalendarEvent) =>
  Number(b.allDay) - Number(a.allDay) || a.startTime.getTime() - b.startTime.getTime();

export const groupEventsByDay = (events: PublicBayDashboardCalendarEvent[], days: Date[]): CalendarDayEvents[] =>
  days.map((day) => ({ day, events: events.filter((event) => eventOccursOnDay(event, day)).sort(compareEvents) }));

/**
 * Keeps at most `maxEvents` events across the days and counts the ones that didn't fit on each day.
 * The first day always shows all of its events. The days after it share what's left one event at a time, so one busy
 * day can't use it all up.
 */
export const limitEventsAcrossDays = (groups: CalendarDayEvents[], maxEvents: number): LimitedCalendarDayEvents[] => {
  const shownCounts = groups.map((group, i) => (i === 0 ? group.events.length : 0));
  let remaining = maxEvents - (shownCounts[0] ?? 0);
  let sharedOut = true;

  while (remaining > 0 && sharedOut) {
    sharedOut = false;
    for (let i = 1; i < groups.length && remaining > 0; i++) {
      if (shownCounts[i] < groups[i].events.length) {
        shownCounts[i]++;
        remaining--;
        sharedOut = true;
      }
    }
  }

  return groups.map(({ day, events }, i) => ({
    day,
    events: events.slice(0, shownCounts[i]),
    hiddenCount: events.length - shownCounts[i]
  }));
};

/**
 * The events that haven't ended yet, in the order they start
 */
export const getUpcomingEvents = (events: PublicBayDashboardCalendarEvent[], now: Date): PublicBayDashboardCalendarEvent[] =>
  events
    .filter((event) => event.endTime.getTime() > now.getTime())
    .sort((a, b) => a.startTime.getTime() - b.startTime.getTime());

/**
 * The time an event is shown with on a given day, e.g. "3:00 - 5:00 PM".
 */
export const formatEventTime = (event: PublicBayDashboardCalendarEvent, day: Date): string => {
  if (event.allDay) return 'All day';

  const dayStart = dayjs(day).startOf('day');
  const dayEnd = dayStart.add(1, 'day');
  const start = dayjs(event.startTime);
  const end = dayjs(event.endTime);

  const startsToday = !start.isBefore(dayStart);
  const endsToday = !end.isAfter(dayEnd);

  if (startsToday && endsToday) {
    // only repeat AM/PM when the range crosses noon
    const startFormat = start.format('A') === end.format('A') ? 'h:mm' : 'h:mm A';
    return `${start.format(startFormat)} - ${end.format('h:mm A')}`;
  }
  if (startsToday) return `From ${start.format('h:mm A')}`;
  if (endsToday) return `Until ${end.format('h:mm A')}`;
  return 'All day';
};

export const formatCalendarDay = (day: Date): string => dayjs(day).format('ddd, MMM D');
