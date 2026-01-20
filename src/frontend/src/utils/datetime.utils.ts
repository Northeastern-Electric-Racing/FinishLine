import dayjs from 'dayjs';
import { DayOfWeek, Event } from 'shared';

/**
 * Returns monday of current week
 * @param date date for modify
 */
export const getMonday = (date: Date) => {
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
  const newDate = new Date(date.getTime());
  return new Date(newDate.setDate(diff));
};

export const dateToString = (date: Date) => {
  return dayjs(date).format('YYYY-MM-DD');
};

export const dateFormatMonthDate = (date: Date) => {
  return dayjs(date).format('MMM D');
};

export const transformDate = (date: Date) => {
  const month = date.getMonth() + 1 < 10 ? `0${date.getMonth() + 1}` : (date.getMonth() + 1).toString();
  const day = date.getDate() < 10 ? `0${date.getDate()}` : date.getDate().toString();
  return `${date.getFullYear().toString()}/${month}/${day}`;
};

export const formatDate = (date: Date) => {
  const month = date.getMonth() + 1 < 10 ? `0${date.getMonth() + 1}` : (date.getMonth() + 1).toString();
  const day = date.getDate() + 1 < 10 ? `0${date.getDate() + 1}` : (date.getDate() + 1).toString();
  return `${month}/${day}/${date.getFullYear().toString()}`;
};

export const daysOverdue = (deadline: Date) => {
  return Math.round((new Date().getTime() - deadline.getTime()) / (1000 * 60 * 60 * 24));
};

export const timezoneOffset = (date: Date) => {
  const timestamp = new Date(date).getTime() - new Date(date).getTimezoneOffset() * -60000;
  return new Date(timestamp);
};

/**
 * Formats a Date object in the form of Month Day, Year (ie: January 1, 2024)
 *
 * @param date the date object for modify
 * @returns a string representing the date
 */
export const dateMonthDayYear = (date: Date): string => {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

/**
 * Determines whether the provided date is before today's date
 * @param startDate the first Date object
 * @param endDate the second Date object
 * @returns true if the end date date comes after the start date and false otherwise
 */
export const isPastEvent = (startDate: Date, endDate: Date) => {
  return startDate < endDate;
};

// Gets the start time of an event for a given date
// With the new schema, we find the schedule slot that occurs on the specified date
export const getConvertedStart = (event: Event, dateOrDayOfWeek: Date | DayOfWeek) => {
  // If passed a DayOfWeek enum, we need to find a slot on that day of the week
  // This is for backward compatibility with components that don't have the specific date
  if (typeof dateOrDayOfWeek === 'string') {
    // It's a DayOfWeek enum - find any slot that matches this day
    const dayOfWeekMap: { [key in DayOfWeek]: number } = {
      [DayOfWeek.SUNDAY]: 0,
      [DayOfWeek.MONDAY]: 1,
      [DayOfWeek.TUESDAY]: 2,
      [DayOfWeek.WEDNESDAY]: 3,
      [DayOfWeek.THURSDAY]: 4,
      [DayOfWeek.FRIDAY]: 5,
      [DayOfWeek.SATURDAY]: 6
    };
    const targetDayIndex = dayOfWeekMap[dateOrDayOfWeek];

    const specificSlot = event.scheduledTimes.find((slot) => {
      if (!slot.startTime) return false;
      const slotDate = new Date(slot.startTime);
      return slotDate.getDay() === targetDayIndex;
    });

    const startTime = specificSlot?.startTime ? new Date(specificSlot.startTime) : new Date();
    return startTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  }

  // It's a Date object - find the slot for this specific date
  const targetDate = dateOrDayOfWeek;
  targetDate.setHours(0, 0, 0, 0);

  const specificSlot = event.scheduledTimes.find((slot) => {
    if (!slot.startTime) return false;
    const slotDate = new Date(slot.startTime);
    slotDate.setHours(0, 0, 0, 0);
    return slotDate.getTime() === targetDate.getTime();
  });

  const startTime = specificSlot?.startTime ? new Date(specificSlot.startTime) : new Date();
  return startTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
};

// Gets the end time of an event for a given date
// With the new schema, we find the schedule slot that occurs on the specified date
export const getConvertedEnd = (event: Event, dateOrDayOfWeek: Date | DayOfWeek) => {
  // If passed a DayOfWeek enum, we need to find a slot on that day of the week
  // This is for backward compatibility with components that don't have the specific date
  if (typeof dateOrDayOfWeek === 'string') {
    // It's a DayOfWeek enum - find any slot that matches this day
    const dayOfWeekMap: { [key in DayOfWeek]: number } = {
      [DayOfWeek.SUNDAY]: 0,
      [DayOfWeek.MONDAY]: 1,
      [DayOfWeek.TUESDAY]: 2,
      [DayOfWeek.WEDNESDAY]: 3,
      [DayOfWeek.THURSDAY]: 4,
      [DayOfWeek.FRIDAY]: 5,
      [DayOfWeek.SATURDAY]: 6
    };
    const targetDayIndex = dayOfWeekMap[dateOrDayOfWeek];

    const specificSlot = event.scheduledTimes.find((slot) => {
      if (!slot.endTime) return false;
      const slotDate = new Date(slot.endTime);
      return slotDate.getDay() === targetDayIndex;
    });

    const endTime = specificSlot?.endTime ? new Date(specificSlot.endTime) : new Date();
    return endTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  }

  // It's a Date object - find the slot for this specific date
  const targetDate = dateOrDayOfWeek;
  targetDate.setHours(0, 0, 0, 0);

  const specificSlot = event.scheduledTimes.find((slot) => {
    if (!slot.endTime) return false;
    const slotDate = new Date(slot.endTime);
    slotDate.setHours(0, 0, 0, 0);
    return slotDate.getTime() === targetDate.getTime();
  });

  const endTime = specificSlot?.endTime ? new Date(specificSlot.endTime) : new Date();
  return endTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
};
