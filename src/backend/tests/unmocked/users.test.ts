import { Organization } from '@prisma/client';
import { createTestOrganization, createTestTask, createTestUser, resetUsers } from '../test-utils';
import { batmanAppAdmin } from '../test-data/users.test-data';
import UsersService from '../../src/services/users.services';

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
    it("Succeeds and gets user's assigned tasks", async () => {
      const testBatman = await createTestUser(batmanAppAdmin, orgId);
      const { task } = await createTestTask(testBatman, organization);

      const userTasks = await UsersService.getUserTasks(testBatman.userId, organization);

      expect(userTasks).toStrictEqual([task]);
    });
  });
});
