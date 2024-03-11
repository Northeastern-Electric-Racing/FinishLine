import { DesignReview, DesignReviewStatus } from 'shared';
import { batman } from '../../../backend/tests/test-data/users.test-data';

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

export const EnumToArray = (en: { [key: number]: string | number }) => {
  return Object.keys(en).filter((value: string) => isNaN(Number(value)) === true);
};

// TODO remove during wire up ticket
export const testDesignReview1: DesignReview = {
  designReviewId: 'Meeting',
  dateScheduled: new Date(),
  meetingTimes: [16],
  dateCreated: new Date(),
  userCreated: batman,
  status: DesignReviewStatus.UNCONFIRMED,
  teamType: { teamTypeId: 'Mechanical', name: 'Mechanical' },
  requiredMembers: [],
  optionalMembers: [],
  confirmedMembers: [],
  deniedMembers: [],
  isOnline: false,
  isInPerson: false,
  attendees: [],
  wbsName: 'bruh',
  wbsNum: { carNumber: 1, workPackageNumber: 1, projectNumber: 1 }
};
