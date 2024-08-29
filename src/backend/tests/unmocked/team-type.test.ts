import { Organization } from '@prisma/client';
import TeamsService from '../../src/services/teams.services';
import { AccessDeniedAdminOnlyException, HttpException, NotFoundException } from '../../src/utils/errors.utils';
import { batmanAppAdmin, supermanAdmin, wonderwomanGuest } from '../test-data/users.test-data';
import { createTestOrganization, createTestUser, resetUsers } from '../test-utils';

describe('Team Type Tests', () => {
  let orgId: string;
  let organization: Organization;
  beforeEach(async () => {
    organization = await createTestOrganization();
    orgId = organization.organizationId;
  });

  afterEach(async () => {
    await resetUsers();
  });

  describe('Create Team Type', () => {
    it('Create team type fails if user is not an admin', async () => {
      await expect(
        async () =>
          await TeamsService.createTeamType(
            await createTestUser(wonderwomanGuest, orgId),
            'Team 2',
            'Warning icon',
            organization
          )
      ).rejects.toThrow(new AccessDeniedAdminOnlyException('create a team type'));
    });

    it('Create team type fails if there is already another team type with the same name', async () => {
      await TeamsService.createTeamType(
        await createTestUser(supermanAdmin, orgId),
        'teamType1',
        'YouTubeIcon',
        organization
      );
      await expect(
        async () =>
          await TeamsService.createTeamType(
            await createTestUser(batmanAppAdmin, orgId),
            'teamType1',
            'Warning icon',
            organization
          )
      ).rejects.toThrow(new HttpException(400, 'Cannot create a teamType with a name that already exists'));
    });

    it('Create team type works', async () => {
      const result = await TeamsService.createTeamType(
        await createTestUser(supermanAdmin, orgId),
        'teamType3',
        'YouTubeIcon',
        organization
      );

      expect(result).toEqual({
        name: 'teamType3',
        iconName: 'YouTubeIcon',
        organizationId: orgId,
        teamTypeId: result.teamTypeId
      });
    });
  });

  describe('Get all team types works', () => {
    it('Get all team types works', async () => {
      const teamType1 = await TeamsService.createTeamType(
        await createTestUser(supermanAdmin, orgId),
        'teamType1',
        'YouTubeIcon',
        organization
      );
      const teamType2 = await TeamsService.createTeamType(
        await createTestUser(batmanAppAdmin, orgId),
        'teamType2',
        'WarningIcon',
        organization
      );
      const result = await TeamsService.getAllTeamTypes(organization);
      expect(result).toStrictEqual([teamType1, teamType2]);
    });
  });

  describe('Get a single team type', () => {
    it('Get a single team type works', async () => {
      const teamType1 = await TeamsService.createTeamType(
        await createTestUser(supermanAdmin, orgId),
        'teamType1',
        'YouTubeIcon',
        organization
      );
      const result = await TeamsService.getSingleTeamType(teamType1.teamTypeId, organization);
      expect(result).toStrictEqual(teamType1);
    });

    it('Get a single team type fails', async () => {
      const nonExistingTeamTypeId = 'nonExistingId';
      await expect(async () => TeamsService.getSingleTeamType(nonExistingTeamTypeId, organization)).rejects.toThrow(
        new NotFoundException('Team Type', nonExistingTeamTypeId)
      );
    });
  });
});
