import { Event, EventStatus } from 'shared';

export const enumToArray = (en: { [key: number]: string | number }) => {
  return Object.keys(en).filter((value: string) => isNaN(Number(value)) === true);
};

export const NOON_IN_MINUTES = 720;

export enum DAY_NAMES {
  Sunday,
  Monday,
  Tuesday,
  Wednesday,
  Thursday,
  Friday,
  Saturday
}

export enum MONTH_NAMES {
  January,
  February,
  March,
  April,
  May,
  June,
  July,
  August,
  September,
  October,
  November,
  December
}

export type ExistingMeetingData = Map<number, { iconMap: Map<number, string> }>;

export enum REVIEW_TIMES {
  '10-11 AM',
  '11-12 AM',
  '12-1 PM',
  '1-2 PM',
  '2-3 PM',
  '3-4 PM',
  '4-5 PM',
  '5-6 PM',
  '6-7 PM',
  '7-8 PM',
  '8-9 PM',
  '9-10 PM'
}

export const HOURS: number[] = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

export const HeatmapColors = ['#D9D9D9', '#C1E0C1', '#9BE89B', '#7AE47A', '#45EF45', '#0FD70F'];

export const NUMBER_OF_TIME_SLOTS = enumToArray(REVIEW_TIMES).length * enumToArray(DAY_NAMES).length;

const nthWeekday = (year: number, month: MONTH_NAMES, weekday: DAY_NAMES, nth: number) => {
  const day = new Date(year, month!, 1);
  const dayDiff = (weekday! - day.getDay() + 7) % 7;

  return new Date(year, month, 1 + dayDiff + (nth - 1) * 7);
};

const daylightSavings = () => {
  const currDate = new Date();

  const start = nthWeekday(currDate.getFullYear(), MONTH_NAMES.March, DAY_NAMES.Sunday, 2);
  const end = nthWeekday(currDate.getFullYear(), MONTH_NAMES.November, DAY_NAMES.Sunday, 1);
  return currDate >= start && currDate < end;
};

export const userOffsetTime = () => {
  const UTCOffset = -new Date().getTimezoneOffset() / 60;
  const EST = daylightSavings() ? -4 : -5;
  const userOffset = UTCOffset - EST;
  return userOffset;
};

export const offsetDate = (date: Date) => {
  const hoursOffset = userOffsetTime();
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours() + hoursOffset);
};

// converts a REVIEW_TIME (That is in string form) to the user's current time
export const reviewTimesInCurrentTimeZone = (time: string) => {
  return offsetReviewTime(time, userOffsetTime());
};

const isTwoDigitHour = (time: string) => !isNaN(Number(time.charAt(1)));

const offsetReviewTime = (time: string, offset: number) => {
  // get initialTime
  const startTime = Number(time.charAt(0) + (isTwoDigitHour(time) ? time.charAt(1) : ''));

  let newStartTime = (startTime + offset + 12) % 12;
  if (newStartTime === 0) newStartTime = 12;
  let newEndTime = (startTime + 1 + offset + 12) % 12;
  if (newEndTime === 0) newEndTime = 12;

  return newStartTime + '-' + newEndTime + ' ' + AMorPM(time, offset);
};

const AMorPM = (time: string, offset: number) => {
  const startTime = Number(time.charAt(0) + (isTwoDigitHour(time) ? time.charAt(1) : ''));
  const AMorPM = time.charAt(time.length - 2) + time.charAt(time.length - 1);
  const startTime24Hour = startTime + (AMorPM === 'PM' && startTime !== 12 ? 12 : 0);

  const newTime = startTime24Hour + offset;
  const newHour = (newTime + 24) % 24;

  return newHour >= 12 ? 'PM' : 'AM';
};

export const formatHourInCurrentTimeZone = (time: string) => {
  return offsetFormatHour(time, userOffsetTime());
};

const offsetFormatHour = (time: string, offset: number) => {
  const hourTime = Number(time.charAt(0) + (isTwoDigitHour(time) ? time.charAt(1) : ''));

  let newHourTime = (((hourTime + offset) % 12) + 12) % 12;
  if (newHourTime === 0) newHourTime = 12;

  return newHourTime + ':00 ' + AMorPM(time, offset);
};

export const getBackgroundColor = (frequency: number = 0, totalUsers: number): string => {
  if (frequency === 0) return HeatmapColors[0];
  if (frequency >= totalUsers) return HeatmapColors[5];

  const colors = [HeatmapColors[1], HeatmapColors[2], HeatmapColors[3], HeatmapColors[4]];

  const ratio = ((frequency - 1) / (totalUsers - 1)) * (colors.length - 1);
  const colorIndex = Math.floor(ratio);

  return colors[colorIndex];
};

export const daysInMonth = (month: Date): number => {
  return new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
};

export const calendarPaddingDays = (month: Date): number => {
  return new Date(month.getFullYear(), month.getMonth(), 1).getDay();
};

export const getStartOfWeek = (currentDate: Date) => {
  const currentDay = currentDate.getDay();
  const currentMonth = currentDate.getDate();
  const startOfWeek = new Date(currentDate);
  startOfWeek.setDate(currentMonth - currentDay);
  return startOfWeek;
};

export const getWeekDateRange = (selectedDate: Date) => {
  const startDate = getStartOfWeek(selectedDate);
  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + 6);
  return [startDate, endDate];
};

export const isConfirmed = (event: Event): boolean => {
  return (
    event.status === EventStatus.CONFIRMED || event.status === EventStatus.SCHEDULED || event.status === EventStatus.DONE
  );
};

export const eventStatusPipe = (status: EventStatus) => {
  switch (status) {
    case EventStatus.CONFIRMED:
      return 'Ready to Schedule';
    case EventStatus.UNCONFIRMED:
      return 'Unconfirmed';
    case EventStatus.SCHEDULED:
      return 'Scheduled';
    case EventStatus.DONE:
      return 'Completed';
  }
};

export const eventStatusColor = (status: EventStatus) => {
  switch (status) {
    case EventStatus.CONFIRMED:
      return 'orange';
    case EventStatus.UNCONFIRMED:
      return 'grey';
    case EventStatus.SCHEDULED:
      return '#ef4345';
    case EventStatus.DONE:
      return 'green';
  }
};
