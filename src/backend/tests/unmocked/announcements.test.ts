import { Organization } from '@prisma/client';
import { batmanAppAdmin } from '../test-data/users.test-data.js';
import { createTestOrganization, createTestUser, resetUsers } from '../test-utils.js';
import AnnouncementService from '../../src/services/announcement.services.js';

describe('Announcemnts Tests', () => {
  let orgId: string;
  let organization: Organization;
  beforeEach(async () => {
    organization = await createTestOrganization();
    orgId = organization.organizationId;
  });

  afterEach(async () => {
    await resetUsers();
  });
  describe('Get Announcements', () => {
    it('Succeeds and gets user announcements', async () => {
      const testBatman = await createTestUser(batmanAppAdmin, orgId);
      await AnnouncementService.createAnnouncement(
        'test1',
        [testBatman.userId],
        new Date(1000),
        'Thomas Emrax',
        '1',
        'software',
        organization.organizationId
      );
      await AnnouncementService.createAnnouncement(
        'test2',
        [testBatman.userId],
        new Date(2000),
        'Superman',
        '50',
        'mechanical',
        organization.organizationId
      );

      const { announcements } = await AnnouncementService.getUserUnreadAnnouncements(
        testBatman.userId,
        organization.organizationId
      );

      // newest first
      expect(announcements).toHaveLength(2);
      expect(announcements[0].text).toBe('test2');
      expect(announcements[1].text).toBe('test1');
    });
  });

  describe('Remove Announcement', () => {
    it('Succeeds and removes user announcement', async () => {
      const testBatman = await createTestUser(batmanAppAdmin, orgId);
      await AnnouncementService.createAnnouncement(
        'test1',
        [testBatman.userId],
        new Date(1000),
        'Thomas Emrax',
        '1',
        'software',
        organization.organizationId
      );
      await AnnouncementService.createAnnouncement(
        'test2',
        [testBatman.userId],
        new Date(2000),
        'Superman',
        '50',
        'mechanical',
        organization.organizationId
      );

      const { announcements } = await AnnouncementService.getUserUnreadAnnouncements(
        testBatman.userId,
        organization.organizationId
      );
      expect(announcements).toHaveLength(2);

      await AnnouncementService.removeUserAnnouncement(testBatman.userId, announcements[0].announcementId);

      const { announcements: updatedAnnouncements } = await AnnouncementService.getUserUnreadAnnouncements(
        testBatman.userId,
        organization.organizationId
      );
      expect(updatedAnnouncements).toHaveLength(1);
      expect(updatedAnnouncements[0].text).toBe(announcements[1].text);
    });
  });
});
