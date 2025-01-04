import { Organization } from '@prisma/client';
import { createTestOrganization, createTestTask, createTestUser, resetUsers } from '../test-utils';
import { batmanAppAdmin } from '../test-data/users.test-data';
import UsersService from '../../src/services/users.services';
import { NotFoundException } from '../../src/utils/errors.utils';
import { TaskPriority, TaskStatus } from 'shared';

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

      await createTestTask(
        testBatman,
        'Test task 1',
        'test 1',
        [testBatman],
        TaskPriority.Low,
        TaskStatus.IN_PROGRESS,
        organization.organizationId
      );
      const userTasks = await UsersService.getUserTasks(testBatman.userId, organization);

      expect(userTasks).toHaveLength(1);
      expect(userTasks[0].title).toBe('Test task 1');
    });
  });

  describe('Get Many Users Tasks', () => {
    it('fails on invalid user id', async () => {
      await expect(async () => await UsersService.getManyUserTasks(['1'], organization)).rejects.toThrow(
        new NotFoundException('User', '1')
      );
    });

    it("Succeeds and gets all a user's tasks in the list", async () => {
      const testBatman = await createTestUser(batmanAppAdmin, orgId);
      await createTestTask(
        testBatman,
        'Test task 1',
        'test 1',
        [testBatman],
        TaskPriority.Low,
        TaskStatus.IN_PROGRESS,
        organization.organizationId,
        new Date(),
        {
          carNumber: 0,
          projectNumber: 0,
          workPackageNumber: 0
        }
      );
      await createTestTask(
        testBatman,
        'Test task 2',
        'test 2',
        [testBatman],
        TaskPriority.High,
        TaskStatus.IN_BACKLOG,
        organization.organizationId,
        new Date(),
        {
          carNumber: 1,
          projectNumber: 1,
          workPackageNumber: 1
        }
      );

      const userTasks = await UsersService.getManyUserTasks([testBatman.userId, testBatman.userId], organization);

      expect(userTasks[0].title).toStrictEqual('Test task 1');
      expect(userTasks[1].title).toStrictEqual('Test task 2');
    });
  });
});
