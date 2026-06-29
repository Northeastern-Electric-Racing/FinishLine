import { Organization } from '@prisma/client';
import { createTestOrganization, createTestTaskWithOrganization, createTestUser, resetUsers } from '../test-utils.js';
import {
  batmanAppAdmin,
  aquamanLeadership,
  wonderwomanGuest,
  member,
  greenlanternHead
} from '../test-data/users.test-data.js';
import UsersService from '../../src/services/users.services.js';
import { NotFoundException, AccessDeniedException } from '../../src/utils/errors.utils.js';
import { RoleEnum } from 'shared';
import { vi, Mock } from 'vitest';
import * as slackIntegration from '../../src/integrations/slack.js';

vi.mock('../../src/integrations/slack.js', () => ({
  validateSlackUserId: vi.fn()
}));

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

  describe('Update User Role', () => {
    it('allows leadership to promote guest to member', async () => {
      const leadership = await createTestUser(aquamanLeadership, orgId);
      const guest = await createTestUser(wonderwomanGuest, orgId);

      const updatedUser = await UsersService.updateUserRole(guest.userId, leadership, RoleEnum.MEMBER, organization);

      expect(updatedUser.role).toBe(RoleEnum.MEMBER);
    });

    it('prevents leadership from promoting guest to head', async () => {
      const leadership = await createTestUser(aquamanLeadership, orgId);
      const guest = await createTestUser(wonderwomanGuest, orgId);

      await expect(
        async () => await UsersService.updateUserRole(guest.userId, leadership, RoleEnum.HEAD, organization)
      ).rejects.toThrow(new AccessDeniedException('Cannot promote someone to your own role or higher'));
    });

    it('prevents leadership from promoting member to higher role', async () => {
      const leadership = await createTestUser(aquamanLeadership, orgId);
      const memberUser = await createTestUser(member, orgId);

      await expect(
        async () => await UsersService.updateUserRole(memberUser.userId, leadership, RoleEnum.HEAD, organization)
      ).rejects.toThrow(new AccessDeniedException('Cannot promote someone to your own role or higher'));
    });

    it('allows head to promote guest to member (existing functionality)', async () => {
      const head = await createTestUser(greenlanternHead, orgId);
      const guest = await createTestUser(wonderwomanGuest, orgId);

      const updatedUser = await UsersService.updateUserRole(guest.userId, head, RoleEnum.MEMBER, organization);

      expect(updatedUser.role).toBe(RoleEnum.MEMBER);
    });

    it('prevents guest from updating any user role', async () => {
      const guest1 = await createTestUser(wonderwomanGuest, orgId);
      const guest2 = await createTestUser(
        {
          ...wonderwomanGuest,
          googleAuthId: 'guest2',
          email: 'guest2@test.com',
          emailId: 'guest2'
        },
        orgId
      );

      await expect(
        async () => await UsersService.updateUserRole(guest2.userId, guest1, RoleEnum.MEMBER, organization)
      ).rejects.toThrow(new AccessDeniedException('Guests and members cannot update user roles!'));
    });

    it('prevents member from updating any user role', async () => {
      const memberUser = await createTestUser(member, orgId);
      const guest = await createTestUser(wonderwomanGuest, orgId);

      await expect(
        async () => await UsersService.updateUserRole(guest.userId, memberUser, RoleEnum.MEMBER, organization)
      ).rejects.toThrow(new AccessDeniedException('Guests and members cannot update user roles!'));
    });
  });

  describe('Validate Slack id tests', () => {
    it('returns true for a valid Slack id', async () => {
      (slackIntegration.validateSlackUserId as Mock).mockResolvedValue(true);
      const result = await UsersService.validateSlackId('U06D5RURPMF');
      expect(result).toBe(true);
    });

    it('returns false for an invalid Slack id', async () => {
      (slackIntegration.validateSlackUserId as Mock).mockResolvedValue(false);
      const result = await UsersService.validateSlackId('BLAH');
      expect(result).toBe(false);
    });

    it('returns false when Slack client is not configured', async () => {
      (slackIntegration.validateSlackUserId as Mock).mockResolvedValue(false);
      const result = await UsersService.validateSlackId('U06D5RURPMF');
      expect(result).toBe(false);
    });
  });
});
