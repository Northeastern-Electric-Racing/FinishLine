import {
  Design_Review as PrismaDesignReview,
  Design_Review_Status as PrismaDesignReviewStatus,
  Prisma,
  TeamType
} from '@prisma/client';
import { batman, wonderwoman } from './users.test-data';
import designReviewQueryArgs from '../../src/prisma-query-args/design-reviews.query-args';
import { prismaWbsElement1 } from './wbs-element.test-data';

export const teamType1: TeamType = {
  teamTypeId: '1',
  name: 'teamType1'
};

export const designReview1: PrismaDesignReview = {
  designReviewId: '1',
  dateScheduled: new Date('2024-03-25'),
  meetingTimes: [0, 1, 2, 3],
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

export const prismaDesignReview3: Prisma.Design_ReviewGetPayload<typeof designReviewQueryArgs> = {
  designReviewId: '2',
  dateScheduled: new Date('2024-03-25'),
  meetingTimes: [0, 1, 2, 3, 4],
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
