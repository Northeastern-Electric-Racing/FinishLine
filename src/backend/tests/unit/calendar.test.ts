import { Calendar, Organization } from '@prisma/client';
import CalendarService from '../../src/services/calendar.services';
import {
  AccessDeniedAdminOnlyException,
  NotFoundException,
  InvalidOrganizationException,
  AccessDeniedException
} from '../../src/utils/errors.utils';
import {
  batmanAppAdmin,
  wonderwomanGuest,
  supermanAdmin,
  flashAdmin,
  greenlanternHead,
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

    describe('Delete shop', () => {
      it('fails if user is not head or above', async () => {
        await expect(
          CalendarService.deleteShop(await createTestUser(wonderwomanGuest, orgId), shopId, organization)
        ).rejects.toBeInstanceOf(AccessDeniedException);
      });

      it('succeeds for head', async () => {
        const head = await createTestUser(greenlanternHead, orgId);

        const result = await CalendarService.deleteShop(head, shopId, organization);
        expect(result.shopId).toBe(shopId);

        // verify soft delete happened
        const row = await prisma.shop.findUnique({ where: { shopId } });
        expect(row?.dateDeleted).not.toBeNull();
      });

      it('fails if shop does not exist', async () => {
        const head = await createTestUser(greenlanternHead, orgId);
        await expect(CalendarService.deleteShop(head, 'non-existent-id', organization)).rejects.toBeInstanceOf(
          NotFoundException
        );
      });

      // optional but useful:
      it('fails if shop is already deleted', async () => {
        const head = await createTestUser(greenlanternHead, orgId);
        await CalendarService.deleteShop(head, shopId, organization);

        await expect(CalendarService.deleteShop(head, shopId, organization)).rejects.toBeInstanceOf(NotFoundException);
      });

      it('fails if shop belongs to a different organization', async () => {
        const otherOrg = await createTestOrganization();
        const otherAdmin = await createTestUser(batmanAppAdmin, otherOrg.organizationId);
        const otherShop = await CalendarService.createShop(otherAdmin, 'OtherShop', 'desc', otherOrg);

        const head = await createTestUser(greenlanternHead, orgId);
        await expect(CalendarService.deleteShop(head, otherShop.shopId, organization)).rejects.toBeInstanceOf(
          InvalidOrganizationException
        );
      });
    });
  });
});
