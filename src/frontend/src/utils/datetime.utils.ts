import dayjs from 'dayjs';

/**
 * Returns monday of current week
 * @param date date for modify
 */
export const getMonday = (date: Date) => {
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
  return new Date(date.setDate(diff));
};

export const dateToString = (date: Date) => {
  return dayjs(date).format('YYYY-MM-DD');
};

export const dateFormatMonthDate = (date: Date) => {
  return dayjs(date).format('MMM D');
};
