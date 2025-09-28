import { Calendar, Organization } from '@prisma/client';
import CalendarService from '../../src/services/calendar.services';
import { AccessDeniedAdminOnlyException, AccessDeniedException, NotFoundException } from '../../src/utils/errors.utils';
import {
  batmanAppAdmin,
  wonderwomanGuest,
  supermanAdmin,
  flashAdmin,
  theVisitorGuest,
  alfred
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

  describe('Edit Machinery', () => {
    let machineryId: string;
    let anotherShopId: string;

    //Create some machinery beforehand so we can edit it
    beforeEach(async () => {
      await resetUsers();

      // Recreate the organization and shop since resetUsers() cleared everything
      organization = await createTestOrganization();
      orgId = organization.organizationId;

      const shop = await prisma.shop.create({
        data: {
          name: 'Precision Manufacturing Lab',
          description: 'Manufacturing facility equipped with advanced machinery and tools for engineering',
          userCreatedId: (await createTestUser(supermanAdmin, orgId)).userId,
          organizationId: orgId
        }
      });
      ({ shopId } = shop);

      const machinery = await CalendarService.createMachinery(
        await createTestUser(alfred, orgId),
        'Original Machinery Name',
        shopId,
        1,
        organization,
        'Original description'
      );
      const { machineryId: machineryIdFromResponse } = machinery;
      machineryId = machineryIdFromResponse;

      // Create another shop for testing (add onto the created machinery above)
      const anotherShop = await prisma.shop.create({
        data: {
          name: 'Advanced Testing Lab',
          description: 'Advanced testing facility',
          userCreatedId: (await createTestUser(flashAdmin, orgId)).userId,
          organizationId: orgId
        }
      });
      const { shopId: anotherShopIdFromResponse } = anotherShop;
      anotherShopId = anotherShopIdFromResponse;
    });

    it('Fails if user is not a head or above', async () => {
      await expect(
        async () =>
          await CalendarService.editMachinery(
            await createTestUser(wonderwomanGuest, orgId),
            machineryId,
            'Updated Machinery Name',
            shopId,
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
            shopId,
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
            machineryId,
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
        machineryId,
        'Updated Machinery Name',
        shopId,
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
        await createTestUser(batmanAppAdmin, orgId),
        machineryId,
        'Admin Updated Machinery',
        anotherShopId,
        5,
        organization,
        'Admin updated description'
      );

      expect(result.name).toEqual('Admin Updated Machinery');
      expect(result.shops).toHaveLength(1);
      expect(result.shops[0].quantity).toBe(5);
      expect(result.shops[0].description).toBe('Admin updated description');
      expect(result.shops[0].shop.name).toBe('Advanced Testing Lab');
    });

    it('Succeeds and updates machinery without description', async () => {
      const result = await CalendarService.editMachinery(
        await createTestUser(supermanAdmin, orgId),
        machineryId,
        'No Description Machinery',
        shopId,
        2,
        organization
      );

      expect(result.name).toEqual('No Description Machinery');
      expect(result.shops).toHaveLength(1);
      expect(result.shops[0].quantity).toBe(2);
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
