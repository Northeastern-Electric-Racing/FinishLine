import { DesignReview, DesignReviewStatus } from 'shared';
import { batman } from '../../../backend/tests/test-data/users.test-data';
import ConstructionIcon from '@mui/icons-material/Construction';
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';
import ElectricalServicesIcon from '@mui/icons-material/ElectricalServices';
import TerminalIcon from '@mui/icons-material/Terminal';

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

export const daysInMonth = (month: Date): number => {
  return new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
};

export const calendarPaddingDays = (month: Date): number => {
  return new Date(month.getFullYear(), month.getMonth(), 0).getDay();
};

export const getTeamTypeIcon = (teamTypeId: string) => {
  const teamIcons: Map<string, JSX.Element> = new Map([
    ['Software', <TerminalIcon fontSize="small" />],
    ['Business', <WorkOutlineIcon fontSize="small" />],
    ['Electrical', <ElectricalServicesIcon fontSize="small" />],
    ['Mechanical', <ConstructionIcon fontSize="small" />]
  ]);
  return teamIcons.get(teamTypeId);
};

// TODO remove during wire up ticket
export const testDesignReview1: DesignReview = {
  designReviewId: 'Meeting',
  dateScheduled: new Date(),
  meetingTimes: [16],
  dateCreated: new Date(),
  userCreated: batman,
  status: DesignReviewStatus.UNCONFIRMED,
  teamType: { teamTypeId: 'Mechanical', name: 'Mechanical', iconName: '' },
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
