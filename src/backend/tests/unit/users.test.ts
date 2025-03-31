import { Organization } from '@prisma/client';
import { createTestOrganization, createTestTaskWithOrganization, createTestUser, resetUsers } from '../test-utils';
import { alfred, aquamanLeadership, batmanAppAdmin, wonderwomanGuest } from '../test-data/users.test-data';
import UsersService from '../../src/services/users.services';
import { AccessDeniedException, NotFoundException } from '../../src/utils/errors.utils';
import { User } from '@prisma/client';
import { getUserRole } from '../../src/utils/users.utils';
import { RoleEnum } from 'shared/src/types/user-types';

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

      const { task } = await createTestTaskWithOrganization(testBatman, organization);
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
      const { task: batmanTask } = await createTestTaskWithOrganization(testBatman, organization);
      const userTasks = await UsersService.getManyUserTasks([testBatman.userId, testBatman.userId], organization);

      expect(userTasks).toStrictEqual([batmanTask, batmanTask]);
    });
  });

  describe('Leadership Promote Guests', () => {
    it('promotes guest to member', async () => {
      const testAquaman: User = await createTestUser(aquamanLeadership, orgId);
      const testGuest: User = await createTestUser(wonderwomanGuest, orgId);
      await UsersService.updateUserRole(testGuest.userId, testAquaman, RoleEnum.MEMBER, organization);
      expect(await getUserRole(testGuest.userId, orgId)).toBe(RoleEnum.MEMBER);
    });

    it('fails if Leader tries updating guests/members to higher than member', async () => {
      const testAquaman: User = await createTestUser(aquamanLeadership, orgId);
      const testGuest: User = await createTestUser(wonderwomanGuest, orgId);
      await expect(
        async () => await UsersService.updateUserRole(testGuest.userId, testAquaman, RoleEnum.LEADERSHIP, organization)
      ).rejects.toThrow(new AccessDeniedException('Leadership cannot promote guests/members to roles higher than member'));
    });

    it('fails is Leader tries updating leadership or higher', async () => {
      const testAdmin: User = await createTestUser(alfred, orgId);
      const testAquaman: User = await createTestUser(aquamanLeadership, orgId);
      await expect(
        async () => await UsersService.updateUserRole(testAdmin.userId, testAquaman, RoleEnum.LEADERSHIP, organization)
      ).rejects.toThrow(new AccessDeniedException('Leadership can only update guests and members'));
    });
  });
});
