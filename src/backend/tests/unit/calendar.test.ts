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
        dateCreated: new Date(),
        organization: { connect: { organizationId: organization.organizationId } }
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
  describe('Shop Tests', () => {
    describe('create shop', () => {
      it('fails if user is not an admin', async () => {
        await expect(
          CalendarService.createShop(await createTestUser(wonderwomanGuest, orgId), 'Non-Admin Shop', 'desc', organization)
        ).rejects.toThrow(new AccessDeniedAdminOnlyException('create shop'));
      });

      it('succeeds for admin', async () => {
        // Using a different admin fixture to avoid googleAuthId collision with the calendar creator
        const admin = await createTestUser(batmanAppAdmin, orgId);

        const result = await CalendarService.createShop(admin, 'Demo Shop', 'A seeded demo shop', organization);

        expect(result.name).toBe('Demo Shop');
        expect(result.description).toBe('A seeded demo shop');
        expect(result.userCreated.userId).toBe(admin.userId);
      });

      it('fails on duplicate name', async () => {
        const admin = await createTestUser(batmanAppAdmin, orgId);
        await CalendarService.createShop(admin, 'UniqueName', 'first', organization);

        await expect(CalendarService.createShop(admin, 'UniqueName', 'second attempt', organization)).rejects.toBeTruthy();
      });
    });
  });
});
