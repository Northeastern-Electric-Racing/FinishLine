import { DayOfWeek } from 'shared';

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
