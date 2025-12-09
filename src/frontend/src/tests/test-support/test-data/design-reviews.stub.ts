/*
 * This file is part of NER's FinishLine and licensed under GNU AGPLv3.
 * See the LICENSE file in the repository root folder for details.
 */

import { ConflictStatus, DayOfWeek, Event, EventStatus, TeamType } from 'shared';
import { exampleAdminUser, exampleAppAdminUser } from './users.stub';

export const teamType1: TeamType = {
  teamTypeId: '1',
  iconName: 'YouTubeIcon',
  description: '',
  imageFileId: null,
  calendarId: null,
  name: 'teamType1',
  dateDeleted: undefined,
  deletedById: undefined
};

export const exampleDesignReviewEvent1: Event = {
  eventId: '1',
  title: 'Design Review - Impact Attenuator',
  approved: ConflictStatus.CONFIRMED,
  userCreated: exampleAdminUser,
  dateCreated: new Date('2024-03-10'),
  eventTypeId: 'design-review-event-type-id',
  approvalRequiredFrom: undefined,
  scheduledTimes: [
    {
      scheduleSlotId: 'slot-1',
      days: [DayOfWeek.TUESDAY],
      startTime: new Date('2024-03-25T10:00:00'),
      endTime: new Date('2024-03-25T11:00:00'),
      recurrenceNumber: 0,
      initialDateScheduled: new Date('2024-03-25'),
      endDate: new Date('2024-03-25'),
      allDay: false
    },
    {
      scheduleSlotId: 'slot-2',
      days: [DayOfWeek.TUESDAY],
      startTime: new Date('2024-03-25T11:00:00'),
      endTime: new Date('2024-03-25T12:00:00'),
      recurrenceNumber: 0,
      initialDateScheduled: new Date('2024-03-25'),
      endDate: new Date('2024-03-25'),
      allDay: false
    },
    {
      scheduleSlotId: 'slot-3',
      days: [DayOfWeek.TUESDAY],
      startTime: new Date('2024-03-25T12:00:00'),
      endTime: new Date('2024-03-25T13:00:00'),
      recurrenceNumber: 0,
      initialDateScheduled: new Date('2024-03-25'),
      endDate: new Date('2024-03-25'),
      allDay: false
    },
    {
      scheduleSlotId: 'slot-4',
      days: [DayOfWeek.TUESDAY],
      startTime: new Date('2024-03-25T13:00:00'),
      endTime: new Date('2024-03-25T14:00:00'),
      recurrenceNumber: 0,
      initialDateScheduled: new Date('2024-03-25'),
      endDate: new Date('2024-03-25'),
      allDay: false
    }
  ],
  requiredMembers: [exampleAdminUser],
  optionalMembers: [],
  confirmedMembers: [exampleAdminUser],
  deniedMembers: [],
  teams: [], // Design reviews don't link to specific teams
  location: undefined, // Online only
  zoomLink: 'https://zoom.us/j/example123',
  shops: [],
  machinery: [],
  workPackages: [
    {
      workPackageId: 'wp-1',
      wbsElement: {
        name: 'Impact Attenuator',
        carNumber: 0,
        projectNumber: 0,
        workPackageNumber: 0
      }
    }
  ],
  documentIds: [],
  questionDocument: 'https://docs.google.com/document/d/example-questions',
  description: undefined,
  status: EventStatus.CONFIRMED
};

export const exampleDesignReviewEvent2: Event = {
  eventId: '2',
  title: 'Design Review - Bodywork',
  approved: ConflictStatus.CONFIRMED,
  userCreated: exampleAppAdminUser,
  dateCreated: new Date('2024-03-10'),
  eventTypeId: 'design-review-event-type-id',
  approvalRequiredFrom: undefined,
  scheduledTimes: [
    {
      scheduleSlotId: 'slot-5',
      days: [DayOfWeek.TUESDAY],
      startTime: new Date('2024-03-25T10:00:00'),
      endTime: new Date('2024-03-25T11:00:00'),
      recurrenceNumber: 0,
      initialDateScheduled: new Date('2024-03-25'),
      endDate: new Date('2024-03-25'),
      allDay: false
    },
    {
      scheduleSlotId: 'slot-6',
      days: [DayOfWeek.TUESDAY],
      startTime: new Date('2024-03-25T14:00:00'),
      endTime: new Date('2024-03-25T15:00:00'),
      recurrenceNumber: 0,
      initialDateScheduled: new Date('2024-03-25'),
      endDate: new Date('2024-03-25'),
      allDay: false
    }
  ],
  requiredMembers: [exampleAppAdminUser],
  optionalMembers: [],
  confirmedMembers: [exampleAppAdminUser],
  deniedMembers: [],
  teams: [],
  location: 'Campus Center Room 101', // In person
  zoomLink: undefined,
  shops: [],
  machinery: [],
  workPackages: [
    {
      workPackageId: 'wp-2',
      wbsElement: {
        name: 'Bodywork',
        carNumber: 0,
        projectNumber: 1,
        workPackageNumber: 0
      }
    }
  ],
  documentIds: [],
  questionDocument: 'https://docs.google.com/document/d/example-questions-2',
  description: undefined,
  status: EventStatus.CONFIRMED
};

export const exampleAllDesignReviews: Event[] = [exampleDesignReviewEvent1, exampleDesignReviewEvent2];
