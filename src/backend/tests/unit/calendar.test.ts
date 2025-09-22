import { Calendar, Organization } from '@prisma/client';
import CalendarService from '../../src/services/calendar.services';
import { AccessDeniedAdminOnlyException } from '../../src/utils/errors.utils';
import { batmanAppAdmin, wonderwomanGuest, supermanAdmin } from '../test-data/users.test-data';
import { createTestOrganization, createTestUser, resetUsers } from '../test-utils';
import prisma from '../../src/prisma/prisma';

describe('Calendar Tests', () => {
  let orgId: string;
  let organization: Organization;
  let calendar: Calendar;

  beforeEach(async () => {
    organization = await createTestOrganization();
    orgId = organization.organizationId;
    calendar = await prisma.calendar.create({
      data: {
        name: 'Engineering Team Calendar',
        description: 'Tracks all engineering team events, meetings, and deadlines.',
        colorHexCode: '#3498db',
        userCreated: { connect: { userId: (await createTestUser(supermanAdmin, orgId)).userId } },
        dateCreated: new Date()
      }
    });
  });

  afterEach(async () => {
    await resetUsers();
  });

  describe('Create EventType', () => {
    it('Fails if user is not an admin', async () => {
      await expect(
        async () =>
          await CalendarService.createEventType(
            await createTestUser(wonderwomanGuest, orgId),
            'Team Meeting',
            [calendar.calendarId],
            organization,
            true,
            true,
            true,
            true,
            true,
            true,
            false,
            false,
            false,
            true,
            true,
            false,
            true
          )
      ).rejects.toThrow(new AccessDeniedAdminOnlyException('create event type'));
    });

    it('Succeeds and creates an event type', async () => {
      const result = await CalendarService.createEventType(
        await createTestUser(batmanAppAdmin, orgId),
        'Team Meeting',
        [],
        organization,
        true,
        false,
        true,
        true,
        true,
        false,
        true,
        false,
        false,
        false,
        false,
        false,
        true
      );

      expect(result.name).toEqual('Team Meeting');
      expect(result.initialDateScheduled).toBe(true);
      expect(result.recurring).toBe(false);
      expect(result.allDay).toBe(true);
      expect(result.members).toBe(true);
      expect(result.location).toBe(true);
      expect(result.zoomLink).toBe(false);
      expect(result.availability).toBe(true);
      expect(result.shop).toBe(false);
      expect(result.machinery).toBe(false);
      expect(result.workPackage).toBe(false);
      expect(result.questionDocument).toBe(false);
      expect(result.documents).toBe(false);
      expect(result.description).toBe(true);
    });
  });

  describe('Create Calendar', () => {
    it('Fails if user is not an admin', async () => {
      const guestUser = await createTestUser(wonderwomanGuest, orgId);

      await expect(
        async () =>
          await CalendarService.createCalendar(guestUser, 'Test Calendar', 'A test calendar', '#FF5733', organization)
      ).rejects.toThrow(new AccessDeniedAdminOnlyException('create calendar'));
    });

    it('Succeeds and creates a calendar with all fields', async () => {
      const adminUser = await createTestUser(batmanAppAdmin, orgId);

      const result = await CalendarService.createCalendar(
        adminUser,
        'New Test Calendar',
        'Calendar for testing purposes',
        '#10B981',
        organization
      );

      expect(result.name).toEqual('New Test Calendar');
      expect(result.description).toEqual('Calendar for testing purposes');
      expect(result.colorHexCode).toEqual('#10B981');
      expect(result.userCreatedId).toEqual(adminUser.userId);
      expect(result.calendarId).toBeDefined();
      expect(result.dateCreated).toBeDefined();
    });

    it('Succeeds and creates a calendar without description', async () => {
      const adminUser = await createTestUser(supermanAdmin, orgId);

      const result = await CalendarService.createCalendar(
        adminUser,
        'Calendar Without Description',
        undefined,
        '#EF4444',
        organization
      );

      expect(result.name).toEqual('Calendar Without Description');
      expect(result.description).toBe('');
      expect(result.colorHexCode).toEqual('#EF4444');
      expect(result.userCreatedId).toEqual(adminUser.userId);
    });

    it('Validates hex color format', async () => {
      const adminUser = await createTestUser(batmanAppAdmin, orgId);

      await expect(
        async () =>
          await CalendarService.createCalendar(
            adminUser,
            'Invalid Color Calendar',
            'A test calendar',
            'invalid-color',
            organization
          )
      ).rejects.toThrow();
    });

    it('Handles empty name validation', async () => {
      const adminUser = await createTestUser(supermanAdmin, orgId);

      await expect(
        async () => await CalendarService.createCalendar(adminUser, '', 'A test calendar', '#8B5CF6', organization)
      ).rejects.toThrow();
    });
  });
});

//commit again
