/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { PublicBayDashboardCalendarEvent } from 'shared';
import {
  eventOccursOnDay,
  formatCalendarDay,
  formatEventTime,
  getCalendarDays,
  getUpcomingEvents,
  groupEventsByDay,
  limitEventsPerDay
} from '../../utils/bay-dashboard-calendar.utils';

// Nov 22 2026 is a Sunday, all dates are local so the tests don't depend on the time zone they run in
const day = (dayOfMonth: number) => new Date(2026, 10, dayOfMonth);

const event = (
  title: string,
  startTime: Date,
  endTime: Date,
  overrides: Partial<PublicBayDashboardCalendarEvent> = {}
): PublicBayDashboardCalendarEvent => ({ title, startTime, endTime, allDay: false, colorHexCode: '#ff9800', ...overrides });

const battery = event('Battery Box Design', new Date(2026, 10, 22, 15), new Date(2026, 10, 22, 17));
const bayTime = event('Bay Time', new Date(2026, 10, 22, 9), new Date(2026, 10, 22, 11));
const cleanup = event('Bay Cleanup', day(23), day(24), { allDay: true });
const shakedown = event('Car Shakedown', new Date(2026, 10, 22, 12), new Date(2026, 10, 23, 17));

describe('getCalendarDays', () => {
  it('returns the day of now and the days after it', () => {
    const days = getCalendarDays(new Date(2026, 10, 22, 18, 30));

    expect(days).toEqual([day(22), day(23), day(24)]);
  });
});

describe('eventOccursOnDay', () => {
  it('is true for an event on that day and false on other days', () => {
    expect(eventOccursOnDay(battery, day(22))).toBe(true);
    expect(eventOccursOnDay(battery, day(23))).toBe(false);
    expect(eventOccursOnDay(battery, day(21))).toBe(false);
  });

  it('is true on every day a multi-day event covers', () => {
    expect(eventOccursOnDay(shakedown, day(22))).toBe(true);
    expect(eventOccursOnDay(shakedown, day(23))).toBe(true);
    expect(eventOccursOnDay(shakedown, day(24))).toBe(false);
  });

  it('does not put an all day event on the day after it ends', () => {
    expect(eventOccursOnDay(cleanup, day(23))).toBe(true);
    expect(eventOccursOnDay(cleanup, day(24))).toBe(false);
  });

  it('does not put an event that ends at midnight on the next day', () => {
    const lateNight = event('Late Night', new Date(2026, 10, 22, 22), day(23));

    expect(eventOccursOnDay(lateNight, day(22))).toBe(true);
    expect(eventOccursOnDay(lateNight, day(23))).toBe(false);
  });

  it('puts an event with no length on the day it starts', () => {
    const point = event('Deadline', new Date(2026, 10, 22, 12), new Date(2026, 10, 22, 12));

    expect(eventOccursOnDay(point, day(22))).toBe(true);
    expect(eventOccursOnDay(point, day(23))).toBe(false);
  });
});

describe('groupEventsByDay', () => {
  it('groups events by day, with all day events first and then in order of start time', () => {
    const allDayToday = event('Holiday', day(22), day(23), { allDay: true });

    const groups = groupEventsByDay([battery, bayTime, allDayToday, cleanup], getCalendarDays(day(22)));

    expect(groups.map((group) => group.events.map((e) => e.title))).toEqual([
      ['Holiday', 'Bay Time', 'Battery Box Design'],
      ['Bay Cleanup'],
      []
    ]);
  });

  it('shows a multi-day event on each day it covers', () => {
    const groups = groupEventsByDay([shakedown], getCalendarDays(day(22)));

    expect(groups.map((group) => group.events.length)).toEqual([1, 1, 0]);
  });

  it('leaves out events outside of the days', () => {
    const later = event('Later', day(30), day(30));

    expect(groupEventsByDay([later], getCalendarDays(day(22))).every((group) => group.events.length === 0)).toBe(true);
  });
});

describe('limitEventsPerDay', () => {
  const lateEvent = event('Late', new Date(2026, 10, 24, 12), new Date(2026, 10, 24, 13));
  const lateEvent2 = event('Later', new Date(2026, 10, 24, 15), new Date(2026, 10, 24, 16));
  const lateEvent3 = event('Latest', new Date(2026, 10, 24, 18), new Date(2026, 10, 24, 19));

  const counts = (limited: ReturnType<typeof limitEventsPerDay>) =>
    limited.map((group) => [group.events.length, group.hiddenCount]);

  it('shows every event on the first two days', () => {
    // first day: bay time, shakedown and battery, second day: shakedown and cleanup
    const groups = groupEventsByDay([battery, bayTime, shakedown, cleanup], getCalendarDays(day(22)));

    expect(counts(limitEventsPerDay(groups))).toEqual([
      [3, 0],
      [2, 0],
      [0, 0]
    ]);
  });

  it('shows one event on the days after and counts the rest', () => {
    const groups = groupEventsByDay([battery, lateEvent, lateEvent2, lateEvent3], getCalendarDays(day(22)));

    expect(counts(limitEventsPerDay(groups))).toEqual([
      [1, 0],
      [0, 0],
      [1, 2]
    ]);
  });

  it('keeps the first event of a later day, starting with all day events', () => {
    const lateAllDay = event('Late All Day', day(24), day(25), { allDay: true });
    const groups = groupEventsByDay([lateEvent, lateAllDay], getCalendarDays(day(22)));

    const [, , thirdDay] = limitEventsPerDay(groups);

    expect(thirdDay.events.map((e) => e.title)).toEqual(['Late All Day']);
  });

  it('does not hide anything when there is one event on each later day', () => {
    const groups = groupEventsByDay([battery, lateEvent], getCalendarDays(day(22)));

    expect(limitEventsPerDay(groups).every((group) => group.hiddenCount === 0)).toBe(true);
  });
});

describe('getUpcomingEvents', () => {
  it('leaves out events that have ended and orders the rest by start time', () => {
    const upcoming = getUpcomingEvents([battery, bayTime, shakedown], new Date(2026, 10, 22, 10));

    expect(upcoming.map((e) => e.title)).toEqual(['Bay Time', 'Car Shakedown', 'Battery Box Design']);
  });

  it('leaves out an event that ended before now', () => {
    expect(getUpcomingEvents([bayTime], new Date(2026, 10, 22, 12))).toEqual([]);
  });
});

describe('formatEventTime', () => {
  it('shows the range once when it stays within the morning or afternoon', () => {
    expect(formatEventTime(battery, day(22))).toBe('3:00 - 5:00 PM');
  });

  it('shows both AM and PM when the range crosses noon', () => {
    const lunch = event('Lunch', new Date(2026, 10, 22, 11, 30), new Date(2026, 10, 22, 13));

    expect(formatEventTime(lunch, day(22))).toBe('11:30 AM - 1:00 PM');
  });

  it('shows all day events as all day', () => {
    expect(formatEventTime(cleanup, day(23))).toBe('All day');
  });

  it('cuts a multi-day event to the part on each day', () => {
    const threeDays = event('Competition', new Date(2026, 10, 22, 9), new Date(2026, 10, 24, 17));

    expect(formatEventTime(threeDays, day(22))).toBe('From 9:00 AM');
    expect(formatEventTime(threeDays, day(23))).toBe('All day');
    expect(formatEventTime(threeDays, day(24))).toBe('Until 5:00 PM');
  });
});

describe('formatCalendarDay', () => {
  it('shows the weekday, month, and day', () => {
    expect(formatCalendarDay(day(22))).toBe('Sun, Nov 22');
  });
});
