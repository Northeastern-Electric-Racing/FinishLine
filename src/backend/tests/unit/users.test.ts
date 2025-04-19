import { Organization } from '@prisma/client';
import { createTestOrganization, createTestTaskWithOrganization, createTestUser, resetUsers } from '../test-utils';
import { batmanAppAdmin, supermanAdmin } from '../test-data/users.test-data';
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

  describe('Get Users Teams', () => {
    it('fails on invalid user id', async () => {
      await expect(async () => await UsersService.getUserTeams('1')).rejects.toThrow(new NotFoundException('User', '1'));
    });

    it('Succeeds and gets all teams the user is a part of', async () => {
      const testBatman = await createTestUser(batmanAppAdmin, orgId);
      const testSuperman = await createTestUser(supermanAdmin, orgId);

      const electricalTeam = await prisma.team.create({
        data: {
          teamName: 'Electrical',
          slackId: '1',
          organizationId: orgId,
          headId: testBatman.userId
        }
      });
      const mechanicalTeam = await prisma.team.create({
        data: {
          teamName: 'Mechanical',
          slackId: '2',
          organizationId: orgId,
          headId: testSuperman.userId,
          leads: { connect: { userId: testBatman.userId } }
        }
      });
      const softwareTeam = await prisma.team.create({
        data: {
          teamName: 'Software',
          slackId: '3',
          organizationId: orgId,
          headId: testSuperman.userId,
          members: { connect: { userId: testBatman.userId } }
        }
      });

      const userTeams = await UsersService.getUserTeams(testBatman.userId);
      expect(userTeams).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ teamId: electricalTeam.teamId, teamName: 'Electrical' }),
          expect.objectContaining({ teamId: mechanicalTeam.teamId, teamName: 'Mechanical' }),
          expect.objectContaining({ teamId: softwareTeam.teamId, teamName: 'Software' })
        ])
      );
    });
  });
});
