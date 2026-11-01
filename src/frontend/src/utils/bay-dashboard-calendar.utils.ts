import dayjs from 'dayjs';
import { PublicBayDashboardCalendarEvent } from 'shared';

export interface CalendarDayEvents {
  day: Date;
  events: PublicBayDashboardCalendarEvent[];
}

export interface LimitedCalendarDayEvents extends CalendarDayEvents {
  hiddenCount: number;
}

// the large widget always shows this many days, with a "No events" bar on the ones that are empty
export const CALENDAR_DAYS_SHOWN = 3;
export const MEDIUM_CALENDAR_MAX_EVENTS = 2;

// when there is room under those days, the large widget adds the next days that have events, up to this many days
export const LARGE_CALENDAR_MAX_DAYS = 7;

// the large widget always prioritizes showing every event on this many days, and only what fits on the days after them
export const FULL_CALENDAR_DAYS = 2;

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
 * The first days always show every event, however much height that takes. The days after them take as many of their
 * events as fit in what is left, with room for their "+N more" when they cut events. A day with no room for even its
 * first event only shows "+N more".
 * Days after the ones that are always shown are left out unless they have events and there is room for their heading
 * and "+N more".
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
    if (i >= CALENDAR_DAYS_SHOWN && (events.length === 0 || available < MORE_TEXT_HEIGHT)) return;

    let used = 0;
    let shownCount = 0;
    for (const [k, event] of events.entries()) {
      const cardHeight = getCardHeight(event) + (k > 0 ? CARD_GAP : 0);
      // when events are left out, "+N more" goes under the last one that is shown
      const moreHeight = k < events.length - 1 ? CARD_GAP + MORE_TEXT_HEIGHT : 0;
      if (i >= FULL_CALENDAR_DAYS && used + cardHeight + moreHeight > available) break;
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
  daysToCheck = 14
): CalendarDayEvents | undefined =>
  groupEventsByDay(events, getCalendarDays(now, daysToCheck)).find((group) => group.events.length > 0);

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
