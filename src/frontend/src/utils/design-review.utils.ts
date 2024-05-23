import { DesignReview, DesignReviewStatus } from 'shared';

export const EnumToArray = (en: { [key: number]: string | number }) => {
  return Object.keys(en).filter((value: string) => isNaN(Number(value)) === true);
};

export const NOON_IN_MINUTES = 720;

export enum DAY_NAMES {
  Monday,
  Tuesday,
  Wednesday,
  Thursday,
  Friday,
  Saturday,
  Sunday
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

export const HeatmapColors = ['#D9D9D9', '#E0C0C1', '#E89A9B', '#E4797A', '#EF4345', '#D70C0F'];

export const NUMBER_OF_TIME_SLOTS = EnumToArray(REVIEW_TIMES).length * EnumToArray(DAY_NAMES).length;

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
  return new Date(month.getFullYear(), month.getMonth(), 0).getDay();
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

export const isConfirmed = (designReview: DesignReview): boolean => {
  return (
    designReview.status === DesignReviewStatus.CONFIRMED ||
    designReview.status === DesignReviewStatus.SCHEDULED ||
    designReview.status === DesignReviewStatus.DONE
  );
};

export const designReviewStatusPipe = (status: DesignReviewStatus) => {
  switch (status) {
    case DesignReviewStatus.CONFIRMED:
      return 'Ready to Schedule';
    case DesignReviewStatus.UNCONFIRMED:
      return 'Unconfirmed';
    case DesignReviewStatus.SCHEDULED:
      return 'Scheduled';
    case DesignReviewStatus.DONE:
      return 'Completed';
  }
};

export const designReviewStatusColor = (status: DesignReviewStatus) => {
  switch (status) {
    case DesignReviewStatus.CONFIRMED:
      return 'orange';
    case DesignReviewStatus.UNCONFIRMED:
      return 'grey';
    case DesignReviewStatus.SCHEDULED:
      return '#ef4345';
    case DesignReviewStatus.DONE:
      return 'green';
  }
};
