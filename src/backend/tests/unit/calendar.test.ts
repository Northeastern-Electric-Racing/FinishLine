import { Calendar, Organization, User } from '@prisma/client';
import CalendarService from '../../src/services/calendar.services';
import {
  AccessDeniedAdminOnlyException,
  InvalidOrganizationException,
  NotFoundException
} from '../../src/utils/errors.utils';
import { batmanAppAdmin, wonderwomanGuest, supermanAdmin, theVisitorGuest, alfred } from '../test-data/users.test-data';
import { createTestOrganization, createTestUser, resetUsers } from '../test-utils';
import prisma from '../../src/prisma/prisma';
import { EventType, Shop } from 'shared';

describe('Calendar Tests', () => {
  let orgId: string;
  let organization: Organization;
  let adminUser: User;
  let calendar: Calendar;
  let shop: Shop;
  //let machinery: Machinery;
  let shopId: string;

  beforeEach(async () => {
    organization = await createTestOrganization();
    orgId = organization.organizationId;
    adminUser = await createTestUser(batmanAppAdmin, orgId);

    calendar = await prisma.calendar.create({
      data: {
        name: 'Engineering Team Calendar',
        description: 'Tracks all engineering team events, meetings, and deadlines.',
        colorHexCode: '#3498db',
        userCreated: { connect: { userId: adminUser.userId } },
        dateCreated: new Date(),
        organization: { connect: { organizationId: organization.organizationId } }
      }
    });

    shop = await CalendarService.createShop(
      adminUser,
      'Precision Manufacturing Lab',
      'Manufacturing facility equipped with advanced machinery and tools for engineering',
      organization
    );
    ({ shopId } = shop);

    /*
    machinery = await CalendarService.createMachinery(
      adminUser,
      'Original Machinery Name',
      shop.shopId,
      1,
      organization,
      'Original description'
    );
    */
  });

  afterEach(async () => {
    await resetUsers();
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
        await createTestUser(supermanAdmin, orgId),
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
            shop.shopId,
            1,
            organization
          )
      ).rejects.toThrow(new AccessDeniedAdminOnlyException('create machinery'));
    });

    it('Succeeds and creates machinery', async () => {
      const result = await CalendarService.createMachinery(
        await createTestUser(supermanAdmin, orgId),
        'Iron Man Mark 42 CNC Mill',
        shop.shopId,
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
        const admin = await createTestUser(supermanAdmin, orgId);

        const result = await CalendarService.createShop(admin, 'Demo Shop', 'A seeded demo shop', organization);

        expect(result.name).toBe('Demo Shop');
        expect(result.description).toBe('A seeded demo shop');
        expect(result.userCreated.userId).toBe(admin.userId);
      });

      it('fails on duplicate name', async () => {
        await CalendarService.createShop(await createTestUser(supermanAdmin, orgId), 'UniqueName', 'first', organization);

        await expect(
          CalendarService.createShop(await createTestUser(alfred, orgId), 'UniqueName', 'second attempt', organization)
        ).rejects.toBeTruthy();
      });
    });
  });

  describe('Delete shop', () => {
    it('fails if user is not head or above', async () => {
      await expect(
        CalendarService.deleteShop(await createTestUser(wonderwomanGuest, orgId), shop.shopId, organization)
      ).rejects.toBeInstanceOf(AccessDeniedAdminOnlyException);
    });
    it('succeeds for admin', async () => {
      const result = await CalendarService.deleteShop(adminUser, shop.shopId, organization);
      expect(result.shopId).toBe(shop.shopId);
      // verify soft delete happened
      const row = await prisma.shop.findUnique({ where: { shopId } });
      expect(row?.dateDeleted).not.toBeNull();
    });
    it('fails if shop does not exist', async () => {
      await expect(CalendarService.deleteShop(adminUser, 'non-existent-id', organization)).rejects.toBeInstanceOf(
        NotFoundException
      );
    });
    it('fails if shop is already deleted', async () => {
      await CalendarService.deleteShop(adminUser, shop.shopId, organization);
      await expect(CalendarService.deleteShop(adminUser, shop.shopId, organization)).rejects.toBeInstanceOf(
        NotFoundException
      );
    });
    it('also deletes associated shopMachinery bridge rows', async () => {
      // create a machinery that links to this shop
      await CalendarService.createMachinery(adminUser, 'Bridge-Linked', shop.shopId, 1, organization);
      //confirm the bridge row exists before delete
      const before = await prisma.shopMachinery.count({ where: { shopId } });
      expect(before).toBeGreaterThan(0);
      // delete shop
      await CalendarService.deleteShop(adminUser, shop.shopId, organization);
      // the bridge should be cleaned up
      const after = await prisma.shopMachinery.count({ where: { shopId } });
      expect(after).toBe(0);
      // the shop should be soft-deleted
      const deletedShop = await prisma.shop.findUnique({ where: { shopId } });
      expect(deletedShop?.dateDeleted).not.toBeNull();
    });
    it('fails if shop belongs to a different organization', async () => {
      const otherOrg = await prisma.organization.create({
        data: {
          name: 'Other Org (calendar test)',
          description: 'for cross-org negative case',
          applicationLink: '',
          userCreated: { connect: { userId: adminUser.userId } }
        }
      });
      const AdminInOtherOrg = await createTestUser(alfred, otherOrg.organizationId);
      await expect(CalendarService.deleteShop(AdminInOtherOrg, shop.shopId, otherOrg)).rejects.toThrow(
        new InvalidOrganizationException('Shop')
      );
    });
  });

  describe('Main Calendar Tests', () => {
    describe('create calendar', () => {
      it('fails if user is not an admin', async () => {
        await expect(
          CalendarService.createCalendar(
            await createTestUser(wonderwomanGuest, orgId),
            'Non-Admin Calendar',
            'desc',
            '#3498DB',
            organization
          )
        ).rejects.toThrow(new AccessDeniedAdminOnlyException('create calendar'));
      });
      it('succeeds for admin', async () => {
        const result = await CalendarService.createCalendar(
          adminUser,
          'Cool Calendar',
          'A very cool calendar',
          '#3498DB',
          organization
        );
        expect(result.name).toBe('Cool Calendar');
        expect(result.description).toBe('A very cool calendar');
        expect(result.color).toBe('#3498DB');
        expect(result.userCreated.userId).toBe(adminUser.userId);
      });
      it('fails on duplicate name', async () => {
        await CalendarService.createCalendar(adminUser, 'Cool Calendar', 'A very cool calendar', '#3498DB', organization);
        await expect(
          CalendarService.createCalendar(
            adminUser,
            'Cool Calendar',
            'A very cool calendar, but not quite as cool',
            '#0062a3ff',
            organization
          )
        ).rejects.toBeTruthy();
      });
    });
  });
  describe('Edit EventType', () => {
    let eventType: EventType;

    beforeEach(async () => {
      eventType = await CalendarService.createEventType(
        adminUser,
        'Initial Event Type',
        [calendar.calendarId],
        organization,
        true,
        false,
        true,
        true,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        false,
        true
      );
    });

    it('fails if user is not an admin', async () => {
      const guest = await createTestUser(wonderwomanGuest, orgId);
      await expect(
        CalendarService.editEventType(
          eventType.eventTypeId,
          guest,
          [calendar.calendarId],
          organization,
          false,
          false,
          false,
          false,
          false,
          false,
          false,
          false,
          false,
          false,
          false,
          false,
          false
        )
      ).rejects.toThrow(new AccessDeniedAdminOnlyException('edit event type'));
    });

    it('fails if any provided calendar does not exist', async () => {
      const invalidCalendarId = 'non-existent-calendar-id';
      await expect(
        CalendarService.editEventType(
          eventType.eventTypeId,
          adminUser,
          [invalidCalendarId],
          organization,
          true,
          true,
          true,
          true,
          true,
          true,
          true,
          true,
          true,
          true,
          true,
          true,
          true
        )
      ).rejects.toThrow(new NotFoundException('Calendar', invalidCalendarId));
    });

    it('fails if a calendar belongs to a different organization', async () => {
      const otherOrg = await prisma.organization.create({
        data: {
          name: 'Different Org',
          description: 'for invalid org calendar case',
          applicationLink: '',
          userCreated: { connect: { userId: adminUser.userId } }
        }
      });

      const foreignCalendar = await prisma.calendar.create({
        data: {
          name: 'Foreign Calendar',
          description: 'Calendar from another org',
          colorHexCode: '#ff0000',
          userCreatedId: adminUser.userId,
          organizationId: otherOrg.organizationId
        }
      });

      await expect(
        CalendarService.editEventType(
          eventType.eventTypeId,
          adminUser,
          [foreignCalendar.calendarId],
          organization,
          true,
          false,
          false,
          false,
          false,
          false,
          false,
          false,
          false,
          false,
          false,
          false,
          false
        )
      ).rejects.toThrow(new InvalidOrganizationException('Calendar'));
    });

    it('fails if event type does not exist', async () => {
      const nonExistentId = 'non-existent-event-type-id';
      await expect(
        CalendarService.editEventType(
          nonExistentId,
          adminUser,
          [calendar.calendarId],
          organization,
          true,
          false,
          true,
          true,
          false,
          false,
          true,
          false,
          false,
          false,
          false,
          false,
          true
        )
      ).rejects.toThrow(new NotFoundException('Event Type', nonExistentId));
    });

    it('succeeds and updates event type fields', async () => {
      const result = await CalendarService.editEventType(
        eventType.eventTypeId,
        adminUser,
        [calendar.calendarId],
        organization,
        false,
        true,
        false,
        true,
        true,
        true,
        false,
        true,
        true,
        true,
        false,
        true,
        false
      );

      expect(result.eventTypeId).toBe(eventType.eventTypeId);
      expect(result.recurring).toBe(true);
      expect(result.initialDateScheduled).toBe(false);
      expect(result.location).toBe(true);
      expect(result.zoomLink).toBe(true);
      expect(result.description).toBe(false);
    });
  });
});
