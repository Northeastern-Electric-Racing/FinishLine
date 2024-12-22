import { Organization } from '@prisma/client';
import { batmanAppAdmin } from '../test-data/users.test-data';
import { createTestOrganization, createTestUser, resetUsers } from '../test-utils';
import AnnouncementService from '../../src/services/announcement.service';

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
        'Thomas Emrax',
        '1',
        'software',
        organization.organizationId
      );
      await AnnouncementService.createAnnouncement(
        'test2',
        [testBatman.userId],
        'Superman',
        '50',
        'mechanical',
        organization.organizationId
      );

      const announcements = await AnnouncementService.getUserUnreadAnnouncements(
        testBatman.userId,
        organization.organizationId
      );

      expect(announcements).toHaveLength(2);
      expect(announcements[0].text).toBe('test1');
      expect(announcements[1].text).toBe('test2');
    });
  });

  describe('Remove Announcement', () => {
    it('Succeeds and removes user announcement', async () => {
      const testBatman = await createTestUser(batmanAppAdmin, orgId);
      await AnnouncementService.createAnnouncement(
        'test1',
        [testBatman.userId],
        'Thomas Emrax',
        '1',
        'software',
        organization.organizationId
      );
      await AnnouncementService.createAnnouncement(
        'test2',
        [testBatman.userId],
        'Superman',
        '50',
        'mechanical',
        organization.organizationId
      );

      const announcements = await AnnouncementService.getUserUnreadAnnouncements(
        testBatman.userId,
        organization.organizationId
      );

      expect(announcements).toHaveLength(2);
      expect(announcements[0].text).toBe('test1');
      expect(announcements[1].text).toBe('test2');

      const updatedAnnouncements = await AnnouncementService.removeUserAnnouncement(
        testBatman.userId,
        announcements[0].announcementId,
        organization.organizationId
      );

      expect(updatedAnnouncements).toHaveLength(1);
      expect(updatedAnnouncements[0].text).toBe('test2');
    });
  });
});
