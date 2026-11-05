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
  getNextEventDay,
  groupEventsByDay,
  limitEventsToHeight
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
  it('groups events by day, in order of start time with all day events last', () => {
    const allDayToday = event('Holiday', day(22), day(23), { allDay: true });

    const groups = groupEventsByDay([battery, bayTime, allDayToday, cleanup], getCalendarDays(day(22)));

    expect(groups.map((group) => group.events.map((e) => e.title))).toEqual([
      ['Bay Time', 'Battery Box Design', 'Holiday'],
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

describe('limitEventsToHeight', () => {
  const lateEvent = event('Late', new Date(2026, 10, 24, 12), new Date(2026, 10, 24, 13));
  const lateEvent2 = event('Later', new Date(2026, 10, 24, 15), new Date(2026, 10, 24, 16));
  const lateEvent3 = event('Latest', new Date(2026, 10, 24, 18), new Date(2026, 10, 24, 19));

  const counts = (limited: ReturnType<typeof limitEventsToHeight>) =>
    limited.map((group) => [group.events.length, group.hiddenCount]);

  it('shows every event on every day when they all fit', () => {
    // first day: battery, bay time and shakedown, second day: shakedown and cleanup, third day: late and later
    const groups = groupEventsByDay([battery, bayTime, shakedown, cleanup, lateEvent, lateEvent2], getCalendarDays(day(22)));

    expect(counts(limitEventsToHeight(groups))).toEqual([
      [3, 0],
      [2, 0],
      [2, 0]
    ]);
  });

  it('cuts the first day and leaves out the days after it when there is little height', () => {
    const groups = groupEventsByDay([battery, bayTime, shakedown, cleanup, lateEvent, lateEvent2], getCalendarDays(day(22)));

    expect(counts(limitEventsToHeight(groups, 10))).toEqual([[0, 3]]);
  });

  describe('on the third day', () => {
    // the first two days have one event each, the third has three
    const groups = groupEventsByDay([battery, cleanup, lateEvent, lateEvent2, lateEvent3], getCalendarDays(day(22)));

    it('only shows "+N more" when there is no height for the first event', () => {
      expect(counts(limitEventsToHeight(groups, 40))[2]).toEqual([0, 3]);
    });

    it('shows the events that fit in what is left and counts the rest', () => {
      expect(counts(limitEventsToHeight(groups, 45))[2]).toEqual([1, 2]);
      expect(counts(limitEventsToHeight(groups, 55))[2]).toEqual([2, 1]);
    });

    it('shows every event when there is enough height', () => {
      expect(counts(limitEventsToHeight(groups, 60))[2]).toEqual([3, 0]);
    });

    it('cuts the second day and leaves out the third when the first two days do not fit', () => {
      const meetingOn = (dayOfMonth: number, title: string, hour: number) =>
        event(title, new Date(2026, 10, dayOfMonth, hour), new Date(2026, 10, dayOfMonth, hour + 1));
      // two events today, three tomorrow, and one the day after
      const fullGroups = groupEventsByDay(
        [
          meetingOn(22, 'A1', 9),
          meetingOn(22, 'A2', 11),
          meetingOn(23, 'B1', 9),
          meetingOn(23, 'B2', 11),
          meetingOn(23, 'B3', 13),
          meetingOn(24, 'C1', 9)
        ],
        getCalendarDays(day(22))
      );

      expect(counts(limitEventsToHeight(fullGroups, 45))).toEqual([
        [2, 0],
        [1, 2]
      ]);
      expect(counts(limitEventsToHeight(fullGroups, 90))).toEqual([
        [2, 0],
        [3, 0],
        [1, 0]
      ]);
    });
  });

  it('keeps the events that start earliest, so all day events are the first to be left out', () => {
    const lateAllDay = event('Late All Day', day(24), day(25), { allDay: true });
    const groups = groupEventsByDay([lateAllDay, lateEvent], getCalendarDays(day(22)));

    const [, , thirdDay] = limitEventsToHeight(groups, 40);

    expect(thirdDay.events.map((e) => e.title)).toEqual(['Late']);
    expect(thirdDay.hiddenCount).toBe(1);
  });

  it('gives an event with a location more height than one without', () => {
    const meeting = event('Meeting', new Date(2026, 10, 24, 12), new Date(2026, 10, 24, 13));
    const meetingWithLocation = { ...meeting, location: 'The Bay' };
    const getGroups = (e: PublicBayDashboardCalendarEvent) => groupEventsByDay([e, e], getCalendarDays(day(22)));

    // the third day has the height for two events without a location, but not for two with one
    expect(counts(limitEventsToHeight(getGroups(meeting), 44))).toEqual([
      [0, 0],
      [0, 0],
      [2, 0]
    ]);
    expect(counts(limitEventsToHeight(getGroups(meetingWithLocation), 44))).toEqual([
      [0, 0],
      [0, 0],
      [1, 1]
    ]);
  });

  describe('days after the third', () => {
    const wednesday = event('Wednesday', new Date(2026, 10, 25, 12), new Date(2026, 10, 25, 13));
    const thursday = event('Thursday', new Date(2026, 10, 26, 12), new Date(2026, 10, 26, 13));

    // one event today, nothing the next two days, and one event on each of the two days after
    const groups = groupEventsByDay([battery, wednesday, thursday], getCalendarDays(day(22), 5));

    it('adds the days with events while there is room', () => {
      const limited = limitEventsToHeight(groups, 84);

      expect(counts(limited)).toEqual([
        [1, 0],
        [0, 0],
        [0, 0],
        [1, 0],
        [1, 0]
      ]);
    });

    it('only shows "+N more" on a day when there is room for little else', () => {
      expect(counts(limitEventsToHeight(groups, 55))[4]).toEqual([0, 1]);
    });

    it('leaves out a day when there is no room for its heading and "+N more"', () => {
      expect(limitEventsToHeight(groups, 50)).toHaveLength(4);
    });

    it('skips days after the third that have no events', () => {
      const skipping = groupEventsByDay([battery, thursday], getCalendarDays(day(22), 5));

      expect(limitEventsToHeight(skipping, 84).map((group) => group.day)).toEqual([day(22), day(23), day(24), day(26)]);
    });
  });

  it('does not hide anything when everything fits', () => {
    const groups = groupEventsByDay([battery, lateEvent], getCalendarDays(day(22)));

    expect(limitEventsToHeight(groups).every((group) => group.hiddenCount === 0)).toBe(true);
  });
});

describe('getNextEventDay', () => {
  it('returns today with all of its events, including the ones that have ended', () => {
    const nextDay = getNextEventDay([battery, bayTime, cleanup], new Date(2026, 10, 22, 20));

    expect(nextDay?.day).toEqual(day(22));
    expect(nextDay?.events.map((e) => e.title)).toEqual(['Bay Time', 'Battery Box Design']);
  });

  it('returns the next day with events when there are none today', () => {
    const nextDay = getNextEventDay([cleanup], new Date(2026, 10, 22, 10));

    expect(nextDay?.day).toEqual(day(23));
    expect(nextDay?.events.map((e) => e.title)).toEqual(['Bay Cleanup']);
  });

  it('skips the days in between that have no events', () => {
    const later = event('Later', new Date(2026, 10, 25, 12), new Date(2026, 10, 25, 13));

    expect(getNextEventDay([later], new Date(2026, 10, 22, 10))?.day).toEqual(day(25));
  });

  it('returns nothing when none of the days have events', () => {
    expect(getNextEventDay([], new Date(2026, 10, 22, 10))).toBeUndefined();
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
