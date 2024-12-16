import { Organization } from '@prisma/client';
import { createTestOrganization, createTestTask, createTestUser, resetUsers } from '../test-utils';
import { batmanAppAdmin } from '../test-data/users.test-data';
import UsersService from '../../src/services/users.services';
import { NotFoundException } from '../../src/utils/errors.utils';
import NotificationsService from '../../src/services/notifications.services';

describe('User Tests', () => {
  let orgId: string;
  let organization: Organization;
  beforeEach(async () => {
    organization = await createTestOrganization();
    orgId = organization.organizationId;
  });

  afterEach(async () => {
    await resetUsers();
  });

  describe('Get Users Tasks', () => {
    it('fails on invalid user id', async () => {
      await expect(async () => await UsersService.getUserTasks('1', organization)).rejects.toThrow(
        new NotFoundException('User', '1')
      );
    });

    it("Succeeds and gets user's assigned tasks", async () => {
      const testBatman = await createTestUser(batmanAppAdmin, orgId);

      const { task } = await createTestTask(testBatman, organization);
      const userTasks = await UsersService.getUserTasks(testBatman.userId, organization);

      expect(userTasks).toStrictEqual([task]);
    });
  });

  describe('Get Many Users Tasks', () => {
    it('fails on invalid user id', async () => {
      await expect(async () => await UsersService.getManyUserTasks(['1'], organization)).rejects.toThrow(
        new NotFoundException('User', '1')
      );
    });

    it("Succeeds and gets all user' tasks in the list", async () => {
      const testBatman = await createTestUser(batmanAppAdmin, orgId);
      const { task: batmanTask } = await createTestTask(testBatman, organization);
      const userTasks = await UsersService.getManyUserTasks([testBatman.userId, testBatman.userId], organization);

      expect(userTasks).toStrictEqual([batmanTask, batmanTask]);
    });
  });

  describe('Get Notifications', () => {
    it('fails on invalid user id', async () => {
      await expect(async () => await UsersService.getUserUnreadNotifications('1', organization)).rejects.toThrow(
        new NotFoundException('User', '1')
      );
    });

    it('Succeeds and gets user notifications', async () => {
      const testBatman = await createTestUser(batmanAppAdmin, orgId);
      await NotificationsService.sendNotifcationToUsers('test1', 'test1', [testBatman.userId], orgId);
      await NotificationsService.sendNotifcationToUsers('test2', 'test2', [testBatman.userId], orgId);

      const notifications = await UsersService.getUserUnreadNotifications(testBatman.userId, organization);

      expect(notifications).toHaveLength(2);
      expect(notifications[0].text).toBe('test1');
      expect(notifications[1].text).toBe('test2');
    });
  });

  describe('Remove Notifications', () => {
    it('Fails with invalid user', async () => {
      const testBatman = await createTestUser(batmanAppAdmin, orgId);
      await NotificationsService.sendNotifcationToUsers('test1', 'test1', [testBatman.userId], orgId);
      const notifications = await UsersService.getUserUnreadNotifications(testBatman.userId, organization);

      await expect(
        async () => await UsersService.removeUserNotification('1', notifications[0].notificationId, organization)
      ).rejects.toThrow(new NotFoundException('User', '1'));
    });

    it('Succeeds and gets user notifications', async () => {
      const testBatman = await createTestUser(batmanAppAdmin, orgId);
      await NotificationsService.sendNotifcationToUsers('test1', 'test1', [testBatman.userId], orgId);
      await NotificationsService.sendNotifcationToUsers('test2', 'test2', [testBatman.userId], orgId);

      const notifications = await UsersService.getUserUnreadNotifications(testBatman.userId, organization);

      expect(notifications).toHaveLength(2);
      expect(notifications[0].text).toBe('test1');
      expect(notifications[1].text).toBe('test2');

      const updatedNotifications = await UsersService.removeUserNotification(
        testBatman.userId,
        notifications[0].notificationId,
        organization
      );

      expect(updatedNotifications).toHaveLength(1);
      expect(updatedNotifications[0].text).toBe('test2');
    });
  });
});
