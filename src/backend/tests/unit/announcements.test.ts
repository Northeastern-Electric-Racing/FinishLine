import { Organization, User } from '@prisma/client';
import { createTestOrganization, createTestUser, resetUsers } from '../test-utils.js';
import {
  batmanAppAdmin,
  batmanSettings,
  supermanAdmin,
  supermanSettings,
  wonderwomanGuest,
  wonderwomanSettings
} from '../test-data/users.test-data.js';
import AnnouncementService from '../../src/services/announcement.services.js';
import { InvalidOrganizationException, NotFoundException } from '../../src/utils/errors.utils.js';
import prisma from '../../src/prisma/prisma.js';

describe('announcement tests', () => {
  let orgId: string;
  let organization: Organization;
  let batman: User;
  let superman: User;
  let wonderwoman: User;

  beforeEach(async () => {
    await resetUsers();
    organization = await createTestOrganization();
    orgId = organization.organizationId;
    batman = await createTestUser(batmanAppAdmin, orgId, batmanSettings);
    superman = await createTestUser(supermanAdmin, orgId, supermanSettings);
    wonderwoman = await createTestUser(wonderwomanGuest, orgId, wonderwomanSettings);
  });

  afterEach(async () => {
    await resetUsers();
  });

  it('creates announcements which can be recieved via users', async () => {
    await AnnouncementService.createAnnouncement(
      'text',
      [superman.userId, batman.userId],
      new Date(1000000000000),
      'sender name',
      'slack id',
      'channel name',
      orgId
    );

    const smPage = await AnnouncementService.getUserUnreadAnnouncements(superman.userId, orgId);
    const bmPage = await AnnouncementService.getUserUnreadAnnouncements(batman.userId, orgId);
    const wwPage = await AnnouncementService.getUserUnreadAnnouncements(wonderwoman.userId, orgId);

    expect(smPage.announcements).toHaveLength(1);
    expect(smPage.totalCount).toBe(1);
    expect(smPage.nextCursor).toBeUndefined();
    expect(smPage.announcements[0].text).toBe('text');
    expect(smPage.announcements[0].senderName).toBe('sender name');
    expect(smPage.announcements[0].dateMessageSent).toStrictEqual(new Date(1000000000000));
    expect(smPage.announcements[0].slackEventId).toBe('slack id');
    expect(smPage.announcements[0].slackChannelName).toBe('channel name');
    expect(smPage.announcements[0].dateDeleted).toBeUndefined();

    expect(bmPage.announcements).toHaveLength(1);
    expect(wwPage.announcements).toHaveLength(0);
    expect(wwPage.totalCount).toBe(0);
  });

  it('fails to create an announcement for a user outside the organization', async () => {
    const outsider = await prisma.user.create({
      data: { firstName: 'Out', lastName: 'Sider', email: 'outsider@test.com', googleAuthId: 'outsider' }
    });

    await expect(
      AnnouncementService.createAnnouncement(
        'text',
        [batman.userId, outsider.userId],
        new Date(),
        'sender name',
        'slack id',
        'channel name',
        orgId
      )
    ).rejects.toThrow(new InvalidOrganizationException('User'));
  });

  it('updates an announcement', async () => {
    await AnnouncementService.createAnnouncement(
      'text',
      [superman.userId, batman.userId],
      new Date(1000000000000),
      'sender name',
      'slack id',
      'channel name',
      orgId
    );

    let smPage = await AnnouncementService.getUserUnreadAnnouncements(superman.userId, orgId);
    let bmPage = await AnnouncementService.getUserUnreadAnnouncements(batman.userId, orgId);
    let wwPage = await AnnouncementService.getUserUnreadAnnouncements(wonderwoman.userId, orgId);

    expect(smPage.announcements).toHaveLength(1);
    expect(bmPage.announcements).toHaveLength(1);
    expect(wwPage.announcements).toHaveLength(0);

    await AnnouncementService.updateAnnouncement(
      'new text',
      [batman.userId, wonderwoman.userId],
      'sender name',
      'slack id',
      'channel name',
      orgId
    );

    smPage = await AnnouncementService.getUserUnreadAnnouncements(superman.userId, orgId);
    bmPage = await AnnouncementService.getUserUnreadAnnouncements(batman.userId, orgId);
    wwPage = await AnnouncementService.getUserUnreadAnnouncements(wonderwoman.userId, orgId);

    expect(smPage.announcements).toHaveLength(0);
    expect(bmPage.announcements).toHaveLength(1);
    expect(wwPage.announcements).toHaveLength(1);
    expect(bmPage.announcements[0].text).toBe('new text');
    expect(wwPage.announcements[0].text).toBe('new text');
  });

  it('fails to update if there is no slack id', async () => {
    await expect(
      async () =>
        await AnnouncementService.updateAnnouncement(
          'new text',
          [batman.userId, wonderwoman.userId],
          'sender name',
          'slack id',
          'channel name',
          orgId
        )
    ).rejects.toThrow(new NotFoundException('Announcement', 'slack id'));
  });

  it('deletes an announcement', async () => {
    await AnnouncementService.createAnnouncement(
      'text',
      [superman.userId, batman.userId],
      new Date(1000000000000),
      'sender name',
      'slack id',
      'channel name',
      orgId
    );

    let smPage = await AnnouncementService.getUserUnreadAnnouncements(superman.userId, orgId);
    let bmPage = await AnnouncementService.getUserUnreadAnnouncements(batman.userId, orgId);

    expect(smPage.announcements).toHaveLength(1);
    expect(bmPage.announcements).toHaveLength(1);

    await AnnouncementService.deleteAnnouncement('slack id', orgId);

    smPage = await AnnouncementService.getUserUnreadAnnouncements(superman.userId, orgId);
    bmPage = await AnnouncementService.getUserUnreadAnnouncements(batman.userId, orgId);

    expect(smPage.announcements).toHaveLength(0);
    expect(bmPage.announcements).toHaveLength(0);

    const deleted = await prisma.announcement.findUnique({ where: { slackEventId: 'slack id' } });
    expect(deleted?.text).toBe('text');
    expect(deleted?.dateDeleted).not.toBeNull();
  });

  it('throws if it cannot find the announcement to delete', async () => {
    await expect(async () => await AnnouncementService.deleteAnnouncement('non-existent id', orgId)).rejects.toThrow(
      new NotFoundException('Announcement', 'non-existent id')
    );
  });

  describe('Get Announcements', () => {
    it('Succeeds and gets user announcements newest first', async () => {
      await AnnouncementService.createAnnouncement(
        'test1',
        [batman.userId],
        new Date(1000),
        'Thomas Emrax',
        '1',
        'software',
        organization.organizationId
      );
      await AnnouncementService.createAnnouncement(
        'test2',
        [batman.userId],
        new Date(2000),
        'Superman',
        '50',
        'mechanical',
        organization.organizationId
      );

      const page = await AnnouncementService.getUserUnreadAnnouncements(batman.userId, organization.organizationId);

      expect(page.announcements).toHaveLength(2);
      expect(page.totalCount).toBe(2);
      expect(page.announcements[0].text).toBe('test2');
      expect(page.announcements[1].text).toBe('test1');
    });

    it('pages through announcements with a cursor', async () => {
      for (let i = 0; i < 12; i++) {
        await AnnouncementService.createAnnouncement(
          `test${i}`,
          [batman.userId],
          new Date(1000 * (i + 1)),
          'sender',
          `slack ${i}`,
          'channel',
          orgId
        );
      }

      const firstPage = await AnnouncementService.getUserUnreadAnnouncements(batman.userId, orgId);
      expect(firstPage.announcements).toHaveLength(10);
      expect(firstPage.totalCount).toBe(12);
      expect(firstPage.announcements[0].text).toBe('test11');
      expect(firstPage.nextCursor).toBe(firstPage.announcements[9].announcementId);

      const secondPage = await AnnouncementService.getUserUnreadAnnouncements(batman.userId, orgId, firstPage.nextCursor);
      expect(secondPage.announcements.map((announcement) => announcement.text)).toStrictEqual(['test1', 'test0']);
      expect(secondPage.totalCount).toBe(12);
      expect(secondPage.nextCursor).toBeUndefined();
    });
  });

  describe('Remove Announcement', () => {
    it("Fails for another organization's announcement", async () => {
      await AnnouncementService.createAnnouncement(
        'test1',
        [batman.userId],
        new Date(1000),
        'Thomas Emrax',
        '1',
        'software',
        orgId
      );
      const [announcement] = (await AnnouncementService.getUserUnreadAnnouncements(batman.userId, orgId)).announcements;
      const otherOrg = await prisma.organization.create({
        data: {
          name: 'Other',
          slug: 'other-org',
          description: '',
          applicationLink: '',
          userCreated: { connect: { userId: batman.userId } }
        }
      });

      await expect(
        AnnouncementService.removeUserAnnouncement(batman.userId, announcement.announcementId, otherOrg.organizationId)
      ).rejects.toThrow(new InvalidOrganizationException('Announcement'));
    });

    it('Succeeds and removes user announcement', async () => {
      await AnnouncementService.createAnnouncement(
        'test1',
        [batman.userId],
        new Date(1000),
        'Thomas Emrax',
        '1',
        'software',
        organization.organizationId
      );
      await AnnouncementService.createAnnouncement(
        'test2',
        [batman.userId],
        new Date(2000),
        'Superman',
        '50',
        'mechanical',
        organization.organizationId
      );

      const page = await AnnouncementService.getUserUnreadAnnouncements(batman.userId, organization.organizationId);
      expect(page.announcements).toHaveLength(2);

      await AnnouncementService.removeUserAnnouncement(batman.userId, page.announcements[0].announcementId, orgId);

      const updatedPage = await AnnouncementService.getUserUnreadAnnouncements(batman.userId, organization.organizationId);
      expect(updatedPage.announcements).toHaveLength(1);
      expect(updatedPage.totalCount).toBe(1);
      expect(updatedPage.announcements[0].text).toBe('test1');
    });
  });
});
