import TeamsService from '../../src/services/teams.services';
import {
  AccessDeniedAdminOnlyException,
  AccessDeniedException,
  HttpException,
  NotFoundException
} from '../../src/utils/errors.utils';
import { batmanAppAdmin, supermanAdmin, wonderwomanGuest } from '../test-data/users.test-data';
import { createTestOrganization, createTestUser, resetUsers } from '../test-utils';
import { vi } from 'vitest';

vi.mock('../../src/utils/google-integration.utils', () => ({
  uploadFile: vi.fn()
}));

describe('Team Type Tests', () => {
  let orgId: string;
  beforeEach(async () => {
    orgId = (await createTestOrganization()).organizationId;
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
            '',
            null,
            orgId
          )
      ).rejects.toThrow(new AccessDeniedAdminOnlyException('create a team type'));
    });

    it('Create team type fails if there is already another team type with the same name', async () => {
      await TeamsService.createTeamType(
        await createTestUser(supermanAdmin, orgId),
        'teamType1',
        'YouTubeIcon',
        '',
        null,
        orgId
      );
      await expect(
        async () =>
          await TeamsService.createTeamType(
            await createTestUser(batmanAppAdmin, orgId),
            'teamType1',
            'Warning icon',
            '',
            null,
            orgId
          )
      ).rejects.toThrow(new HttpException(400, 'Cannot create a teamType with a name that already exists'));
    });

    it('Create team type works', async () => {
      const result = await TeamsService.createTeamType(
        await createTestUser(supermanAdmin, orgId),
        'teamType3',
        'YouTubeIcon',
        '',
        null,
        orgId
      );

      expect(result).toEqual({
        name: 'teamType3',
        iconName: 'YouTubeIcon',
        imageFileId: null,
        description: '',
        organizationId: orgId,
        teamTypeId: result.teamTypeId
      });
    });
  });

  describe('Get all team types', () => {
    it('Get all team types works', async () => {
      const teamType1 = await TeamsService.createTeamType(
        await createTestUser(supermanAdmin, orgId),
        'teamType1',
        'YouTubeIcon',
        '',
        null,
        orgId
      );
      const teamType2 = await TeamsService.createTeamType(
        await createTestUser(batmanAppAdmin, orgId),
        'teamType2',
        'WarningIcon',
        '',
        null,
        orgId
      );
      const result = await TeamsService.getAllTeamTypes(orgId);
      expect(result).toStrictEqual([teamType1, teamType2]);
    });
  });

  describe('Get a single team type', () => {
    it('Get a single team type works', async () => {
      const teamType1 = await TeamsService.createTeamType(
        await createTestUser(supermanAdmin, orgId),
        'teamType1',
        'YouTubeIcon',
        '',
        null,
        orgId
      );
      const result = await TeamsService.getSingleTeamType(teamType1.teamTypeId, orgId);
      expect(result).toStrictEqual(teamType1);
    });

    it('Get a single team type fails', async () => {
      const nonExistingTeamTypeId = 'nonExistingId';
      await expect(async () => TeamsService.getSingleTeamType(nonExistingTeamTypeId, orgId)).rejects.toThrow(
        new NotFoundException('Team Type', nonExistingTeamTypeId)
      );
    });
  });

  describe('Edit team type', () => {
    it('fails if user is not an admin', async () => {
      await expect(
        async () =>
          await TeamsService.editTeamType(
            await createTestUser(wonderwomanGuest, orgId),
            'id',
            'new name',
            'new icon',
            'new description',
            null,
            orgId
          )
      ).rejects.toThrow(new AccessDeniedException('you must be an admin to edit the team types description'));
    });

    it('fails if the new description is over 300 workds', async () => {
      await expect(
        async () =>
          await TeamsService.editTeamType(
            await createTestUser(supermanAdmin, orgId),
            'id',
            'new name',
            'new icon',
            'a '.repeat(301),
            null,
            orgId
          )
      ).rejects.toThrow(new HttpException(400, 'Description must be less than 300 words'));
    });

    it('succeds and updates the team type', async () => {
      const teamType = await TeamsService.createTeamType(
        await createTestUser(supermanAdmin, orgId),
        'teamType1',
        'YouTubeIcon',
        '',
        null,
        orgId
      );
      const updatedTeamType = await TeamsService.editTeamType(
        await createTestUser(batmanAppAdmin, orgId),
        teamType.teamTypeId,
        'new name',
        'new icon',
        'new description',
        'imageUrl',
        orgId
      );
      expect(updatedTeamType.name).toBe('new name');
      expect(updatedTeamType.iconName).toBe('new icon');
      expect(updatedTeamType.description).toBe('new description');
      expect(updatedTeamType.imageFileId).toBe('imageUrl');
    });
  });
});
