import { Organization } from '@prisma/client';
import CalendarService from '../../src/services/calendar.services';
import { AccessDeniedAdminOnlyException } from '../../src/utils/errors.utils';
import { batmanAppAdmin, wonderwomanGuest } from '../test-data/users.test-data';
import { createTestOrganization, createTestUser, resetUsers } from '../test-utils';

describe('Calendar Tests', () => {
  let orgId: string;
  let organization: Organization;

  beforeEach(async () => {
    organization = await createTestOrganization();
    orgId = organization.organizationId;
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
            [],
            organization,
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
