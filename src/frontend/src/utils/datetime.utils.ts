import dayjs from 'dayjs';

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

/**
 * Transforms a Date object to a string in YYYY/MM/DD format using the user's local date
 * This avoids timezone offset issues by using Day.js to format the date as-is
 * @param date the Date object to transform
 * @returns the date string in YYYY/MM/DD format
 */
export const transformDate = (date: Date) => {
  return dayjs(date).format('YYYY/MM/DD');
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
