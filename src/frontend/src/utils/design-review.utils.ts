import {
  batman,
  superman,
  theVisitor,
  greenlantern,
  wonderwoman,
  flash,
  aquaman,
  alfred
} from '../../../backend/tests/test-data/users.test-data';

export const EnumToArray = (en: { [key: number]: string | number }) => {
  return Object.keys(en).filter((value: string) => isNaN(Number(value)) === true);
};

export enum DAY_NAMES {
  Monday,
  Tuesday,
  Wednesday,
  Thursday,
  Friday,
  Saturday,
  Sunday
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

// TODO: We will have to make a call to the backend to get this data
export const usersToAvailabilities = new Map([
  [superman, [1, 2, 3, 4, 5, 6, 7]],
  [batman, [2, 3, 4, 5, 6, 7]],
  [theVisitor, [3, 4, 5, 6, 7]],
  [greenlantern, [4, 5, 6, 7]],
  [wonderwoman, [5, 6, 7]],
  [flash, [6, 7]],
  [aquaman, [7]],
  [alfred, [7]]
]);

// TODO: We will have to maker a call to the backend to get this data
export const existingMeetingData = new Map<number, string>();
existingMeetingData.set(5, 'warning');
existingMeetingData.set(10, 'build');
existingMeetingData.set(20, 'computer');
existingMeetingData.set(50, 'electrical');
