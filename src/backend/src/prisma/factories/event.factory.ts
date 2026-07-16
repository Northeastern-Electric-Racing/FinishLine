import { faker, Faker } from '@faker-js/faker';
import { Conflict_Status, Event_Status, Prisma } from '@prisma/client';
import { arrayOrNull } from '../utils/arrays.js';
import { UsersOutput } from '../seed/user.process.js';

const EVENT_TITLE_PREFIXES = [
  'Design Review -',
  'Design Review -',
  'Design Review -',
  'Design Review -',
  'Weekly Meeting -',
  'Team Meeting -',
  'Knowledge Transfer -',
  'Office Hours -',
  'Bay Time -',
  'Planning Meeting -'
];

export const EVENT_LOCATIONS = [
  'The Bay',
  'Richards 054',
  'Richards 300',
  'Hastings 211',
  'Egan 206',
  'Curry 435',
  'Snell 031',
  'Robinson 107',
  'Zoom',
  'Bay/Zoom',
  null,
  null,
  null
];

export const EVENT_DESCRIPTIONS = [
  'Weekly team meeting to go over project updates.',
  'Design review for current project phase.',
  'Office hours for team members to ask questions.',
  'Knowledge transfer session for new members.',
  'Bay time for hands-on work.',
  'Planning session for upcoming milestones.'
];

const APPROVAL_REQUIRED_PROBABILITY = 0.15;
export const EVENTS_PER_PROJECT = 3;
export const DOCUMENT_PROBABILITY = 0.6;
export const MEETING_ATTENDANCE_PROBABILITY = 0.4;
const MAX_ATTENDEES = 10;

export const generateEventCount = (faker: Faker): number => faker.number.int({ min: 1, max: EVENTS_PER_PROJECT });

export const generateScheduleSlotCount = (faker: Faker, title: string): number => {
  const isRecurring =
    title.includes('Weekly') || title.includes('Meeting') || title.includes('Office Hours') || title.includes('Bay Time');

  if (isRecurring) {
    return faker.number.int({ min: 4, max: 12 });
  }

  return faker.number.int({ min: 1, max: 2 });
};

export const generateScheduleSlotOffset = (faker: Faker): number => faker.number.int({ min: 7, max: 21 });

export const generateInitialDateOffset = (faker: Faker, availableDays: number, isCurrentYear: boolean): number => {
  if (isCurrentYear) {
    const recentWindow = Math.min(availableDays, 150);
    const recentStart = Math.max(0, availableDays - recentWindow);
    return faker.number.int({ min: recentStart, max: availableDays });
  }
  return faker.number.int({ min: 0, max: Math.max(0, availableDays) });
};

export const shouldCreateDocument = (faker: Faker): boolean => faker.datatype.boolean({ probability: DOCUMENT_PROBABILITY });

export const shouldCreateMeetingAttendance = (faker: Faker): boolean =>
  faker.datatype.boolean({ probability: MEETING_ATTENDANCE_PROBABILITY });

export const generateAttendeeCount = (faker: Faker, maxUsers: number): number =>
  faker.number.int({ min: 2, max: Math.min(MAX_ATTENDEES, maxUsers) });

export const generateLocation = (faker: Faker): string | null => arrayOrNull(faker, EVENT_LOCATIONS, 0.5);

export const generateEventDescription = (faker: Faker): string | null => arrayOrNull(faker, EVENT_DESCRIPTIONS, 0.5);

export const generateZoomLink = (faker: Faker): string | null => {
  if (!faker.datatype.boolean({ probability: 0.5 })) return null;
  return `https://northeastern.zoom.us/j/${faker.string.numeric(11)}`;
};

export const generateQuestionDocumentLink = (faker: Faker): string | null => {
  if (!faker.datatype.boolean({ probability: 0.6 })) return null;
  return `https://docs.google.com/document/d/${faker.string.alphanumeric(44)}/edit`;
};

export const generateEventTitle = (faker: Faker, projectName: string): string => {
  const prefix = faker.helpers.arrayElement(EVENT_TITLE_PREFIXES);
  return `${prefix} ${projectName}`;
};

