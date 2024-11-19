import { Organization } from '@prisma/client';
import { createTestOrganization, createTestTask, createTestUser, resetUsers } from '../test-utils';
import { batmanAppAdmin } from '../test-data/users.test-data';
import UsersService from '../../src/services/users.services';
import { NotFoundException } from '../../src/utils/errors.utils';
import prisma from '../../src/prisma/prisma';

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

  describe('Send Notification', () => {
    it('fails on invalid user id', async () => {
      await expect(async () => await UsersService.sendNotification('1', 'test', 'test')).rejects.toThrow(
        new NotFoundException('User', '1')
      );
    });

    it('Succeeds and sends notification to user', async () => {
      const testBatman = await createTestUser(batmanAppAdmin, orgId);
      await UsersService.sendNotification(testBatman.userId, 'test1', 'test1');
      await UsersService.sendNotification(testBatman.userId, 'test2', 'test2');

      const batmanWithNotifications = await prisma.user.findUnique({
        where: { userId: testBatman.userId },
        include: { unreadNotifications: true }
      });

      expect(batmanWithNotifications?.unreadNotifications).toHaveLength(2);
      expect(batmanWithNotifications?.unreadNotifications[0].text).toBe('test1');
      expect(batmanWithNotifications?.unreadNotifications[1].text).toBe('test2');
    });
  });
});
