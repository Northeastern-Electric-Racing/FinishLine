import MachineryService from '../../src/services/calendar.services';
import { Calendar, Organization } from '@prisma/client';
import CalendarService from '../../src/services/calendar.services';
import { AccessDeniedAdminOnlyException } from '../../src/utils/errors.utils';
import { batmanAppAdmin, wonderwomanGuest, supermanAdmin } from '../test-data/users.test-data';
import { createTestOrganization, createTestUser, resetUsers } from '../test-utils';
import prisma from '../../src/prisma/prisma';

describe('Machinery Tests', () => {
  let orgId: string;
  let organization: Organization;
  let shopId: string;
  describe('Calendar Tests', () => {
    let orgId: string;
    let organization: Organization;
    let calendar: Calendar;

    beforeEach(async () => {
      organization = await createTestOrganization();
      orgId = organization.organizationId;

      // Create a test shop for shopId, assuming prisma create shop works
      const shopName = 'Precision Manufacturing Lab';
      const shop = await prisma.shop.create({
        data: {
          name: shopName,
          description: 'Manufacturing facility equipped with advanced machinery and tools for engineering',
          userCreatedId: (await createTestUser(batmanAppAdmin, orgId)).userId
        }
      });
      ({ shopId } = shop);
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

    describe('Create machinery', () => {
      it('Fails if user is not an admin', async () => {
        await expect(
          async () =>
            await MachineryService.createMachinery(
              await createTestUser(wonderwomanGuest, orgId),
              'Captain America Shield Press',
              shopId,
              1,
              organization
            )
        ).rejects.toThrow(new AccessDeniedAdminOnlyException('create machinery'));
      });

      it('Succeeds and creates machinery', async () => {
        const result = await MachineryService.createMachinery(
          await createTestUser(supermanAdmin, orgId),
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
  });
  //16d5afbe-95f0-4214-8a31-100e5e7e408d
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
});
