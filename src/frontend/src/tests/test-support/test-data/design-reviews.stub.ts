/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { DesignReview, DesignReviewStatus, TeamType } from 'shared';
import { exampleAdminUser, exampleAppAdminUser } from './users.stub';
import { exampleWbsProject1 } from './wbs-numbers.stub';

export const teamType1: TeamType = {
  teamTypeId: '1',
  iconName: 'YouTubeIcon',
  description: '',
  imageFileId: null,
  name: 'teamType1'
};

export const exampleDesignReview1: DesignReview = {
  designReviewId: '1',
  dateScheduled: new Date('2024-03-25'),
  meetingTimes: [0, 1, 2, 3],
  dateCreated: new Date('2024-03-10'),
  userCreated: exampleAdminUser,
  status: DesignReviewStatus.CONFIRMED,
  teamType: teamType1,
  requiredMembers: [exampleAdminUser],
  optionalMembers: [],
  confirmedMembers: [exampleAdminUser],
  deniedMembers: [],
  isOnline: true,
  isInPerson: false,
  attendees: [exampleAdminUser],
  wbsName: '1',
  wbsNum: exampleWbsProject1,
  initialDate: new Date('2024-03-25')
};

export const exampleDesignReview2: DesignReview = {
  designReviewId: '2',
  dateScheduled: new Date('2024-03-25'),
  meetingTimes: [0, 4],
  dateCreated: new Date('2024-03-10'),
  userCreated: exampleAppAdminUser,
  status: DesignReviewStatus.CONFIRMED,
  teamType: teamType1,
  requiredMembers: [exampleAppAdminUser],
  optionalMembers: [],
  confirmedMembers: [exampleAppAdminUser],
  deniedMembers: [],
  isOnline: false,
  isInPerson: true,
  attendees: [exampleAppAdminUser],
  wbsName: '1',
  wbsNum: exampleWbsProject1,
  initialDate: new Date('2024-03-25')
};

export const exampleAllDesignReviews: DesignReview[] = [exampleDesignReview1, exampleDesignReview2];
