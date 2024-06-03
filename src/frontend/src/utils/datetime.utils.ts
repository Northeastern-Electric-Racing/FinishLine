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

export const transformDate = (date: Date) => {
  const month = date.getMonth() + 1 < 10 ? `0${date.getMonth() + 1}` : (date.getMonth() + 1).toString();
  const day = date.getDate() < 10 ? `0${date.getDate()}` : date.getDate().toString();
  return `${date.getFullYear().toString()}/${month}/${day}`;
};
