import { Calendar, Organization } from '@prisma/client';
import CalendarService from '../../src/services/calendar.services';
import {
  AccessDeniedAdminOnlyException,
  AccessDeniedException,
  DeletedException,
  NotFoundException
} from '../../src/utils/errors.utils';
import {
  batmanAppAdmin,
  wonderwomanGuest,
  supermanAdmin,
  flashAdmin,
  theVisitorGuest,
  alfred,
  greenlanternHead
} from '../test-data/users.test-data';
import { createTestOrganization, createTestUser, resetUsers } from '../test-utils';
import prisma from '../../src/prisma/prisma';

describe('Calendar Tests', () => {
  let orgId: string;
  let organization: Organization;
  let calendar: Calendar;
  let shopId: string;

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

    const shop = await prisma.shop.create({
      data: {
        name: 'Precision Manufacturing Lab',
        description: 'Manufacturing facility equipped with advanced machinery and tools for engineering',
        userCreatedId: (await createTestUser(flashAdmin, orgId)).userId,
        organizationId: orgId
      }
    });
    ({ shopId } = shop);
  });

  afterEach(async () => {
    await resetUsers();
  });

  describe('delete calendar', () => {
    it('fails if user is not a head or admin', async () => {
      const member = await createTestUser(wonderwomanGuest, orgId);

      const calendar = await prisma.calendar.create({
        data: {
          name: 'Test Calendar',
          description: 'Test',
          colorHexCode: '#000000',
          userCreatedId: member.userId,
          organizationId: orgId
        }
      });

      await expect(CalendarService.deleteCalendar(member, calendar.calendarId, organization)).rejects.toThrow(
        new AccessDeniedException('Only admins can delete calendars')
      );
    });

    it('succeeds for admin', async () => {
      const admin = await createTestUser(batmanAppAdmin, orgId);

      const calendar = await prisma.calendar.create({
        data: {
          name: 'Admin Delete Calendar',
          description: 'Test',
          colorHexCode: '#00FF00',
          userCreatedId: admin.userId,
          organizationId: orgId
        }
      });

      const result = await CalendarService.deleteCalendar(admin, calendar.calendarId, organization);

      expect(result.calendarId).toBe(calendar.calendarId);
      expect(result.name).toBe('Admin Delete Calendar');
      expect(result.description).toBe('Test');
      expect(result.color).toBe('#00FF00');
      expect(result.userCreated.userId).toBe(admin.userId);
    });

    it('fails if calendar not found', async () => {
      const admin = await createTestUser(batmanAppAdmin, orgId);

      await expect(CalendarService.deleteCalendar(admin, 'non-existent-id', organization)).rejects.toThrow(
        new NotFoundException('Calendar', 'non-existent-id')
      );
    });

    it('fails if calendar already deleted', async () => {
      const admin = await createTestUser(batmanAppAdmin, orgId);

      const calendar = await prisma.calendar.create({
        data: {
          name: 'Already Deleted',
          description: 'Test',
          colorHexCode: '#0000FF',
          userCreatedId: admin.userId,
          organizationId: orgId,
          dateDeleted: new Date() // Already deleted
        }
      });

      await expect(CalendarService.deleteCalendar(admin, calendar.calendarId, organization)).rejects.toThrow(
        new DeletedException('Calendar', calendar.calendarId)
      );
    });
  });

  describe('Create EventType', () => {
    it('Fails if user is not an admin', async () => {
      await expect(
        async () =>
          await CalendarService.createEventType(
            await createTestUser(theVisitorGuest, orgId),
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

  describe('Create Machinery', () => {
    it('Fails if user is not an admin', async () => {
      await expect(
        async () =>
          await CalendarService.createMachinery(
            await createTestUser(wonderwomanGuest, orgId),
            'Captain America Shield Press',
            shopId,
            1,
            organization
          )
      ).rejects.toThrow(new AccessDeniedAdminOnlyException('create machinery'));
    });

    it('Succeeds and creates machinery', async () => {
      const result = await CalendarService.createMachinery(
        await createTestUser(alfred, orgId),
        'Iron Man Mark 42 CNC Mill',
        shopId,
        2,
        organization
      );

      expect(result.name).toEqual('Iron Man Mark 42 CNC Mill');
      expect(result.shops).toHaveLength(1);
      expect(result.shops[0].quantity).toBe(2);
      expect(result.shops[0].shop.name).toBe('Precision Manufacturing Lab');
      expect(result.shops[0].description).toBe(undefined);
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
