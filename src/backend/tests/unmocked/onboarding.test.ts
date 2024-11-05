import { Organization } from '@prisma/client';
import { createTestOrganization, createTestTeamType, createTestUser, resetUsers } from '../test-utils';
import OnboardingServices from '../../src/services/onboarding.services';
import { batmanAppAdmin, wonderwomanGuest } from '../test-data/users.test-data';
import { AccessDeniedAdminOnlyException, HttpException, NotFoundException } from '../../src/utils/errors.utils';
import TeamsService from '../../src/services/teams.services';
import prisma from '../../src/prisma/prisma';

describe('Onboarding tests', () => {
  let orgId: string;
  let organization: Organization;

  beforeEach(async () => {
    organization = await createTestOrganization();
    orgId = organization.organizationId;
  });

  afterEach(async () => {
    await resetUsers();
  });

  describe('Create Checklist', () => {
    it('Fails if user is not admin', async () => {
      await expect(
        async () =>
          await OnboardingServices.createChecklist(
            await createTestUser(wonderwomanGuest, orgId),
            'name',
            'teamTypeId',
            organization
          )
      ).rejects.toThrow(new AccessDeniedAdminOnlyException('non-admin tried to create a checklist'));
    });

    it('Fails if team type does not exits', async () => {
      await expect(
        async () =>
          await OnboardingServices.createChecklist(
            await createTestUser(batmanAppAdmin, orgId),
            'name',
            'teamType',
            organization
          )
      ).rejects.toThrow(new NotFoundException('Team Type', 'teamType'));
    });

    it('Suceeds and creates a checklist', async () => {
      createTestTeamType('id', organization);
      const result = await OnboardingServices.createChecklist(
        await createTestUser(batmanAppAdmin, orgId),
        'name',
        'id',
        organization
      );
      expect(result.name).toEqual('name');
      expect(result.teamTypeId).toEqual('id');
    });
  });

  describe("Get User's Checklists", () => {
    it('Returns all general checklists when checklist fails to match user teamType', async () => {
      createTestTeamType('id', organization);
      const user = await createTestUser(batmanAppAdmin, orgId);

      // Create a team and add the user as a member
      const team = await TeamsService.createTeam(
        user,
        'Engineering Team',
        user.userId,
        'slackId123',
        'This is the engineering team',
        false,
        organization
      );
      await prisma.team.update({
        where: { teamId: team.teamId },
        data: { members: { connect: { userId: user.userId } } }
      });

      // Create a checklist, set its teamTypeId to null to be a general checklist
      const checklist = await OnboardingServices.createChecklist(user, 'General Checklist', 'id', organization);
      const generalChecklist = await prisma.checklist.update({
        where: { checklistId: checklist.checklistId },
        data: { teamTypeId: null }
      });

      const result = await OnboardingServices.getUsersChecklists(user.userId);
      expect(result).toStrictEqual([generalChecklist]);
    });

    it('Returns all general checklist and matching checklists of user teamType', async () => {
      const teamType = createTestTeamType('id', organization);
      const user = await createTestUser(batmanAppAdmin, orgId);

      // Create a team and add the user as a member
      const team = await TeamsService.createTeam(
        user,
        'Engineering Team',
        user.userId,
        'slackId123',
        'This is the engineering team',
        false,
        organization
      );
      await prisma.team.update({
        where: { teamId: team.teamId },
        data: {
          members: { connect: { userId: user.userId } },
          teamType: { connect: { teamTypeId: (await teamType).teamTypeId } }
        }
      });

      // Create a checklist, set its teamTypeId to null to be a general checklist
      const checklist = await OnboardingServices.createChecklist(user, 'General Checklist', 'id', organization);
      const generalChecklist = await prisma.checklist.update({
        where: { checklistId: checklist.checklistId },
        data: { teamTypeId: null }
      });

      // Create a checklist that matches the user's team type
      const teamChecklist = await OnboardingServices.createChecklist(user, 'Team Checklist', 'id', organization);

      const result = await OnboardingServices.getUsersChecklists(user.userId);
      expect(result).toMatchObject([generalChecklist, teamChecklist]);
    });

    it('Throws an error if the user does not have any teams', async () => {
      await expect(async () => await OnboardingServices.getUsersChecklists('fakeId')).rejects.toThrow(
        new HttpException(404, 'This user does not have any teams')
      );
    });

    it('Returns an empty array when a user is on a team but there are no checklists', async () => {
      const teamType = createTestTeamType('id', organization);
      const user = await createTestUser(batmanAppAdmin, orgId);

      // Create a team and add the user as a member
      const team = await TeamsService.createTeam(
        user,
        'Engineering Team',
        user.userId,
        'slackId123',
        'This is the engineering team',
        false,
        organization
      );
      await prisma.team.update({
        where: { teamId: team.teamId },
        data: {
          members: { connect: { userId: user.userId } },
          teamType: { connect: { teamTypeId: (await teamType).teamTypeId } }
        }
      });

      const result = await OnboardingServices.getUsersChecklists(user.userId);
      expect(result).toStrictEqual([]);
    });
  });
});
