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

export const EnumToArray = (en: any) => {
  return Object.keys(en)
    .filter((value: string) => isNaN(Number(value)) === false)
    .map((key) => en[key]);
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
