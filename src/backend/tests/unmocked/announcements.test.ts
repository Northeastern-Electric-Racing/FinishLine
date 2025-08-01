import { Organization } from '@prisma/client';
import { batmanAppAdmin } from '../test-data/users.test-data';
import { createTestOrganization, createTestUser, resetUsers } from '../test-utils';
import AnnouncementService from '../../src/services/announcement.services';
import { Announcement } from 'shared';

describe('Announcemnts Tests', () => {
  const announcementComparator = (a: Announcement, b: Announcement) => {
    // findMany does not guarantee order, so let's sort
    if (a.text < b.text) {
      return -1;
    }
    if (a.text > b.text) {
      return 1;
    }
    return 0;
  };

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
        new Date(),
        'Thomas Emrax',
        '1',
        'software',
        organization.organizationId
      );
      await AnnouncementService.createAnnouncement(
        'test2',
        [testBatman.userId],
        new Date(),
        'Superman',
        '50',
        'mechanical',
        organization.organizationId
      );

      const announcements = await AnnouncementService.getUserUnreadAnnouncements(
        testBatman.userId,
        organization.organizationId
      );
      announcements.sort(announcementComparator);

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
        new Date(),
        'Thomas Emrax',
        '1',
        'software',
        organization.organizationId
      );
      await AnnouncementService.createAnnouncement(
        'test2',
        [testBatman.userId],
        new Date(),
        'Superman',
        '50',
        'mechanical',
        organization.organizationId
      );

      const announcements = await AnnouncementService.getUserUnreadAnnouncements(
        testBatman.userId,
        organization.organizationId
      );
      announcements.sort(announcementComparator);

      expect(announcements).toHaveLength(2);
      expect(announcements.some((announcement) => announcement.text === 'test1')).toBe(true);
      expect(announcements.some((announcement) => announcement.text === 'test2')).toBe(true);

      const updatedAnnouncements = await AnnouncementService.removeUserAnnouncement(
        testBatman.userId,
        announcements[0].announcementId,
        organization.organizationId
      );
      updatedAnnouncements.sort(announcementComparator);

      expect(updatedAnnouncements).toHaveLength(1);
      expect(updatedAnnouncements[0].text).toBe('test2');
    });
  });
});
