import { DayOfWeek, Event } from 'shared';

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
    default:
      return -1;
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
// If start/end time is not needed, then only use the provided day
// Should be used when events need to be populated/displayed
export const getMeetingDates = (event: Event, startTimes: boolean = true) => {
  const times: Date[] = [];
  event.scheduledTimes.forEach((schedule) => {
    const specificTime = startTimes ? schedule.startTime : schedule.endTime;

    schedule.days.forEach((day) => {
      const startTimeDate = new Date(schedule.initialDateScheduled);
      const timezoneOffset = startTimeDate.getTimezoneOffset() * 60000;

      // get the initial date (adjusted to match UTC)
      // this is done to ensure offset is properly calculated
      const startDate = new Date(startTimeDate.getTime() + timezoneOffset);

      // set the hour and minutes using UTC to match the adjusted date
      startDate.setHours(specificTime?.getUTCHours() ?? 0);
      startDate.setMinutes(specificTime?.getUTCMinutes() ?? 0);

      // Calculate offset based on the current day being checked
      const offset = startDate.getDay() - convertDayToInt(day);

      // apply offset to get the true date of this specific event
      startDate.setDate(startDate.getDate() - offset);

      // adjust for the users time
      const startDateAdjusted = new Date(startDate.getTime() - timezoneOffset);

      // potentially needed to prevent extra events from showing up before the initial date
      times.push(startDateAdjusted);

      // add additional events for each recurrence on this day
      for (let i = 1; i <= schedule.recurrenceNumber; i++) {
        const nextDate = new Date(startDateAdjusted);
        nextDate.setDate(nextDate.getDate() + 7 * i);
        times.push(nextDate);
      }
    });
  });

  return times;
};

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
