import { Organization } from '@prisma/client';
import { createTestOrganization, createTestTask, createTestUser, resetUsers } from '../test-utils';
import { batmanAppAdmin, supermanAdmin } from '../test-data/users.test-data';
import UsersService from '../../src/services/users.services';
import { NotFoundException } from '../../src/utils/errors.utils';
import TeamsService from '../../src/services/teams.services';

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
      const testTeam = await TeamsService.createTeam(
        testBatman,
        'Test Task team',
        testBatman.userId,
        'Test',
        '',
        false,
        organization
      );
      const { task } = await createTestTask(testBatman, testTeam, organization);
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
      const testClarkKent = await createTestUser(supermanAdmin, orgId);
      const testTeam = await TeamsService.createTeam(
        testBatman,
        'Many Tasks Test team',
        testBatman.userId,
        'Test',
        '',
        false,
        organization
      );
      const { task: batmanTask } = await createTestTask(testBatman, testTeam, organization);
      const { task: clarkKentTask } = await createTestTask(testClarkKent, testTeam, organization);
      const userTasks = await UsersService.getManyUserTasks([testBatman.userId, testClarkKent.userId], organization);

      expect(userTasks).toStrictEqual([batmanTask, clarkKentTask]);
    });
  });
});
