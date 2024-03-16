import { Design_Review_Status as PrismaDesignReviewStatus, Prisma, TeamType } from '@prisma/client';
import { batman, sharedBatman, wonderwoman } from './users.test-data';
import designReviewQueryArgs from '../../src/prisma-query-args/design-review.query-args';
import { prismaWbsElement1 } from './wbs-element.test-data';
import { DesignReview as SharedDesignReview, DesignReviewStatus as sharedDesignReviewStatus } from 'shared';

export const teamType1: TeamType = {
  teamTypeId: '1',
  name: 'teamType1',
  iconName: 'icon1'
};

export const prismaDesignReview1: Prisma.Design_ReviewGetPayload<typeof designReviewQueryArgs> = {
  designReviewId: '1',
  dateScheduled: new Date('2024-03-25'),
  meetingTimes: [0, 1, 2, 3],
  dateCreated: new Date('2024-03-10'),
  userCreatedId: batman.userId,
  userCreated: batman,
  status: PrismaDesignReviewStatus.CONFIRMED,
  teamTypeId: '1',
  teamType: teamType1,
  location: null,
  isOnline: true,
  isInPerson: false,
  zoomLink: null,
  dateDeleted: null,
  userDeletedId: null,
  docTemplateLink: null,
  wbsElementId: 1,
  requiredMembers: [batman],
  optionalMembers: [],
  confirmedMembers: [batman],
  deniedMembers: [],
  attendees: [batman],
  userDeleted: null,
  wbsElement: prismaWbsElement1
};

export const prismaDesignReview2: Prisma.Design_ReviewGetPayload<typeof designReviewQueryArgs> = {
  designReviewId: '2',
  dateScheduled: new Date('2024-03-25'),
  meetingTimes: [0, 4],
  dateCreated: new Date('2024-03-10'),
  userCreatedId: wonderwoman.userId,
  status: PrismaDesignReviewStatus.CONFIRMED,
  teamTypeId: '1',
  location: null,
  isOnline: true,
  isInPerson: false,
  zoomLink: null,
  dateDeleted: null,
  userDeletedId: null,
  docTemplateLink: null,
  wbsElementId: 1,
  userCreated: wonderwoman,
  requiredMembers: [wonderwoman],
  optionalMembers: [],
  confirmedMembers: [wonderwoman],
  deniedMembers: [],
  attendees: [wonderwoman],
  userDeleted: null,
  wbsElement: prismaWbsElement1,
  teamType: teamType1
};

export const sharedDesignReview1: SharedDesignReview = {
  designReviewId: '1',
  dateScheduled: new Date('2024-03-25'),
  meetingTimes: [0, 1, 2, 3],
  dateCreated: new Date('2024-03-10'),
  userCreated: sharedBatman,
  status: sharedDesignReviewStatus.CONFIRMED,
  isOnline: true,
  isInPerson: false,
  requiredMembers: [sharedBatman],
  optionalMembers: [],
  confirmedMembers: [sharedBatman],
  deniedMembers: [],
  attendees: [sharedBatman],
  teamType: teamType1,
  wbsName: 'car',
  wbsNum: { carNumber: 1, projectNumber: 2, workPackageNumber: 0 }
};
