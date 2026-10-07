import { Calendar, Organization, User } from '@prisma/client';
import { vi } from 'vitest';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';
import { EventType } from 'shared';
import { createTestOrganization, createTestUser, resetUsers } from '../test-utils';
import { batmanAppAdmin, wonderwomanGuest, robinMember } from '../test-data/users.test-data';
import UsersService from '../../src/services/users.services';
import CalendarService from '../../src/services/calendar.services';
import prisma from '../../src/prisma/prisma';
import { encrypt } from '../../src/utils/encryption.utils';
import { AccessDeniedException } from '../../src/utils/errors.utils';

dayjs.extend(utc);
dayjs.extend(timezone);

const BUSINESS_TIMEZONE = 'America/New_York';

// avoids a real DNS lookup in validateIcsUrl's SSRF host check - resolves to an arbitrary public address
vi.mock('node:dns/promises', () => ({
  default: { lookup: vi.fn().mockResolvedValue([{ address: '93.184.216.34', family: 4 }]) }
}));

describe('Get User Busy Times', () => {
  let organization: Organization;
  let orgId: string;
  let adminUser: User;
  let eventType: EventType;
  let calendar: Calendar;

  // range covers exactly one UTC day
  const startDate = new Date(Date.UTC(2026, 6, 20));
  const endDate = new Date(Date.UTC(2026, 6, 21));
  // Eastern-time components so it lines up with the Eastern-midnight day boundary busyIntervalsToSlots computes
  const localAt = (hour: number): Date => dayjs.tz('2026-07-20', BUSINESS_TIMEZONE).add(hour, 'hour').toDate();

  beforeEach(async () => {
    organization = await createTestOrganization();
    orgId = organization.organizationId;
    adminUser = await createTestUser(batmanAppAdmin, orgId);

    calendar = await prisma.calendar.create({
      data: {
        name: 'Test Calendar',
        description: 'For busy-time tests',
        colorHexCode: '#123456',
        userCreated: { connect: { userId: adminUser.userId } },
        dateCreated: new Date(),
        organization: { connect: { organizationId: orgId } }
      }
    });

    eventType = await CalendarService.createEventType(
      adminUser,
      'Test Meeting',
      [calendar.calendarId],
      organization,
      true, // requiredMembers
      true, // optionalMembers
      true, // teams
      false, // teamType
      false, // location
      false, // zoomLink
      false, // shop
      false, // machinery
      false, // workPackage
      false, // questionDocument
      false, // documents
      false, // description
      false, // onlyHeadsOrAbove
      false, // requiresConfirmation
      false // sendSlackNotifications
    );
  });

  afterEach(async () => {
    vi.unstubAllGlobals();
    await resetUsers();
  });

  it('throws access denied when the submitter is not the target user', async () => {
    const target = await createTestUser(wonderwomanGuest, orgId);
    const other = await createTestUser(robinMember, orgId);

    await expect(UsersService.getUserBusyTimes(target.userId, other, startDate, endDate, organization)).rejects.toThrow(
      AccessDeniedException
    );
  });

  it('returns no busy slots when the user has no ICS calendar and no Finishline events', async () => {
    const target = await createTestUser(wonderwomanGuest, orgId);

    const busy = await UsersService.getUserBusyTimes(target.userId, target, startDate, endDate, organization);

    expect(busy).toEqual([]);
  });

  it('marks time busy from a Finishline event where the user is a required member', async () => {
    const target = await createTestUser(wonderwomanGuest, orgId);

    await CalendarService.createEvent(
      adminUser,
      'Required Meeting',
      eventType.eventTypeId,
      organization,
      [target.userId],
      [],
      [],
      [],
      [],
      [],
      [{ startTime: localAt(10), endTime: localAt(11), allDay: false }],
      undefined,
      []
    );

    const busy = await UsersService.getUserBusyTimes(target.userId, target, startDate, endDate, organization);

    expect(busy).toHaveLength(1);
    expect(busy[0].busySlots).toEqual([0]);
  });

  it('marks time busy from a Finishline event where the user is an optional member', async () => {
    const target = await createTestUser(wonderwomanGuest, orgId);

    await CalendarService.createEvent(
      adminUser,
      'Optional Meeting',
      eventType.eventTypeId,
      organization,
      [],
      [target.userId],
      [],
      [],
      [],
      [],
      [{ startTime: localAt(11), endTime: localAt(12), allDay: false }],
      undefined,
      []
    );

    const busy = await UsersService.getUserBusyTimes(target.userId, target, startDate, endDate, organization);

    expect(busy[0].busySlots).toEqual([1]);
  });

  it("marks time busy from a Finishline event via the user's team membership", async () => {
    const target = await createTestUser(wonderwomanGuest, orgId);

    const teamType = await prisma.team_Type.create({
      data: { name: 'Test Division', description: 'a division', iconName: 'gear', organizationId: orgId }
    });
    const team = await prisma.team.create({
      data: {
        teamName: 'Test Team',
        slackId: 'team-slack',
        description: 'a team',
        financeTeam: false,
        headId: adminUser.userId,
        teamTypeId: teamType.teamTypeId,
        organizationId: orgId,
        members: { connect: { userId: target.userId } }
      }
    });

    await CalendarService.createEvent(
      adminUser,
      'Team Meeting',
      eventType.eventTypeId,
      organization,
      [],
      [],
      [team.teamId],
      [],
      [],
      [],
      [{ startTime: localAt(14), endTime: localAt(15), allDay: false }],
      undefined,
      []
    );

    const busy = await UsersService.getUserBusyTimes(target.userId, target, startDate, endDate, organization);

    expect(busy[0].busySlots).toEqual([4]);
  });

  it('merges ICS calendar busy times with Finishline event busy times on the same day', async () => {
    const target = await createTestUser(wonderwomanGuest, orgId);

    await prisma.schedule_Settings.create({
      data: {
        personalGmail: 'diana@gmail.com',
        personalZoomLink: 'https://zoom.us/j/diana',
        importedIcsCalendarUrl: encrypt('https://example.com/diana-calendar.ics'),
        userId: target.userId
      }
    });

    const icsText = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//test//test//EN',
      'BEGIN:VEVENT',
      'UID:test-event-1@example.com',
      'DTSTAMP:20260701T000000Z',
      'DTSTART;TZID=America/New_York:20260720T160000',
      'DTEND;TZID=America/New_York:20260720T170000',
      'SUMMARY:External Meeting',
      'END:VEVENT',
      'END:VCALENDAR',
      ''
    ].join('\r\n');

    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        text: async () => icsText
      })
    );

    await CalendarService.createEvent(
      adminUser,
      'Finishline Meeting',
      eventType.eventTypeId,
      organization,
      [target.userId],
      [],
      [],
      [],
      [],
      [],
      [{ startTime: localAt(10), endTime: localAt(11), allDay: false }],
      undefined,
      []
    );

    const busy = await UsersService.getUserBusyTimes(target.userId, target, startDate, endDate, organization);

    expect(busy).toHaveLength(1);
    expect([...busy[0].busySlots].sort()).toEqual([0, 6]);
  });
});
