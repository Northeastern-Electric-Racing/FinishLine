import dayjs from 'dayjs';

export function dateToString(date: Date) {
  return dayjs(date).format('YYYY-MM-DD');
}

export function dateFormatMonthDate(date: Date) {
  return dayjs(date).format('MMM D');
}
