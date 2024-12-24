import { Organization, User } from '@prisma/client';
import { createTestOrganization, createTestUser, resetUsers } from '../test-utils';
import {
  batmanAppAdmin,
  batmanSettings,
  supermanAdmin,
  supermanSettings,
  wonderwomanGuest,
  wonderwomanSettings
} from '../test-data/users.test-data';
import AnnouncementService from '../../src/services/announcement.service';
import { NotFoundException } from '../../src/utils/errors.utils';

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
    const announcement = await AnnouncementService.createAnnouncement(
      'text',
      [superman.userId, batman.userId],
      new Date(1000000000000),
      'sender name',
      'slack id',
      'channel name',
      orgId
    );
    expect(announcement?.text).toBe('text');
    expect(announcement?.usersReceived).toHaveLength(2);
    expect(announcement?.senderName).toBe('sender name');
    expect(announcement?.dateMessageSent).toStrictEqual(new Date(1000000000000));
    expect(announcement?.slackEventId).toBe('slack id');
    expect(announcement?.slackChannelName).toBe('channel name');
    expect(announcement?.dateDeleted).toBeUndefined();

    const smAnnouncements = await AnnouncementService.getUserUnreadAnnouncements(superman.userId, orgId);
    const bmAnnouncements = await AnnouncementService.getUserUnreadAnnouncements(batman.userId, orgId);
    const wwAnnouncements = await AnnouncementService.getUserUnreadAnnouncements(wonderwoman.userId, orgId);

    expect(smAnnouncements).toHaveLength(1);
    expect(smAnnouncements[0]?.text).toBe('text');
    expect(smAnnouncements[0]?.usersReceived).toHaveLength(2);
    expect(smAnnouncements[0]?.senderName).toBe('sender name');
    expect(smAnnouncements[0]?.dateMessageSent).toStrictEqual(new Date(1000000000000));
    expect(smAnnouncements[0]?.slackEventId).toBe('slack id');
    expect(smAnnouncements[0]?.slackChannelName).toBe('channel name');
    expect(smAnnouncements[0]?.dateDeleted).toBeUndefined();

    expect(bmAnnouncements).toHaveLength(1);
    expect(wwAnnouncements).toHaveLength(0);
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

    let smAnnouncements = await AnnouncementService.getUserUnreadAnnouncements(superman.userId, orgId);
    let bmAnnouncements = await AnnouncementService.getUserUnreadAnnouncements(batman.userId, orgId);
    let wwAnnouncements = await AnnouncementService.getUserUnreadAnnouncements(wonderwoman.userId, orgId);

    expect(smAnnouncements).toHaveLength(1);
    expect(bmAnnouncements).toHaveLength(1);
    expect(wwAnnouncements).toHaveLength(0);

    const updatedAnnouncement = await AnnouncementService.updateAnnouncement(
      'new text',
      [batman.userId, wonderwoman.userId],
      new Date(1000000000000),
      'sender name',
      'slack id',
      'channel name',
      orgId
    );

    smAnnouncements = await AnnouncementService.getUserUnreadAnnouncements(superman.userId, orgId);
    bmAnnouncements = await AnnouncementService.getUserUnreadAnnouncements(batman.userId, orgId);
    wwAnnouncements = await AnnouncementService.getUserUnreadAnnouncements(wonderwoman.userId, orgId);

    expect(smAnnouncements).toHaveLength(0);
    expect(bmAnnouncements).toHaveLength(1);
    expect(wwAnnouncements).toHaveLength(1);
    expect(bmAnnouncements[0]?.text).toBe('new text');
    expect(wwAnnouncements[0]?.text).toBe('new text');
    expect(updatedAnnouncement?.text).toBe('new text');
  });

  it('fails to update if there is no slack id', async () => {
    await expect(
      async () =>
        await AnnouncementService.updateAnnouncement(
          'new text',
          [batman.userId, wonderwoman.userId],
          new Date(1000000000000),
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

    let smAnnouncements = await AnnouncementService.getUserUnreadAnnouncements(superman.userId, orgId);
    let bmAnnouncements = await AnnouncementService.getUserUnreadAnnouncements(batman.userId, orgId);

    expect(smAnnouncements).toHaveLength(1);
    expect(bmAnnouncements).toHaveLength(1);

    const deletedAnnouncement = await AnnouncementService.deleteAnnouncement('slack id', orgId);

    smAnnouncements = await AnnouncementService.getUserUnreadAnnouncements(superman.userId, orgId);
    bmAnnouncements = await AnnouncementService.getUserUnreadAnnouncements(batman.userId, orgId);

    expect(smAnnouncements).toHaveLength(0);
    expect(bmAnnouncements).toHaveLength(0);
    expect(deletedAnnouncement?.text).toBe('text');
    expect(deletedAnnouncement?.dateDeleted).toBeDefined();
  });

  it('throws if it cannot find the announcement to delete', async () => {
    await expect(async () => await AnnouncementService.deleteAnnouncement('non-existent id', orgId)).rejects.toThrow(
      new NotFoundException('Announcement', 'non-existent id')
    );
  });

  describe('Get Announcements', () => {
    it('Succeeds and gets user announcements', async () => {
      await AnnouncementService.createAnnouncement(
        'test1',
        [batman.userId],
        new Date(),
        'Thomas Emrax',
        '1',
        'software',
        organization.organizationId
      );
      await AnnouncementService.createAnnouncement(
        'test2',
        [batman.userId],
        new Date(),
        'Superman',
        '50',
        'mechanical',
        organization.organizationId
      );

      const announcements = await AnnouncementService.getUserUnreadAnnouncements(batman.userId, organization.organizationId);

      expect(announcements).toHaveLength(2);
      expect(announcements[0].text).toBe('test1');
      expect(announcements[1].text).toBe('test2');
    });
  });

  describe('Remove Announcement', () => {
    it('Succeeds and removes user announcement', async () => {
      await AnnouncementService.createAnnouncement(
        'test1',
        [batman.userId],
        new Date(),
        'Thomas Emrax',
        '1',
        'software',
        organization.organizationId
      );
      await AnnouncementService.createAnnouncement(
        'test2',
        [batman.userId],
        new Date(),
        'Superman',
        '50',
        'mechanical',
        organization.organizationId
      );

      const announcements = await AnnouncementService.getUserUnreadAnnouncements(batman.userId, organization.organizationId);

      expect(announcements).toHaveLength(2);
      expect(announcements[0].text).toBe('test1');
      expect(announcements[1].text).toBe('test2');

      const updatedAnnouncements = await AnnouncementService.removeUserAnnouncement(
        batman.userId,
        announcements[0].announcementId,
        organization.organizationId
      );

      expect(updatedAnnouncements).toHaveLength(1);
      expect(updatedAnnouncements[0].text).toBe('test2');
    });
  });
});
