import {
  Design_Review_Status as PrismaDesignReviewStatus,
  Prisma,
  TeamType as PrismaTeamType,
  Design_Review as PrismaDesignReview
} from '@prisma/client';
import {
  batman,
  sharedBatman,
  wonderwoman,
  wonderwomanMarkedWithScheduleSettings,
  wonderwomanWithScheduleSettings
} from './users.test-data';
import { prismaWbsElement1 } from './wbs-element.test-data';
import {
  DesignReview,
  DesignReviewStatus,
  DesignReview as SharedDesignReview,
  DesignReviewStatus as sharedDesignReviewStatus
} from 'shared';
import designReviewQueryArgs from '../../src/prisma-query-args/design-reviews.query-args';

const today = new Date();

export const designReview1: PrismaDesignReview = {
  designReviewId: '1',
  dateScheduled: today,
  meetingTimes: [1, 2, 3],
  dateCreated: today,
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

export const teamType1: PrismaTeamType = {
  teamTypeId: '1',
  name: 'teamType1',
  iconName: 'YouTubeIcon'
};

export const prismaDesignReview1: Prisma.Design_ReviewGetPayload<typeof designReviewQueryArgs> = {
  designReviewId: '1',
  dateScheduled: today,
  meetingTimes: [0, 1, 2, 3],
  dateCreated: today,
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
  confirmedMembers: [
    {
      ...batman,
      drScheduleSettings: {
        drScheduleSettingsId: '123',
        personalGmail: 'batman@gmail.com',
        personalZoomLink: 'https://zoom.us/j/123456789',
        availability: [1, 2, 3],
        userId: 1
      }
    }
  ],
  deniedMembers: [],
  attendees: [batman],
  userDeleted: null,
  wbsElement: prismaWbsElement1
};

export const prismaDesignReview2: Prisma.Design_ReviewGetPayload<typeof designReviewQueryArgs> = {
  designReviewId: '2',
  dateScheduled: today,
  meetingTimes: [27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41],
  dateCreated: today,
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
  confirmedMembers: [
    {
      ...wonderwoman,
      drScheduleSettings: {
        drScheduleSettingsId: '123',
        personalGmail: 'batman@gmail.com',
        personalZoomLink: 'https://zoom.us/j/123456789',
        availability: [1, 2, 3],
        userId: 1
      }
    }
  ],
  deniedMembers: [],
  attendees: [wonderwoman],
  userDeleted: null,
  wbsElement: prismaWbsElement1,
  teamType: teamType1
};

export const prismaDesignReview3: Prisma.Design_ReviewGetPayload<typeof designReviewQueryArgs> = {
  designReviewId: '2',
  dateScheduled: today,
  meetingTimes: [80, 81, 82, 83],
  dateCreated: today,
  userCreatedId: wonderwoman.userId,
  status: PrismaDesignReviewStatus.CONFIRMED,
  teamTypeId: '1',
  location: 'location',
  isOnline: true,
  isInPerson: false,
  zoomLink: 'https://www.zoom.com',
  dateDeleted: null,
  userDeletedId: null,
  docTemplateLink: null,
  wbsElementId: 1,
  userCreated: batman,
  requiredMembers: [batman],
  optionalMembers: [],
  confirmedMembers: [
    {
      ...batman,
      drScheduleSettings: {
        drScheduleSettingsId: '123',
        personalGmail: 'batman@gmail.com',
        personalZoomLink: 'https://zoom.us/j/123456789',
        availability: [1, 2, 3],
        userId: 1
      }
    }
  ],
  deniedMembers: [],
  attendees: [batman],
  userDeleted: null,
  wbsElement: prismaWbsElement1,
  teamType: teamType1
};

export const prismaDesignReview5: Prisma.Design_ReviewGetPayload<typeof designReviewQueryArgs> = {
  designReviewId: '1',
  dateScheduled: today,
  meetingTimes: [0, 1, 2, 3],
  dateCreated: today,
  userCreatedId: wonderwoman.userId,
  userCreated: wonderwoman,
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
  optionalMembers: [wonderwomanWithScheduleSettings],
  confirmedMembers: [
    {
      ...batman,
      drScheduleSettings: {
        drScheduleSettingsId: 'bmschedule',
        personalGmail: 'brucewayne@gmail.com',
        personalZoomLink: 'https://zoom.us/j/gotham',
        availability: [],
        userId: 69
      }
    }
  ],
  deniedMembers: [],
  attendees: [wonderwoman],
  userDeleted: null,
  wbsElement: prismaWbsElement1
};

export const designReview3: DesignReview = {
  designReviewId: '2',
  dateScheduled: today,
  meetingTimes: [80, 81, 82, 83],
  dateCreated: today,
  userCreated: sharedBatman,
  status: DesignReviewStatus.CONFIRMED,
  teamType: teamType1,
  location: 'location',
  isOnline: true,
  isInPerson: false,
  zoomLink: 'https://www.zoom.com',
  docTemplateLink: undefined,
  wbsName: 'car',
  wbsNum: { carNumber: 1, projectNumber: 2, workPackageNumber: 0 },
  requiredMembers: [sharedBatman],
  optionalMembers: [],
  confirmedMembers: [
    {
      ...sharedBatman,
      scheduleSettings: {
        drScheduleSettingsId: '123',
        personalGmail: 'batman@gmail.com',
        personalZoomLink: 'https://zoom.us/j/123456789',
        availability: [1, 2, 3]
      }
    }
  ],
  deniedMembers: [],
  attendees: [sharedBatman],
  userDeleted: undefined,
  dateDeleted: undefined
};

export const sharedDesignReview1: SharedDesignReview = {
  designReviewId: '1',
  dateScheduled: today,
  meetingTimes: [0, 1, 2, 3],
  dateCreated: today,
  userCreated: sharedBatman,
  status: sharedDesignReviewStatus.CONFIRMED,
  isOnline: true,
  isInPerson: false,
  requiredMembers: [sharedBatman],
  optionalMembers: [],
  confirmedMembers: [
    {
      ...sharedBatman,
      scheduleSettings: {
        drScheduleSettingsId: '123',
        personalGmail: 'batman@gmail.com',
        personalZoomLink: 'https://zoom.us/j/123456789',
        availability: [1, 2, 3]
      }
    }
  ],
  deniedMembers: [],
  attendees: [sharedBatman],
  teamType: teamType1,
  wbsName: 'car',
  wbsNum: { carNumber: 1, projectNumber: 2, workPackageNumber: 0 }
};

export const designReview5: DesignReview = {
  designReviewId: '1',
  dateScheduled: today,
  meetingTimes: [0, 1, 2, 3],
  dateCreated: today,
  userCreated: wonderwoman,
  status: DesignReviewStatus.CONFIRMED,
  teamType: teamType1,
  isOnline: true,
  isInPerson: false,
  requiredMembers: [],
  optionalMembers: [wonderwomanMarkedWithScheduleSettings],
  confirmedMembers: [
    {
      ...sharedBatman,
      scheduleSettings: {
        drScheduleSettingsId: 'bmschedule',
        personalGmail: 'brucewayne@gmail.com',
        personalZoomLink: 'https://zoom.us/j/gotham',
        availability: []
      }
    }
  ],
  deniedMembers: [],
  attendees: [wonderwoman],
  wbsName: 'car',
  wbsNum: { carNumber: 1, projectNumber: 2, workPackageNumber: 0 },
  zoomLink: undefined,
  userDeleted: undefined
};
