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
// Should be used when events need to be populated/displayed
export const getMeetingDates = (event: Event) => {
  const times: Date[] = [];
  event.scheduledTimes.forEach((schedule) => {
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

      let startTime: Date | undefined = undefined;
      if (schedule.startTime) {
        startTime = new Date(schedule.startTime);
      }

      // Note : schedule.startTime likely gets converted to the users timezone by default
      // set the hour and minutes
      startDate.setHours(startTime?.getHours() ?? 0);
      startDate.setMinutes(startTime?.getMinutes() ?? 0);

      // adjust for the users time
      const startDateAdjusted = new Date(startDate.getTime() - timezoneOffset);

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

// Returns a flat list of event occurrences within a given period
export const getEventsFlattened = (events: Event[], startPeriod: Date, endPeriod: Date): Event[] => {
  const occurrences: { event: Event; date: Date }[] = [];

  events.forEach((event) => {
    const eventDates = getMeetingDates(event);

    eventDates.forEach((date) => {
      if (date >= startPeriod && date <= endPeriod) {
        console.log(date);
        occurrences.push({ event, date });
      }
    });
  });

  // Sort by date
  occurrences.sort((a, b) => a.date.getTime() - b.date.getTime());

  // Return only the events, possibly repeated for multiple occurrences
  return occurrences.map(({ event }) => event);
};
