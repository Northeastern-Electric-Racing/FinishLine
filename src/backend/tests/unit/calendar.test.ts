import { Calendar, Organization, User } from '@prisma/client';
import CalendarService from '../../src/services/calendar.services';
import {
  AccessDeniedAdminOnlyException,
  AccessDeniedException,
  DeletedException,
  NotFoundException,
  InvalidOrganizationException
} from '../../src/utils/errors.utils';
import { batmanAppAdmin, wonderwomanGuest, supermanAdmin, theVisitorGuest, alfred } from '../test-data/users.test-data';
import { createTestOrganization, createTestUser, resetUsers } from '../test-utils';
import prisma from '../../src/prisma/prisma';
import { EventType, Machinery, Shop } from 'shared';

describe('Calendar Tests', () => {
  let orgId: string;
  let organization: Organization;
  let adminUser: User;
  let calendar: Calendar;
  let shop: Shop;
  let machinery: Machinery;
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

    machinery = await CalendarService.createMachinery(
      adminUser,
      'Original Machinery Name',
      shop.shopId,
      1,
      organization,
      'Original description'
    );
  });

  afterEach(async () => {
    await resetUsers();
  });

  describe('edit calendar', () => {
    it('fails if user is not an admin', async () => {
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

      await expect(
        CalendarService.editCalendar(
          member,
          calendar.calendarId,
          'Updated Name',
          'Updated Description',
          '#FF0000',
          organization
        )
      ).rejects.toThrow(new AccessDeniedException('Only admins can edit calendars'));
    });

    it('succeeds for admin', async () => {
      const calendar = await prisma.calendar.create({
        data: {
          name: 'Original Calendar',
          description: 'Original Description',
          colorHexCode: '#00FF00',
          userCreatedId: adminUser.userId,
          organizationId: orgId
        }
      });

      const result = await CalendarService.editCalendar(
        adminUser,
        calendar.calendarId,
        'Updated Calendar',
        'Updated Description',
        '#0000FF',
        organization
      );

      expect(result.calendarId).toBe(calendar.calendarId);
      expect(result.name).toBe('Updated Calendar');
      expect(result.description).toBe('Updated Description');
      expect(result.color).toBe('#0000FF');
    });

    it('fails if calendar not found', async () => {
      await expect(
        CalendarService.editCalendar(
          adminUser,
          'non-existent-id',
          'Updated Name',
          'Updated Description',
          '#FF0000',
          organization
        )
      ).rejects.toThrow(new NotFoundException('Calendar', 'non-existent-id'));
    });

    it('fails if calendar already deleted', async () => {
      const calendar = await prisma.calendar.create({
        data: {
          name: 'Already Deleted',
          description: 'Test',
          colorHexCode: '#0000FF',
          userCreatedId: adminUser.userId,
          organizationId: orgId,
          dateDeleted: new Date()
        }
      });

      await expect(
        CalendarService.editCalendar(
          adminUser,
          calendar.calendarId,
          'Updated Name',
          'Updated Description',
          '#FF0000',
          organization
        )
      ).rejects.toThrow(new DeletedException('Calendar', calendar.calendarId));
    });
  });

  describe('delete calendar', () => {
    it('fails if user is not an admin', async () => {
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
      const calendar = await prisma.calendar.create({
        data: {
          name: 'Admin Delete Calendar',
          description: 'Test',
          colorHexCode: '#00FF00',
          userCreatedId: adminUser.userId,
          organizationId: orgId
        }
      });

      const result = await CalendarService.deleteCalendar(adminUser, calendar.calendarId, organization);

      expect(result.calendarId).toBe(calendar.calendarId);
      expect(result.name).toBe('Admin Delete Calendar');
      expect(result.description).toBe('Test');
      expect(result.color).toBe('#00FF00');
      expect(result.userCreated.userId).toBe(adminUser.userId);
    });

    it('fails if calendar not found', async () => {
      await expect(CalendarService.deleteCalendar(adminUser, 'non-existent-id', organization)).rejects.toThrow(
        new NotFoundException('Calendar', 'non-existent-id')
      );
    });

    it('fails if calendar already deleted', async () => {
      const calendar = await prisma.calendar.create({
        data: {
          name: 'Already Deleted',
          description: 'Test',
          colorHexCode: '#0000FF',
          userCreatedId: adminUser.userId,
          organizationId: orgId,
          dateDeleted: new Date() // Already deleted
        }
      });

      await expect(CalendarService.deleteCalendar(adminUser, calendar.calendarId, organization)).rejects.toThrow(
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

  describe('Edit Machinery', () => {
    it('Fails if user is not a head or above', async () => {
      await expect(
        async () =>
          await CalendarService.editMachinery(
            await createTestUser(wonderwomanGuest, orgId),
            machinery.machineryId,
            'Updated Machinery Name',
            shop.shopId,
            2,
            organization,
            'Updated description'
          )
      ).rejects.toThrow(new AccessDeniedException('Only heads and above can edit machinery'));
    });

    it('Fails if machinery does not exist', async () => {
      const nonExistentId = 'non-existent-id';
      await expect(
        async () =>
          await CalendarService.editMachinery(
            await createTestUser(supermanAdmin, orgId),
            nonExistentId,
            'Updated Machinery Name',
            shop.shopId,
            2,
            organization,
            'Updated description'
          )
      ).rejects.toThrow(new NotFoundException('Machinery', nonExistentId));
    });

    it('Fails if shop does not exist', async () => {
      const nonExistentShopId = 'non-existent-shop-id';
      await expect(
        async () =>
          await CalendarService.editMachinery(
            await createTestUser(supermanAdmin, orgId),
            machinery.machineryId,
            'Updated Machinery Name',
            nonExistentShopId,
            2,
            organization,
            'Updated description'
          )
      ).rejects.toThrow(new NotFoundException('Shop', nonExistentShopId));
    });

    it('Succeeds and updates machinery for head user', async () => {
      const result = await CalendarService.editMachinery(
        await createTestUser(supermanAdmin, orgId),
        machinery.machineryId,
        'Updated Machinery Name',
        shop.shopId,
        3,
        organization,
        'Updated description'
      );

      expect(result.name).toEqual('Updated Machinery Name');
      expect(result.shops).toHaveLength(1);
      expect(result.shops[0].quantity).toBe(3);
      expect(result.shops[0].description).toBe('Updated description');
      expect(result.shops[0].shop.name).toBe('Precision Manufacturing Lab');
    });

    it('Succeeds and updates machinery for admin user', async () => {
      const result = await CalendarService.editMachinery(
        await createTestUser(supermanAdmin, orgId),
        machinery.machineryId,
        'Admin Updated Machinery',
        shop.shopId,
        5,
        organization,
        'Admin updated description'
      );

      expect(result.name).toEqual('Admin Updated Machinery');
      expect(result.shops).toHaveLength(1);
      expect(result.shops[0].quantity).toBe(5);
      expect(result.shops[0].description).toBe('Admin updated description');
      expect(result.shops[0].shop.name).toBe('Precision Manufacturing Lab');
    });

    it('Succeeds and updates machinery without description', async () => {
      const result = await CalendarService.editMachinery(
        await createTestUser(supermanAdmin, orgId),
        machinery.machineryId,
        'No Description Machinery',
        shop.shopId,
        2,
        organization,
        undefined
      );

      expect(result.name).toEqual('No Description Machinery');
      expect(result.shops).toHaveLength(1);
      expect(result.shops[0].quantity).toBe(2);
      expect(result.shops[0].description).toBe('Original description'); // Original description should remain unchanged
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

  describe('Shop: edit', () => {
    it('fails if user is not admin', async () => {
      const created = await CalendarService.createShop(adminUser, 'Shop A', 'Desc A', organization);
      await expect(
        CalendarService.editShop(
          await createTestUser(wonderwomanGuest, orgId),
          created.shopId,
          'New Name',
          'New Desc',
          organization
        )
      ).rejects.toBeInstanceOf(AccessDeniedAdminOnlyException);
    });

    it('succeeds for admin', async () => {
      const created = await CalendarService.createShop(adminUser, 'Shop B', 'Desc B', organization);
      const updated = await CalendarService.editShop(
        adminUser,
        created.shopId,
        'Updated Shop Name',
        'Updated Description',
        organization
      );
      expect(updated.shopId).toBe(created.shopId);
      expect(updated.name).toBe('Updated Shop Name');
      expect(updated.description).toBe('Updated Description');
      expect(updated.userCreated.userId).toBe(created.userCreated.userId);
      expect(updated.dateCreated).toBeTruthy();
    });

    it('fails if shop does not exist', async () => {
      await expect(
        CalendarService.editShop(adminUser, 'non-existent-id', 'Name', 'Desc', organization)
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('fails if shop belongs to a different org', async () => {
      // clone the real org but with a different ID
      const otherOrganization: Organization = { ...organization, organizationId: 'some-other-org-id' };

      await expect(
        CalendarService.editShop(adminUser, shop.shopId, 'Updated Shop Name', 'Updated Description', otherOrganization)
      ).rejects.toThrow(new InvalidOrganizationException('Shop'));
    });

    it('fails if shop is soft-deleted', async () => {
      const created = await CalendarService.createShop(adminUser, 'Shop D', 'Desc D', organization);
      await CalendarService.deleteShop(adminUser, created.shopId, organization);
      await expect(CalendarService.editShop(adminUser, created.shopId, 'X', 'Y', organization)).rejects.toBeInstanceOf(
        DeletedException
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
