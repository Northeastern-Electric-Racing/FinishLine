import {
  Design_Review_Status as PrismaDesignReviewStatus,
  Prisma,
  TeamType,
  Design_Review as PrismaDesignReview
} from '@prisma/client';
import { batman, sharedBatman, wonderwoman } from './users.test-data';
import designReviewQueryArgs from '../../src/prisma-query-args/design-review.query-args';
import { prismaWbsElement1 } from './wbs-element.test-data';
import { DesignReview as SharedDesignReview, DesignReviewStatus as sharedDesignReviewStatus } from 'shared';

export const designReview1: PrismaDesignReview = {
  designReviewId: '1',
  dateScheduled: new Date('2024-03-25'),
  meetingTimes: [1, 2, 3],
  dateCreated: new Date('2024-03-10'),
  userCreatedId: batman.userId,
  status: PrismaDesignReviewStatus.CONFIRMED,
  teamTypeId: '1',
  location: null,
  isOnline: true,
  isInPerson: false,
  zoomLink: null,
  dateDeleted: null,
  userDeletedId: null,
  docTemplateLink: null,
  wbsElementId: 1
};

export const teamType1: TeamType = {
  teamTypeId: '1',
  name: 'teamType1',
  iconName: 'YouTubeIcon'
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
  meetingTimes: [27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41],
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

export const prismaDesignReview3: Prisma.Design_ReviewGetPayload<typeof designReviewQueryArgs> = {
  designReviewId: '2',
  dateScheduled: new Date('2024-03-25'),
  meetingTimes: [80, 81, 82, 83, 84],
  dateCreated: new Date('2024-03-10'),
  userCreatedId: wonderwoman.userId,
  status: PrismaDesignReviewStatus.CONFIRMED,
  teamTypeId: '1',
  location: null,
  isOnline: true,
  isInPerson: false,
  zoomLink: 'https://www.zoom.com',
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
