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

      // Calculate offset based on the current day being checked
      const offset = startDate.getDay() - convertDayToInt(day);

      // apply offset to get the true date of this specific event
      startDate.setDate(startDate.getDate() - offset);

      // adjust for the users time
      const startDateAdjusted = new Date(startDate.getTime() - timezoneOffset);

      // Note : schedule.startTime likely gets converted to the users timezone by default
      startDateAdjusted.setHours(specificTime?.getHours() ?? 0);
      startDateAdjusted.setMinutes(specificTime?.getMinutes() ?? 0);

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
