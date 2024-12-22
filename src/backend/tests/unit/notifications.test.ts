import { Organization } from '@prisma/client';
import { createTestOrganization, createTestUser, resetUsers } from '../test-utils';
import { batmanAppAdmin, supermanAdmin } from '../test-data/users.test-data';
import { NotFoundException } from '../../src/utils/errors.utils';
import prisma from '../../src/prisma/prisma';
import NotificationService from '../../src/services/notifications.services';

describe('Notifications Tests', () => {
  let orgId: string;
  let organization: Organization;
  beforeEach(async () => {
    organization = await createTestOrganization();
    orgId = organization.organizationId;
  });

  afterEach(async () => {
    await resetUsers();
  });

  describe('Send Notification', () => {
    it('fails on invalid user id', async () => {
      await expect(
        async () =>
          await NotificationService.sendNotifcationToUsers(
            'test notification',
            'star',
            ['1', '2'],
            organization.organizationId
          )
      ).rejects.toThrow(new NotFoundException('User', '1'));
    });

    it('Succeeds and sends notification to user', async () => {
      const testBatman = await createTestUser(batmanAppAdmin, orgId);
      const testSuperman = await createTestUser(supermanAdmin, orgId);
      await NotificationService.sendNotifcationToUsers(
        'test notification',
        'star',
        [testBatman.userId, testSuperman.userId],
        organization.organizationId
      );

      const batmanWithNotifications = await prisma.user.findUnique({
        where: { userId: testBatman.userId },
        include: { unreadNotifications: true }
      });

      const supermanWithNotifications = await prisma.user.findUnique({
        where: { userId: testBatman.userId },
        include: { unreadNotifications: true }
      });

      expect(batmanWithNotifications?.unreadNotifications).toHaveLength(1);
      expect(batmanWithNotifications?.unreadNotifications[0].text).toBe('test notification');
      expect(supermanWithNotifications?.unreadNotifications).toHaveLength(1);
      expect(supermanWithNotifications?.unreadNotifications[0].text).toBe('test notification');
    });
  });

  describe('Get Notifications', () => {
    it('Succeeds and gets user notifications', async () => {
      const testBatman = await createTestUser(batmanAppAdmin, orgId);
      await NotificationService.sendNotifcationToUsers('test1', 'test1', [testBatman.userId], orgId);
      await NotificationService.sendNotifcationToUsers('test2', 'test2', [testBatman.userId], orgId);

      const notifications = await NotificationService.getUserUnreadNotifications(
        testBatman.userId,
        organization.organizationId
      );

      expect(notifications).toHaveLength(2);
      expect(notifications[0].text).toBe('test1');
      expect(notifications[1].text).toBe('test2');
    });
  });

  describe('Remove Notifications', () => {
    it('Succeeds and removes user notification', async () => {
      const testBatman = await createTestUser(batmanAppAdmin, orgId);
      await NotificationService.sendNotifcationToUsers('test1', 'test1', [testBatman.userId], orgId);
      await NotificationService.sendNotifcationToUsers('test2', 'test2', [testBatman.userId], orgId);

      const notifications = await NotificationService.getUserUnreadNotifications(
        testBatman.userId,
        organization.organizationId
      );

      expect(notifications).toHaveLength(2);
      expect(notifications[0].text).toBe('test1');
      expect(notifications[1].text).toBe('test2');

      const updatedNotifications = await NotificationService.removeUserNotification(
        testBatman.userId,
        notifications[0].notificationId,
        organization.organizationId
      );

      expect(updatedNotifications).toHaveLength(1);
      expect(updatedNotifications[0].text).toBe('test2');
    });
  });
});
