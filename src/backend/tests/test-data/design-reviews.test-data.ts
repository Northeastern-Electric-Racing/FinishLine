import { Design_Review as PrismaDesignReview, Design_Review_Status as PrismaDesignReviewStatus } from '@prisma/client';
import { batman, wonderwoman } from './users.test-data';

export const designReview1: PrismaDesignReview = {
  designReviewId: '1',
  dateScheduled: new Date('2024-03-25'),
  meetingTimes: [0, 4],
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

/*
- The user is not an admin but is the user who created the design review thus is allowed to delete the design review
*/

export const DesignReview2: PrismaDesignReview = {
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
  wbsElementId: 1
};
