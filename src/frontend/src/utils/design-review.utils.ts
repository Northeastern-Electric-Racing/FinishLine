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

const monthToIndex = (month: MONTH_NAMES) => {
  const monthToIndexMap: Map<MONTH_NAMES, number> = new Map([
    [MONTH_NAMES.January, 0],
    [MONTH_NAMES.February, 1],
    [MONTH_NAMES.March, 2],
    [MONTH_NAMES.April, 3],
    [MONTH_NAMES.May, 4],
    [MONTH_NAMES.June, 5],
    [MONTH_NAMES.July, 6],
    [MONTH_NAMES.August, 7],
    [MONTH_NAMES.September, 8],
    [MONTH_NAMES.October, 9],
    [MONTH_NAMES.November, 10],
    [MONTH_NAMES.December, 11]
  ]);
  return monthToIndexMap.get(month);
};

const dayToIndex = (weekday: DAY_NAMES) => {
  const dayToIndexMap: Map<DAY_NAMES, number> = new Map([
    [DAY_NAMES.Sunday, 0],
    [DAY_NAMES.Sunday, 1],
    [DAY_NAMES.Sunday, 2],
    [DAY_NAMES.Sunday, 3],
    [DAY_NAMES.Sunday, 4],
    [DAY_NAMES.Sunday, 5],
    [DAY_NAMES.Sunday, 6]
  ]);
  return dayToIndexMap.get(weekday);
};

const nthWeekday = (year: number, month: MONTH_NAMES, weekday: DAY_NAMES, nth: number) => {
  const monthIndex = monthToIndex(month);
  const dayIndex = dayToIndex(weekday);

  const day = new Date(year, monthIndex!, 1);
  const dayDiff = (dayIndex! - day.getDay() + 7) % 7;

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
  let AMorPM = time.charAt(time.length - 2) + time.charAt(time.length - 1);

  const flipAMPM = () => {
    if (AMorPM === 'AM') return 'PM';
    return 'AM';
  };

  // if odd, the AM / PM should be flipped
  const doFlip = Math.floor((startTime + offset - 1) / 12) % 2 === 1;
  if (doFlip) AMorPM = flipAMPM();

  return AMorPM;
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