export const generateApprovalRequiredFromUserId = (
  faker: Faker,
  creators: UsersOutput['leadership']
): string | undefined => {
  return faker.helpers.maybe(() => faker.helpers.arrayElement(creators).userId, {
    probability: APPROVAL_REQUIRED_PROBABILITY
  });
};

export const generateEventStatus = (faker: Faker): Event_Status =>
  faker.helpers.weightedArrayElement([
    { weight: 60, value: Event_Status.SCHEDULED },
    { weight: 20, value: Event_Status.UNCONFIRMED },
    { weight: 12, value: Event_Status.CONFIRMED },
    { weight: 8, value: Event_Status.DONE }
  ]);

export const generateConflictStatus = (faker: Faker): Conflict_Status =>
  faker.helpers.weightedArrayElement([
    { weight: 85, value: Conflict_Status.NO_CONFLICT },
    { weight: 10, value: Conflict_Status.PENDING },
    { weight: 5, value: Conflict_Status.APPROVED }
  ]);

export const generateScheduleSlotTimes = (faker: Faker, baseDate: Date): { startTime: Date; endTime: Date } => {
  const startTime = new Date(baseDate);
  startTime.setHours(faker.number.int({ min: 9, max: 20 }), faker.helpers.arrayElement([0, 30]), 0, 0);

  const durationHours = faker.helpers.weightedArrayElement([
    { weight: 50, value: 1 },
    { weight: 30, value: 2 },
    { weight: 15, value: 1.5 },
    { weight: 5, value: 3 }
  ]);

  const endTime = new Date(startTime);
  endTime.setTime(endTime.getTime() + durationHours * 60 * 60 * 1000);

  return { startTime, endTime };
};

export const eventCreateInput = (
  title: string,
  userCreatedId: string,
  eventTypeId: string,
  status: Event_Status,
  approved: Conflict_Status,
  initialDateScheduled: Date,
  location: string | null,
  zoomLink: string | null,
  description: string | null,
  questionDocumentLink: string | null,
  approvalRequiredFromUserId?: string
): Prisma.EventCreateInput => ({
  title,
  status,
  approved,
  initialDateScheduled,
  calendarEventIds: [],
  userCreated: { connect: { userId: userCreatedId } },
  eventType: { connect: { eventTypeId } },
  ...(location ? { location } : {}),
  ...(zoomLink ? { zoomLink } : {}),
  ...(description ? { description } : {}),
  ...(questionDocumentLink ? { questionDocumentLink } : {}),
  ...(approvalRequiredFromUserId ? { approvalRequiredBy: { connect: { userId: approvalRequiredFromUserId } } } : {})
});

export const scheduleSlotCreateInput = (
  eventId: string,
  startTime: Date,
  endTime: Date,
  allDay: boolean = false
): Prisma.Schedule_SlotCreateInput => ({
  startTime,
  endTime,
  allDay,
  event: { connect: { eventId } }
});

export const documentCreateInput = (eventId: string, createdByUserId: string): Prisma.DocumentCreateInput => ({
  googleFileId: `${faker.string.alphanumeric(33)}`,
  name: `document-${faker.string.uuid()}.pdf`,
  createdBy: { connect: { userId: createdByUserId } },
  documentEvent: { connect: { eventId } }
});

export const meetingAttendanceCreateInput = (
  organizationId: string,
  teamId: string,
  userCreatedId: string,
  attendeeIds: string[]
): Prisma.Meeting_AttendanceCreateInput => ({
  slackChannelId: `C${faker.string.alphanumeric(10).toUpperCase()}`,
  slackMessageTimestamp: `${Math.floor(faker.date.past({ years: 1 }).getTime() / 1000)}.${faker.string.numeric(6)}`,
  organization: { connect: { organizationId } },
  team: { connect: { teamId } },
  userCreated: { connect: { userId: userCreatedId } },
  attendees: { connect: attendeeIds.map((userId) => ({ userId })) }
});
