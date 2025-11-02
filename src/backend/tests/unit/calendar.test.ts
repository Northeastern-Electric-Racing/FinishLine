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
import { DayOfWeek, EventType, Machinery, ScheduleSlot, ScheduleSlotCreateArgs, Shop, Event } from 'shared';

describe('Calendar Tests', () => {
  let orgId: string;
  let organization: Organization;
  let adminUser: User;
  let calendar: Calendar;
  let shop: Shop;
  let machinery: Machinery;
  let shopId: string;
  let eventType: EventType;

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
    eventType = await CalendarService.createEventType(
      adminUser,
      'Team Meeting',
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
      true
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
        'Meeting',
        [],
        organization,
        true,
        false,
        true,
        true,
        true,
        true,
        false,
        false,
        false,
        false,
        false,
        true
      );

      expect(result.name).toEqual('Meeting');
      expect(result.initialDateScheduled).toBe(true);
      expect(result.recurring).toBe(false);
      expect(result.allDay).toBe(true);
      expect(result.members).toBe(true);
      expect(result.location).toBe(true);
      expect(result.zoomLink).toBe(true);
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
      expect(result.zoomLink).toBe(false);
      expect(result.description).toBe(false);
    });
  });

  describe('Create Event', () => {
    let member: User;
    let otherOrg: Organization;
    let otherOrgUser: User;
    let otherOrgShop: Shop;
    let otherOrgMachinery: Machinery;
    let document: string;

    beforeEach(async () => {
      member = await createTestUser(supermanAdmin, orgId);

      otherOrg = await prisma.organization.create({
        data: {
          name: 'Other Org (calendar test)',
          description: 'for cross-org negative case',
          applicationLink: '',
          userCreated: { connect: { userId: adminUser.userId } }
        }
      });
      otherOrgUser = await createTestUser(alfred, otherOrg.organizationId);

      // Create additional entities for testing
      otherOrgShop = await CalendarService.createShop(
        otherOrgUser,
        'Other Org Shop',
        'Shop in different organization',
        otherOrg
      );

      otherOrgMachinery = await CalendarService.createMachinery(
        otherOrgUser,
        'Other Org Machinery',
        otherOrgShop.shopId,
        1,
        otherOrg,
        'Machinery in different organization'
      );

      document = 'Test Document';
    });

    it('succeeds for admin with valid inputs', async () => {
      const scheduleSlots = [
        {
          days: [DayOfWeek.MONDAY, DayOfWeek.TUESDAY],
          startTime: new Date('2025-10-13T09:00:00Z'),
          endTime: new Date('2025-10-13T10:00:00Z'),
          recurrenceNumber: 1,
          initialDateScheduled: new Date('2025-10-13'),
          allDay: false
        }
      ];

      const result = await CalendarService.createEvent(
        adminUser,
        'Team Sync',
        eventType.eventTypeId,
        organization,
        [member.userId],
        [],
        [shop.shopId],
        [machinery.machineryId],
        [],
        [document],
        scheduleSlots,
        true,
        adminUser.userId,
        'https://example.com/questions.pdf',
        'Conference Room A',
        'https://zoom.us/j/123456789',
        'Weekly team synchronization meeting'
      );

      expect(result.title).toBe('Team Sync');
      expect(result.eventTypeId).toBe(eventType.eventTypeId);
      expect(result.people).toHaveLength(1);
      expect(result.people[0].userId).toBe(member.userId);
      expect(result.shops).toHaveLength(1);
      expect(result.shops[0].shopId).toBe(shop.shopId);
      expect(result.machinery).toHaveLength(1);
      expect(result.machinery[0].machineryId).toBe(machinery.machineryId);
      expect(result.workPackages).toHaveLength(0);
      expect(result.documentIds).toHaveLength(1);
      expect(result.scheduledTimes).toHaveLength(1);
      expect(result.scheduledTimes[0].days).toEqual([DayOfWeek.MONDAY, DayOfWeek.TUESDAY]);
      expect(result.approved).toBe(true);
      expect(result.approvedBy!.userId).toBe(adminUser.userId);
      expect(result.questionDocument).toBe('https://example.com/questions.pdf');
      expect(result.location).toBe('Conference Room A');
      expect(result.zoomLink).toBe('https://zoom.us/j/123456789');
      expect(result.description).toBe('Weekly team synchronization meeting');
    });

    it('fails if eventTypeId does not exist', async () => {
      const scheduleSlots = [
        {
          days: [DayOfWeek.MONDAY],
          startTime: new Date('2025-10-13T09:00:00Z'),
          endTime: new Date('2025-10-13T10:00:00Z'),
          recurrenceNumber: 1,
          initialDateScheduled: new Date('2025-10-13'),
          allDay: false
        }
      ];

      await expect(
        CalendarService.createEvent(
          adminUser,
          'Invalid Event Type',
          'non-existent-event-type-id',
          organization,
          [member.userId],
          [],
          [],
          [],
          [],
          [],
          scheduleSlots,
          false
        )
      ).rejects.toThrow(new NotFoundException('Event Type', 'non-existent-event-type-id'));
    });

    it('fails if organization is invalid', async () => {
      const scheduleSlots = [
        {
          days: [DayOfWeek.MONDAY],
          startTime: new Date('2025-10-13T09:00:00Z'),
          endTime: new Date('2025-10-13T10:00:00Z'),
          recurrenceNumber: 1,
          initialDateScheduled: new Date('2025-10-13'),
          allDay: false
        }
      ];

      await expect(
        CalendarService.createEvent(
          adminUser,
          'Wrong Org Event',
          eventType.eventTypeId,
          otherOrg,
          [member.userId],
          [],
          [shop.shopId],
          [],
          [],
          [],
          scheduleSlots,
          false
        )
      ).rejects.toThrow(new InvalidOrganizationException('Event Type'));
    });

    it('succeeds with minimal inputs', async () => {
      const scheduleSlots = [] as ScheduleSlot[];

      const result = await CalendarService.createEvent(
        adminUser,
        'Minimal Event',
        eventType.eventTypeId,
        organization,
        [],
        [],
        [],
        [],
        [],
        [],
        scheduleSlots,
        false
      );

      expect(result.title).toBe('Minimal Event');
      expect(result.eventTypeId).toBe(eventType.eventTypeId);
      expect(result.people).toHaveLength(0);
      expect(result.shops).toHaveLength(0);
      expect(result.machinery).toHaveLength(0);
      expect(result.workPackages).toHaveLength(0);
      expect(result.documentIds).toHaveLength(0);
      expect(result.scheduledTimes).toHaveLength(0);
      expect(result.approved).toBe(false);
      expect(result.approvedBy).toBeUndefined();
      expect(result.questionDocument).toBeUndefined();
      expect(result.location).toBeUndefined();
      expect(result.zoomLink).toBeUndefined();
      expect(result.description).toBeUndefined();
    });

    it('fails if memberIds are invalid', async () => {
      const scheduleSlots = [] as ScheduleSlot[];

      await expect(
        CalendarService.createEvent(
          adminUser,
          'Invalid Members',
          eventType.eventTypeId,
          organization,
          ['non-existent-user-id'],
          [],
          [],
          [],
          [],
          [],
          scheduleSlots,
          false
        )
      ).rejects.toThrow(new NotFoundException('User', 'non-existent-user-id'));
    });

    it('fails if memberIds belong to a different organization', async () => {
      const scheduleSlots = [] as ScheduleSlot[];

      await expect(
        CalendarService.createEvent(
          adminUser,
          'Wrong Org Members',
          eventType.eventTypeId,
          organization,
          [otherOrgUser.userId],
          [],
          [],
          [],
          [],
          [],
          scheduleSlots,
          false
        )
      ).rejects.toThrow(new NotFoundException('User', otherOrgUser.userId));
    });

    it('fails if shopIds are invalid', async () => {
      const scheduleSlots = [] as ScheduleSlot[];

      await expect(
        CalendarService.createEvent(
          adminUser,
          'Invalid Shops',
          eventType.eventTypeId,
          organization,
          [],
          [],
          ['non-existent-shop-id'],
          [],
          [],
          [],
          scheduleSlots,
          false
        )
      ).rejects.toThrow(new NotFoundException('Shop', 'non-existent-shop-id'));
    });

    it('fails if shopIds belong to a different organization', async () => {
      const scheduleSlots = [] as ScheduleSlot[];

      await expect(
        CalendarService.createEvent(
          adminUser,
          'Wrong Org Shops',
          eventType.eventTypeId,
          organization,
          [],
          [],
          [otherOrgShop.shopId],
          [],
          [],
          [],
          scheduleSlots,
          false
        )
      ).rejects.toThrow(new NotFoundException('Shop', otherOrgShop.shopId));
    });

    it('fails if machineryIds are invalid', async () => {
      const scheduleSlots = [] as ScheduleSlot[];

      await expect(
        CalendarService.createEvent(
          adminUser,
          'Invalid Machinery',
          eventType.eventTypeId,
          organization,
          [],
          [],
          [],
          ['non-existent-machinery-id'],
          [],
          [],
          scheduleSlots,
          false
        )
      ).rejects.toThrow(new NotFoundException('Machinery', 'non-existent-machinery-id'));
    });

    it('fails if machineryIds belong to a different organization', async () => {
      const scheduleSlots = [] as ScheduleSlot[];

      await expect(
        CalendarService.createEvent(
          adminUser,
          'Wrong Org Machinery',
          eventType.eventTypeId,
          organization,
          [],
          [],
          [],
          [otherOrgMachinery.machineryId],
          [],
          [],
          scheduleSlots,
          false
        )
      ).rejects.toThrow(new NotFoundException('Machinery', otherOrgMachinery.machineryId));
    });

    it('fails if workPackageIds are invalid', async () => {
      const scheduleSlots = [] as ScheduleSlot[];

      await expect(
        CalendarService.createEvent(
          adminUser,
          'Invalid Work Packages',
          eventType.eventTypeId,
          organization,
          [],
          [],
          [],
          [],
          ['non-existent-work-package-id'],
          [],
          scheduleSlots,
          false
        )
      ).rejects.toThrow(new NotFoundException('Work Package', 'non-existent-work-package-id'));
    });

    it('fails if approvedByUserId is invalid', async () => {
      const scheduleSlots = [] as ScheduleSlot[];

      await expect(
        CalendarService.createEvent(
          adminUser,
          'Invalid Approver',
          eventType.eventTypeId,
          organization,
          [],
          [],
          [],
          [],
          [],
          [],
          scheduleSlots,
          true,
          'non-existent-user-id'
        )
      ).rejects.toThrow(new NotFoundException('User', 'non-existent-user-id'));
    });

    it('fails if approvedByUserId belongs to a different organization', async () => {
      const scheduleSlots = [] as ScheduleSlot[];

      await expect(
        CalendarService.createEvent(
          adminUser,
          'Wrong Org Approver',
          eventType.eventTypeId,
          organization,
          [],
          [],
          [],
          [],
          [],
          [],
          scheduleSlots,
          true,
          otherOrgUser.userId
        )
      ).rejects.toThrow(new NotFoundException('User', otherOrgUser.userId));
    });

    it('fails if shopIds are deleted', async () => {
      const deletedShop = await CalendarService.createShop(adminUser, 'Deleted Shop', 'Deleted shop', organization);
      await prisma.shop.update({
        where: { shopId: deletedShop.shopId },
        data: { dateDeleted: new Date() }
      });

      const scheduleSlots = [] as ScheduleSlot[];

      await expect(
        CalendarService.createEvent(
          adminUser,
          'Deleted Shops',
          eventType.eventTypeId,
          organization,
          [],
          [],
          [deletedShop.shopId],
          [],
          [],
          [],
          scheduleSlots,
          false
        )
      ).rejects.toThrow(new NotFoundException('Shop', deletedShop.shopId));
    });

    it('fails if machineryIds are deleted', async () => {
      const deletedMachinery = await CalendarService.createMachinery(
        adminUser,
        'Deleted Machinery',
        shop.shopId,
        1,
        organization,
        'Deleted machinery'
      );
      await prisma.machinery.update({
        where: { machineryId: deletedMachinery.machineryId },
        data: { dateDeleted: new Date() }
      });

      const scheduleSlots = [] as ScheduleSlot[];

      await expect(
        CalendarService.createEvent(
          adminUser,
          'Deleted Machinery',
          eventType.eventTypeId,
          organization,
          [],
          [],
          [],
          [deletedMachinery.machineryId],
          [],
          [],
          scheduleSlots,
          false
        )
      ).rejects.toThrow(new NotFoundException('Machinery', deletedMachinery.machineryId));
    });
  });

  describe('Get Events', () => {
    it('Succeeds and gets all events', async () => {
      const member = await createTestUser(supermanAdmin, orgId);

      const document = 'Test Document';

      const scheduleSlots = [
        {
          days: [DayOfWeek.MONDAY, DayOfWeek.TUESDAY],
          startTime: new Date('2025-10-13T09:00:00Z'),
          endTime: new Date('2025-10-13T10:00:00Z'),
          recurrenceNumber: 1,
          initialDateScheduled: new Date('2025-10-13'),
          allDay: false
        }
      ];

      const event1 = await CalendarService.createEvent(
        adminUser,
        'Team Sync',
        eventType.eventTypeId,
        organization,
        [member.userId],
        [],
        [shop.shopId],
        [machinery.machineryId],
        [],
        [document],
        scheduleSlots,
        true,
        adminUser.userId,
        'https://example.com/questions.pdf',
        'Conference Room A',
        'https://zoom.us/j/123456789',
        'Weekly team synchronization meeting'
      );

      const event2 = await CalendarService.createEvent(
        adminUser,
        'Awesome Meeting',
        eventType.eventTypeId,
        organization,
        [member.userId],
        [],
        [shop.shopId],
        [],
        [],
        [],
        scheduleSlots,
        true,
        adminUser.userId,
        'https://example.com/questions.pdf',
        'Conference Room A',
        'https://zoom.us/j/123456789',
        'Weekly team synchronization meeting'
      );

      const result = await CalendarService.getFilteredEvents(
        { startPeriod: new Date('2020-10-01T09:00:00Z'), endPeriod: new Date('2027-11-01T09:00:00Z') },
        organization
      );
      expect(result).toStrictEqual([event1, event2]);
    });

    it('Succeeds and gets all events within a timeframe', async () => {
      const member = await createTestUser(supermanAdmin, orgId);

      const document = 'Test Document';

      const scheduleSlots = [
        {
          days: [DayOfWeek.MONDAY, DayOfWeek.TUESDAY],
          startTime: new Date('2025-10-13T09:00:00Z'),
          endTime: new Date('2025-10-13T10:00:00Z'),
          recurrenceNumber: 1,
          initialDateScheduled: new Date('2025-10-13'),
          allDay: false
        }
      ];

      const event1 = await CalendarService.createEvent(
        adminUser,
        'Team Sync',
        eventType.eventTypeId,
        organization,
        [member.userId],
        [],
        [shop.shopId],
        [machinery.machineryId],
        [],
        [document],
        scheduleSlots,
        true,
        adminUser.userId,
        'https://example.com/questions.pdf',
        'Conference Room A',
        'https://zoom.us/j/123456789',
        'Weekly team synchronization meeting'
      );

      const event2 = await CalendarService.createEvent(
        adminUser,
        'Awesome Meeting',
        eventType.eventTypeId,
        organization,
        [member.userId],
        [],
        [shop.shopId],
        [],
        [],
        [],
        scheduleSlots,
        true,
        adminUser.userId,
        'https://example.com/questions.pdf',
        'Conference Room A',
        'https://zoom.us/j/123456789',
        'Weekly team synchronization meeting'
      );

      const scheduleSlots2 = [
        {
          days: [DayOfWeek.MONDAY, DayOfWeek.TUESDAY],
          startTime: new Date('2025-10-13T09:00:00Z'),
          endTime: new Date('2025-10-13T10:00:00Z'),
          recurrenceNumber: 5,
          initialDateScheduled: new Date('2029-10-01'),
          allDay: false
        }
      ];

      // out of timeframe date
      await CalendarService.createEvent(
        adminUser,
        'Way too far in the future meeting',
        eventType.eventTypeId,
        organization,
        [member.userId],
        [],
        [shop.shopId],
        [],
        [],
        [],
        scheduleSlots2,
        true,
        adminUser.userId,
        'https://example.com/questions.pdf',
        'Conference Room A',
        'https://zoom.us/j/123456789',
        'Weekly team synchronization meeting'
      );

      const result = await CalendarService.getFilteredEvents(
        { startPeriod: new Date('2025-10-01T09:00:00Z'), endPeriod: new Date('2025-11-01T09:00:00Z') },
        organization
      );
      expect(result).toStrictEqual([event1, event2]);
    });

    it('Succeeds and gets all events with matching members', async () => {
      const member = await createTestUser(supermanAdmin, orgId);

      const document = 'Test Document';

      const scheduleSlots = [
        {
          days: [DayOfWeek.MONDAY, DayOfWeek.TUESDAY],
          startTime: new Date('2025-10-13T09:00:00Z'),
          endTime: new Date('2025-10-13T10:00:00Z'),
          recurrenceNumber: 1,
          initialDateScheduled: new Date('2025-10-13'),
          allDay: false
        }
      ];

      const event1 = await CalendarService.createEvent(
        adminUser,
        'Team Sync',
        eventType.eventTypeId,
        organization,
        [member.userId],
        [],
        [shop.shopId],
        [machinery.machineryId],
        [],
        [document],
        scheduleSlots,
        true,
        adminUser.userId,
        'https://example.com/questions.pdf',
        'Conference Room A',
        'https://zoom.us/j/123456789',
        'Weekly team synchronization meeting'
      );

      await CalendarService.createEvent(
        adminUser,
        'Awesome Meeting',
        eventType.eventTypeId,
        organization,
        [],
        [],
        [shop.shopId],
        [],
        [],
        [],
        scheduleSlots,
        true,
        adminUser.userId,
        'https://example.com/questions.pdf',
        'Conference Room A',
        'https://zoom.us/j/123456789',
        'Weekly team synchronization meeting'
      );

      const scheduleSlots2 = [
        {
          days: [DayOfWeek.MONDAY, DayOfWeek.TUESDAY],
          startTime: new Date('2025-10-13T09:00:00Z'),
          endTime: new Date('2025-10-13T10:00:00Z'),
          recurrenceNumber: 5,
          initialDateScheduled: new Date('2029-10-01'),
          allDay: false
        }
      ];

      // out of timeframe date
      await CalendarService.createEvent(
        adminUser,
        'Way too far in the future meeting',
        eventType.eventTypeId,
        organization,
        [],
        [],
        [shop.shopId],
        [],
        [],
        [],
        scheduleSlots2,
        true,
        adminUser.userId,
        'https://example.com/questions.pdf',
        'Conference Room A',
        'https://zoom.us/j/123456789',
        'Weekly team synchronization meeting'
      );

      const result = await CalendarService.getFilteredEvents(
        {
          startPeriod: new Date('2020-10-01T09:00:00Z'),
          endPeriod: new Date('2027-11-01T09:00:00Z'),
          memberIds: [member.userId]
        },
        organization
      );
      expect(result).toStrictEqual([event1]);
    });
  });

  it('fails if memberIds do not exist', async () => {
    await expect(
      CalendarService.getFilteredEvents(
        {
          startPeriod: new Date('2020-10-01T09:00:00Z'),
          endPeriod: new Date('2027-11-01T09:00:00Z'),
          memberIds: ['fakeId']
        },
        organization
      )
    ).rejects.toThrow(new NotFoundException('User', 'fakeId'));
  });

  it('fails if eventTypeIds do not exist', async () => {
    await expect(
      CalendarService.getFilteredEvents(
        {
          startPeriod: new Date('2020-10-01T09:00:00Z'),
          endPeriod: new Date('2027-11-01T09:00:00Z'),
          eventTypeIds: ['fakeId']
        },
        organization
      )
    ).rejects.toThrow(new NotFoundException('Event Type', 'fakeId'));
  });

  it('fails if eventIds do not exist', async () => {
    await expect(
      CalendarService.getFilteredEvents(
        { startPeriod: new Date('2020-10-01T09:00:00Z'), endPeriod: new Date('2027-11-01T09:00:00Z'), eventIds: ['fakeId'] },
        organization
      )
    ).rejects.toThrow(new NotFoundException('Event', 'fakeId'));
  });

  it('fails if calendarIds do not exist', async () => {
    await expect(
      CalendarService.getFilteredEvents(
        {
          startPeriod: new Date('2020-10-01T09:00:00Z'),
          endPeriod: new Date('2027-11-01T09:00:00Z'),
          calendarIds: ['fakeId']
        },
        organization
      )
    ).rejects.toThrow(new NotFoundException('Calendar', 'fakeId'));
  });

  it('fails if teamIds do not exist', async () => {
    await expect(
      CalendarService.getFilteredEvents(
        { startPeriod: new Date('2020-10-01T09:00:00Z'), endPeriod: new Date('2027-11-01T09:00:00Z'), teamIds: ['fakeId'] },
        organization
      )
    ).rejects.toThrow(new NotFoundException('Team', 'fakeId'));
  });

  describe('Delete Machinery', () => {
    let machineryToDelete: Machinery;
    let anotherShop: Shop;

    beforeEach(async () => {
      machineryToDelete = await CalendarService.createMachinery(
        adminUser,
        'Deletable Machinery',
        shop.shopId,
        2,
        organization,
        'Test description'
      );

      anotherShop = await CalendarService.createShop(
        adminUser,
        'Secondary Shop',
        'Another shop for deletion test',
        organization
      );

      await prisma.shopMachinery.create({
        data: {
          shopId: anotherShop.shopId,
          machineryId: machineryToDelete.machineryId,
          quantity: 1,
          description: 'Bridge row for deletion test'
        }
      });
    });

    it('fails if user is not an admin', async () => {
      const guest = await createTestUser(wonderwomanGuest, orgId);
      await expect(CalendarService.deleteMachinery(guest, machineryToDelete.machineryId, organization)).rejects.toThrow(
        new AccessDeniedAdminOnlyException('delete machinery')
      );
    });

    it('fails if machinery does not exist', async () => {
      await expect(CalendarService.deleteMachinery(adminUser, 'non-existent-id', organization)).rejects.toThrow(
        new NotFoundException('Machinery', 'non-existent-id')
      );
    });

    it('fails if machinery is already deleted', async () => {
      await prisma.machinery.update({
        where: { machineryId: machineryToDelete.machineryId },
        data: { dateDeleted: new Date() }
      });

      await expect(CalendarService.deleteMachinery(adminUser, machineryToDelete.machineryId, organization)).rejects.toThrow(
        new NotFoundException('Machinery', machineryToDelete.machineryId)
      );
    });

    it('succeeds for admin and soft deletes machinery and shopMachinery rows', async () => {
      const bridgeBefore = await prisma.shopMachinery.count({
        where: { machineryId: machineryToDelete.machineryId }
      });
      expect(bridgeBefore).toBeGreaterThan(0);

      const deleted = await CalendarService.deleteMachinery(adminUser, machineryToDelete.machineryId, organization);

      const row = await prisma.machinery.findUnique({ where: { machineryId: machineryToDelete.machineryId } });
      expect(row?.dateDeleted).not.toBeNull();
      expect(row?.userDeletedId).toBe(adminUser.userId);

      expect(deleted.machineryId).toBe(machineryToDelete.machineryId);
      expect(deleted.name).toBe(machineryToDelete.name);

      const bridgeAfter = await prisma.shopMachinery.count({
        where: { machineryId: machineryToDelete.machineryId }
      });
      expect(bridgeAfter).toBe(0);
    });
  });

  describe('Edit Event', () => {
    let event: Event;
    let member: User;
    let scheduleSlots: ScheduleSlotCreateArgs[];

    beforeEach(async () => {
      member = await createTestUser(supermanAdmin, orgId);
      scheduleSlots = [
        {
          days: [DayOfWeek.MONDAY],
          startTime: new Date('2025-10-13T09:00:00Z'),
          endTime: new Date('2025-10-13T10:00:00Z'),
          recurrenceNumber: 1,
          initialDateScheduled: new Date('2025-10-13'),
          allDay: false
        }
      ];

      event = await CalendarService.createEvent(
        adminUser,
        'Original Event',
        eventType.eventTypeId,
        organization,
        [member.userId],
        [],
        [shop.shopId],
        [machinery.machineryId],
        [],
        ['doc1'],
        scheduleSlots,
        false
      );
    });

    it('fails if event does not exist', async () => {
      await expect(
        CalendarService.editEvent(
          adminUser,
          'non-existent-id',
          'Updated Title',
          eventType.eventTypeId,
          organization,
          [],
          [],
          [],
          [],
          [],
          [],
          scheduleSlots,
          false
        )
      ).rejects.toThrow(new NotFoundException('Event', 'non-existent-id'));
    });

    it('fails if event is already deleted', async () => {
      await prisma.event.update({
        where: { eventId: event.eventId },
        data: { dateDeleted: new Date() }
      });

      await expect(
        CalendarService.editEvent(
          adminUser,
          event.eventId,
          'Updated Title',
          eventType.eventTypeId,
          organization,
          [],
          [],
          [],
          [],
          [],
          [],
          scheduleSlots,
          false
        )
      ).rejects.toThrow(new DeletedException('Event', event.eventId));
    });

    it('fails if eventTypeId does not exist', async () => {
      await expect(
        CalendarService.editEvent(
          adminUser,
          event.eventId,
          'Updated Title',
          'non-existent-event-type-id',
          organization,
          [],
          [],
          [],
          [],
          [],
          [],
          scheduleSlots,
          false
        )
      ).rejects.toThrow(new NotFoundException('Event Type', 'non-existent-event-type-id'));
    });

    it('fails if eventType is deleted', async () => {
      await prisma.eventType.update({
        where: { eventTypeId: eventType.eventTypeId },
        data: { dateDeleted: new Date() }
      });

      await expect(
        CalendarService.editEvent(
          adminUser,
          event.eventId,
          'Updated Title',
          eventType.eventTypeId,
          organization,
          [],
          [],
          [],
          [],
          [],
          [],
          scheduleSlots,
          false
        )
      ).rejects.toThrow(new DeletedException('Event Type', eventType.eventTypeId));
    });

    it('fails if eventType belongs to different organization', async () => {
      const otherOrg = await prisma.organization.create({
        data: {
          name: 'Other Org (calendar test)',
          description: 'for cross-org negative case',
          applicationLink: '',
          userCreated: { connect: { userId: adminUser.userId } }
        }
      });
      const AdminInOtherOrg = await createTestUser(alfred, otherOrg.organizationId);

      const otherEventType = await CalendarService.createEventType(
        AdminInOtherOrg,
        'Other Org Event Type',
        [],
        otherOrg,
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
        true
      );

      await expect(
        CalendarService.editEvent(
          adminUser,
          event.eventId,
          'Updated Title',
          otherEventType.eventTypeId,
          organization,
          [],
          [],
          [],
          [],
          [],
          [],
          scheduleSlots,
          false
        )
      ).rejects.toThrow(new InvalidOrganizationException('Event Type'));
    });

    it('fails if memberIds are invalid', async () => {
      await expect(
        CalendarService.editEvent(
          adminUser,
          event.eventId,
          'Updated Title',
          eventType.eventTypeId,
          organization,
          ['non-existent-user-id'],
          [],
          [],
          [],
          [],
          [],
          scheduleSlots,
          false
        )
      ).rejects.toThrow(new NotFoundException('User', 'non-existent-user-id'));
    });

    it('fails if shopIds are invalid', async () => {
      await expect(
        CalendarService.editEvent(
          adminUser,
          event.eventId,
          'Updated Title',
          eventType.eventTypeId,
          organization,
          [],
          [],
          ['non-existent-shop-id'],
          [],
          [],
          [],
          scheduleSlots,
          false
        )
      ).rejects.toThrow(new NotFoundException('Shop', 'non-existent-shop-id'));
    });

    it('fails if shopIds are deleted', async () => {
      const deletedShop = await CalendarService.createShop(adminUser, 'Deleted Shop', 'Deleted', organization);
      await prisma.shop.update({
        where: { shopId: deletedShop.shopId },
        data: { dateDeleted: new Date() }
      });

      await expect(
        CalendarService.editEvent(
          adminUser,
          event.eventId,
          'Updated Title',
          eventType.eventTypeId,
          organization,
          [],
          [],
          [deletedShop.shopId],
          [],
          [],
          [],
          scheduleSlots,
          false
        )
      ).rejects.toThrow(new NotFoundException('Shop', deletedShop.shopId));
    });

    it('fails if machineryIds are invalid', async () => {
      await expect(
        CalendarService.editEvent(
          adminUser,
          event.eventId,
          'Updated Title',
          eventType.eventTypeId,
          organization,
          [],
          [],
          [],
          ['non-existent-machinery-id'],
          [],
          [],
          scheduleSlots,
          false
        )
      ).rejects.toThrow(new NotFoundException('Machinery', 'non-existent-machinery-id'));
    });

    it('fails if machineryIds are deleted', async () => {
      const deletedMachinery = await CalendarService.createMachinery(
        adminUser,
        'Deleted Machinery',
        shop.shopId,
        1,
        organization
      );
      await prisma.machinery.update({
        where: { machineryId: deletedMachinery.machineryId },
        data: { dateDeleted: new Date() }
      });

      await expect(
        CalendarService.editEvent(
          adminUser,
          event.eventId,
          'Updated Title',
          eventType.eventTypeId,
          organization,
          [],
          [],
          [],
          [deletedMachinery.machineryId],
          [],
          [],
          scheduleSlots,
          false
        )
      ).rejects.toThrow(new NotFoundException('Machinery', deletedMachinery.machineryId));
    });

    it('fails if workPackageIds are invalid', async () => {
      await expect(
        CalendarService.editEvent(
          adminUser,
          event.eventId,
          'Updated Title',
          eventType.eventTypeId,
          organization,
          [],
          [],
          [],
          [],
          ['non-existent-wp-id'],
          [],
          scheduleSlots,
          false
        )
      ).rejects.toThrow(new NotFoundException('Work Package', 'non-existent-wp-id'));
    });

    it('fails if approvedByUserId is invalid', async () => {
      await expect(
        CalendarService.editEvent(
          adminUser,
          event.eventId,
          'Updated Title',
          eventType.eventTypeId,
          organization,
          [],
          [],
          [],
          [],
          [],
          [],
          scheduleSlots,
          true,
          'non-existent-user-id'
        )
      ).rejects.toThrow(new NotFoundException('User', 'non-existent-user-id'));
    });

    it('succeeds for admin and updates event', async () => {
      const newMember = await createTestUser(alfred, orgId);
      const newScheduleSlots: ScheduleSlotCreateArgs[] = [
        {
          days: [DayOfWeek.WEDNESDAY],
          startTime: new Date('2025-10-15T14:00:00Z'),
          endTime: new Date('2025-10-15T15:00:00Z'),
          recurrenceNumber: 2,
          initialDateScheduled: new Date('2025-10-15'),
          allDay: true
        }
      ];

      const result = await CalendarService.editEvent(
        adminUser,
        event.eventId,
        'Updated Event Title',
        eventType.eventTypeId,
        organization,
        [newMember.userId],
        [],
        [],
        [],
        [],
        ['doc2', 'doc3'],
        newScheduleSlots,
        true,
        adminUser.userId,
        'https://updated.com/questions.pdf',
        'Updated Location',
        'https://zoom.us/updated',
        'Updated description'
      );

      expect(result.eventId).toBe(event.eventId);
      expect(result.title).toBe('Updated Event Title');
      expect(result.people).toHaveLength(1);
      expect(result.people[0].userId).toBe(newMember.userId);
      expect(result.documentIds).toEqual(['doc2', 'doc3']);
      expect(result.approved).toBe(true);
      expect(result.approvedBy!.userId).toBe(adminUser.userId);
      expect(result.questionDocument).toBe('https://updated.com/questions.pdf');
      expect(result.location).toBe('Updated Location');
      expect(result.zoomLink).toBe('https://zoom.us/updated');
      expect(result.description).toBe('Updated description');
    });

    it('succeeds and updates with minimal fields', async () => {
      const result = await CalendarService.editEvent(
        adminUser,
        event.eventId,
        'Minimal Update',
        eventType.eventTypeId,
        organization,
        [],
        [],
        [],
        [],
        [],
        [],
        [],
        false
      );

      expect(result.eventId).toBe(event.eventId);
      expect(result.title).toBe('Minimal Update');
      expect(result.people).toHaveLength(0);
      expect(result.shops).toHaveLength(0);
      expect(result.machinery).toHaveLength(0);
      expect(result.workPackages).toHaveLength(0);
      expect(result.documentIds).toHaveLength(0);
      expect(result.approved).toBe(false);
    });
  });

  describe('Delete Event', () => {
    let event: Event;

    beforeEach(async () => {
      const scheduleSlots: ScheduleSlotCreateArgs[] = [
        {
          days: [DayOfWeek.MONDAY],
          startTime: new Date('2025-10-13T09:00:00Z'),
          endTime: new Date('2025-10-13T10:00:00Z'),
          recurrenceNumber: 1,
          initialDateScheduled: new Date('2025-10-13'),
          allDay: false
        }
      ];

      event = await CalendarService.createEvent(
        adminUser,
        'Event to Delete',
        eventType.eventTypeId,
        organization,
        [],
        [],
        [],
        [],
        [],
        [],
        scheduleSlots,
        false
      );
    });

    it('fails if user is not an admin', async () => {
      const guest = await createTestUser(wonderwomanGuest, orgId);
      await expect(CalendarService.deleteEvent(guest, event.eventId, organization)).rejects.toThrow(
        new AccessDeniedException('Only admins can delete events!')
      );
    });

    it('fails if event does not exist', async () => {
      await expect(CalendarService.deleteEvent(adminUser, 'non-existent-id', organization)).rejects.toThrow(
        new NotFoundException('Event', 'non-existent-id')
      );
    });

    it('fails if event is already deleted', async () => {
      await prisma.event.update({
        where: { eventId: event.eventId },
        data: { dateDeleted: new Date() }
      });

      await expect(CalendarService.deleteEvent(adminUser, event.eventId, organization)).rejects.toThrow(
        new DeletedException('Event', event.eventId)
      );
    });

    it('succeeds for admin and soft deletes event', async () => {
      const result = await CalendarService.deleteEvent(adminUser, event.eventId, organization);

      expect(result.eventId).toBe(event.eventId);
      expect(result.title).toBe('Event to Delete');

      const deletedEvent = await prisma.event.findUnique({
        where: { eventId: event.eventId }
      });
      expect(deletedEvent?.dateDeleted).not.toBeNull();
      expect(deletedEvent?.userDeletedId).toBe(adminUser.userId);
    });
  });

  describe('Delete EventType', () => {
    let eventTypeToDelete: EventType;

    beforeEach(async () => {
      eventTypeToDelete = await CalendarService.createEventType(
        adminUser,
        'EventType to Delete',
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
        true
      );
    });

    it('fails if user is not an admin', async () => {
      const guest = await createTestUser(wonderwomanGuest, orgId);
      await expect(CalendarService.deleteEventType(guest, eventTypeToDelete.eventTypeId, organization)).rejects.toThrow(
        new AccessDeniedException('Only admins can delete event types!')
      );
    });

    it('fails if event type does not exist', async () => {
      await expect(CalendarService.deleteEventType(adminUser, 'non-existent-id', organization)).rejects.toThrow(
        new NotFoundException('Event Type', 'non-existent-id')
      );
    });

    it('fails if event type is already deleted', async () => {
      await prisma.eventType.update({
        where: { eventTypeId: eventTypeToDelete.eventTypeId },
        data: { dateDeleted: new Date() }
      });

      await expect(CalendarService.deleteEventType(adminUser, eventTypeToDelete.eventTypeId, organization)).rejects.toThrow(
        new DeletedException('Event Type', eventTypeToDelete.eventTypeId)
      );
    });

    it('fails if event type belongs to different organization', async () => {
      const otherOrg = await prisma.organization.create({
        data: {
          name: 'Other Org (calendar test)',
          description: 'for cross-org negative case',
          applicationLink: '',
          userCreated: { connect: { userId: adminUser.userId } }
        }
      });
      const AdminInOtherOrg = await createTestUser(alfred, otherOrg.organizationId);

      const otherOrgEventType = await CalendarService.createEventType(
        AdminInOtherOrg,
        'Other Org Event Type',
        [],
        otherOrg,
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
        true
      );

      await expect(CalendarService.deleteEventType(adminUser, otherOrgEventType.eventTypeId, organization)).rejects.toThrow(
        new InvalidOrganizationException('Event Type')
      );
    });

    it('succeeds for admin and soft deletes event type', async () => {
      const result = await CalendarService.deleteEventType(adminUser, eventTypeToDelete.eventTypeId, organization);

      expect(result.eventTypeId).toBe(eventTypeToDelete.eventTypeId);
      expect(result.name).toBe('EventType to Delete');

      const deletedEventType = await prisma.eventType.findUnique({
        where: { eventTypeId: eventTypeToDelete.eventTypeId }
      });
      expect(deletedEventType?.dateDeleted).not.toBeNull();
      expect(deletedEventType?.userDeletedId).toBe(adminUser.userId);
    });
  });
});
