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

// Get a list of dates for user viewing purposes (formatted to their timezone)
export const getMeetingDates = (event: Event) => {
  const times: Date[] = [];
  event.scheduledTimes.forEach((schedule) => {
    schedule.days.forEach((day) => {
      const startTimeDate = new Date(schedule.initialDateScheduled);
      const timezoneOffset = startTimeDate.getTimezoneOffset() * 60000;
      const startDate = new Date(startTimeDate.getTime() + timezoneOffset);
      const offset = startDate.getDay() - convertDayToInt(day);
      startDate.setDate(startDate.getDate() - offset);

      // Note : schedule.startTime likely gets converted to the users timezone by default
      startDate.setHours(schedule.startTime?.getHours() ?? 0);
      startDate.setMinutes(schedule.startTime?.getMinutes() ?? 0);

      // adjust for the users time
      const startDateAdjusted = new Date(startDate.getTime() - timezoneOffset);
      times.push(startDateAdjusted);

      for (let i = 1; i <= schedule.recurrenceNumber; i++) {
        const nextDate = new Date(startDateAdjusted);
        nextDate.setDate(nextDate.getDate() + 7 * i);

        times.push(nextDate);
      }
    });
  });

  return times;
};
