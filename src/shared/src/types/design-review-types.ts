import { WbsNumber } from './project-types';
import { User, UserWithScheduleSettings } from './user-types';

export interface DesignReview {
  designReviewId: string;
  dateScheduled: Date;
  meetingTimes: number[];
  dateCreated: Date;
  userCreated: User;
  status: DesignReviewStatus;
  teamType: TeamType;
  requiredMembers: User[];
  optionalMembers: User[];
  confirmedMembers: UserWithScheduleSettings[];
  deniedMembers: User[];
  location?: string;
  isOnline: boolean;
  isInPerson: boolean;
  zoomLink?: string;
  attendees: User[];
  dateDeleted?: Date;
  userDeleted?: User;
  docTemplateLink?: string;
  wbsName: string;
  wbsNum: WbsNumber;
}

export enum DesignReviewStatus {
  UNCONFIRMED = 'UNCONFIRMED',
  CONFIRMED = 'CONFIRMED',
  SCHEDULED = 'SCHEDULED',
  DONE = 'DONE'
}

export interface TeamType {
  teamTypeId: string;
  name: string;
  iconName: string;
  description: string;
  imageFileId: string | null;
}
