import dayjs from 'dayjs';
import { BAY_DASHBOARD_CALENDAR_DAYS_AHEAD, formatEventTime, PublicBayDashboardCalendarEvent } from 'shared';

export interface CalendarDayEvents {
  day: Date;
  events: PublicBayDashboardCalendarEvent[];
}

export interface LimitedCalendarDayEvents extends CalendarDayEvents {
  hiddenCount: number;
}

// the large widget shows this many days when there is room, with a "No events" bar on the ones that are empty
export const CALENDAR_DAYS_SHOWN = 3;
export const MEDIUM_CALENDAR_MAX_EVENTS = 2;

// when there is room under those days, the large widget adds the next days that have events, up to this many days
export const LARGE_CALENDAR_MAX_DAYS = BAY_DASHBOARD_CALENDAR_DAYS_AHEAD + 1;

// Heights for the large calendar rendering, used to decide how many events fit on the displayed widget.
// The room under the widget's title: 100 (widget height) - 8 (padding) - 4.9 (title) - 1 (margin)
export const LARGE_CALENDAR_CONTENT_HEIGHT = 86;
const DAY_GAP = 1.5;
const DAY_HEADING_HEIGHT = 4.1;
const NO_EVENTS_HEIGHT = 4.5;
const MORE_TEXT_HEIGHT = 2.7;
const CARD_GAP = 0.8;

// 2 * 1.1 padding + 2.8 * 1.2 title + 1.8 * 1.5 for the time, and again for the location
const getCardHeight = (event: PublicBayDashboardCalendarEvent) => (event.location ? 10.96 : 8.26);

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

// events in the order of start time, with all day events last
const compareEvents = (a: PublicBayDashboardCalendarEvent, b: PublicBayDashboardCalendarEvent) =>
  Number(a.allDay) - Number(b.allDay) || a.startTime.getTime() - b.startTime.getTime();

export const groupEventsByDay = (events: PublicBayDashboardCalendarEvent[], days: Date[]): CalendarDayEvents[] =>
  days.map((day) => ({ day, events: events.filter((event) => eventOccursOnDay(event, day)).sort(compareEvents) }));

/**
 * Keeps as many events as fit in `maxHeight` without scrolling, and counts the ones that were left out of each day.
 * Days are filled in order, so earlier days get the height first. Each day takes as many of its events as fit in what
 * is left, with room for its "+N more" when it cuts events. A day with no room for even its first event only shows
 * "+N more".
 * After the first day, a day is left out when there is no room for its heading and its "No events" bar or "+N more".
 * Days after the first few are also left out when they have no events.
 */
export const limitEventsToHeight = (
  groups: CalendarDayEvents[],
  maxHeight = LARGE_CALENDAR_CONTENT_HEIGHT
): LimitedCalendarDayEvents[] => {
  let remaining = maxHeight;
  const limitedGroups: LimitedCalendarDayEvents[] = [];

  groups.forEach(({ day, events }, i) => {
    const gap = i > 0 ? DAY_GAP : 0;
    const available = remaining - gap - DAY_HEADING_HEIGHT;
    const minHeight = events.length === 0 ? NO_EVENTS_HEIGHT : MORE_TEXT_HEIGHT;
    if (i > 0 && (available < minHeight || (i >= CALENDAR_DAYS_SHOWN && events.length === 0))) return;

    let used = 0;
    let shownCount = 0;
    for (const [k, event] of events.entries()) {
      const cardHeight = getCardHeight(event) + (k > 0 ? CARD_GAP : 0);
      // when events are left out, "+N more" goes under the last one that is shown
      const moreHeight = k < events.length - 1 ? CARD_GAP + MORE_TEXT_HEIGHT : 0;
      if (used + cardHeight + moreHeight > available) break;
      used += cardHeight;
      shownCount++;
    }

    const hiddenCount = events.length - shownCount;
    const moreTextHeight = hiddenCount > 0 ? (shownCount > 0 ? CARD_GAP : 0) + MORE_TEXT_HEIGHT : 0;
    const dayHeight = DAY_HEADING_HEIGHT + (events.length === 0 ? NO_EVENTS_HEIGHT : used + moreTextHeight);
    remaining -= gap + dayHeight;

    limitedGroups.push({ day, events: events.slice(0, shownCount), hiddenCount });
  });

  return limitedGroups;
};

/**
 * The day the medium widget shows: today, or the next day with events when there are none today.
 * Undefined when none of the next days have events.
 */
export const getNextEventDay = (
  events: PublicBayDashboardCalendarEvent[],
  now: Date,
  daysToCheck = LARGE_CALENDAR_MAX_DAYS
): CalendarDayEvents | undefined =>
  groupEventsByDay(events, getCalendarDays(now, daysToCheck)).find((group) => group.events.length > 0);

/**
 * The time an event is shown with on a given day, e.g. "3:00 PM - 5:00 PM".
 * A multi-day event only shows the part on that day: "From 9:00 AM", "All day" or "Until 5:00 PM".
 */
export const formatEventTimeOnDay = (event: PublicBayDashboardCalendarEvent, day: Date): string => {
  if (event.allDay) return 'All day';

  const dayStart = dayjs(day).startOf('day');
  const dayEnd = dayStart.add(1, 'day');

  const startsToday = !dayjs(event.startTime).isBefore(dayStart);
  const endsToday = !dayjs(event.endTime).isAfter(dayEnd);

  if (startsToday && endsToday) return `${formatEventTime(event.startTime)} - ${formatEventTime(event.endTime)}`;
  if (startsToday) return `From ${formatEventTime(event.startTime)}`;
  if (endsToday) return `Until ${formatEventTime(event.endTime)}`;
  return 'All day';
};

export const formatCalendarDay = (day: Date): string => dayjs(day).format('ddd, MMM D');
