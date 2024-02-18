import dayjs from 'dayjs';

export function dateToString(date: Date) {
  return dayjs(date).format('yyyy-MM-dd');
}

export function dateFormatMonthDate(date: Date) {
  return dayjs(date).format('MMM d');
}
