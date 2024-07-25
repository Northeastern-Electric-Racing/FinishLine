import prisma from '../../src/prisma/prisma';
import TeamsService from '../../src/services/teams.services';
import {
  AccessDeniedAdminOnlyException,
  AccessDeniedException,
  HttpException,
  NotFoundException
} from '../../src/utils/errors.utils';
import { uploadFile } from '../../src/utils/google-integration.utils';
import { batmanAppAdmin, supermanAdmin, wonderwomanGuest } from '../test-data/users.test-data';
import { createTestOrganization, createTestUser, resetUsers } from '../test-utils';
import { Mock, vi } from 'vitest';

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

  describe('Set Image', () => {
    const TEST_FILE = { originalname: 'image1.png' } as Express.Multer.File;

    it('Fails if user is not an admin', async () => {
      const teamType = await TeamsService.createTeamType(
        await createTestUser(supermanAdmin, orgId),
        'teamType1',
        'YouTubeIcon',
        '',
        orgId
      );

      await expect(
        TeamsService.setImage(TEST_FILE, await createTestUser(wonderwomanGuest, orgId), orgId, teamType.teamTypeId)
      ).rejects.toThrow(new AccessDeniedAdminOnlyException('update images'));
    });

    it('Fails if an organization does not exist', async () => {
      const teamType = await TeamsService.createTeamType(
        await createTestUser(supermanAdmin, orgId),
        'teamType1',
        'YouTubeIcon',
        '',
        orgId
      );

      await expect(
        TeamsService.setImage(TEST_FILE, await createTestUser(batmanAppAdmin, orgId), '1', teamType.teamTypeId)
      ).rejects.toThrow(new HttpException(400, `Organization with id: 1 not found!`));
    });

    it('Succeeds and updates all the images', async () => {
      const testBatman = await createTestUser(batmanAppAdmin, orgId);
      const OTHER_FILE = { originalname: 'image2.png' } as Express.Multer.File;
      const teamType = await TeamsService.createTeamType(
        await createTestUser(supermanAdmin, orgId),
        'teamType1',
        'YouTubeIcon',
        '',
        orgId
      );

      (uploadFile as Mock).mockImplementation((file) => {
        return Promise.resolve({ id: `uploaded-${file.originalname}` });
      });

      await TeamsService.setImage(TEST_FILE, testBatman, orgId, teamType.teamTypeId);

      const organization = await prisma.team_Type.findUnique({
        where: {
          teamTypeId: teamType.teamTypeId
        }
      });

      expect(organization).not.toBeNull();
      expect(organization?.image).toBe('uploaded-image1.png');

      await TeamsService.setImage(OTHER_FILE, testBatman, orgId, teamType.teamTypeId);

      const updatedTeamType = await prisma.team_Type.findUnique({
        where: {
          teamTypeId: teamType.teamTypeId
        }
      });

      expect(updatedTeamType?.image).toBe('uploaded-image2.png');
    });
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
            orgId
          )
      ).rejects.toThrow(new AccessDeniedAdminOnlyException('create a team type'));
    });

    it('Create team type fails if there is already another team type with the same name', async () => {
      await TeamsService.createTeamType(await createTestUser(supermanAdmin, orgId), 'teamType1', 'YouTubeIcon', '', orgId);
      await expect(
        async () =>
          await TeamsService.createTeamType(
            await createTestUser(batmanAppAdmin, orgId),
            'teamType1',
            'Warning icon',
            '',
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
        orgId
      );

      expect(result).toEqual({
        name: 'teamType3',
        iconName: 'YouTubeIcon',
        image: null,
        description: '',
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
        '',
        orgId
      );
      const teamType2 = await TeamsService.createTeamType(
        await createTestUser(batmanAppAdmin, orgId),
        'teamType2',
        'WarningIcon',
        '',
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

  describe('Edit team type description', () => {
    it('fails if user is not an admin', async () => {
      await expect(
        async () =>
          await TeamsService.editTeamTypeDescription(
            await createTestUser(wonderwomanGuest, orgId),
            'id',
            'new description',
            orgId
          )
      ).rejects.toThrow(new AccessDeniedException('you must be an admin to edit the team types description'));
    });

    it('fails if the new description is over 300 workds', async () => {
      await expect(
        async () =>
          await TeamsService.editTeamTypeDescription(
            await createTestUser(supermanAdmin, orgId),
            'id',
            'a '.repeat(301),
            orgId
          )
      ).rejects.toThrow(new HttpException(400, 'Description must be less than 300 words'));
    });

    it('succeds and updates the description', async () => {
      const teamType = await TeamsService.createTeamType(
        await createTestUser(supermanAdmin, orgId),
        'teamType1',
        'YouTubeIcon',
        '',
        orgId
      );
      const updatedTeamType = await TeamsService.editTeamTypeDescription(
        await createTestUser(batmanAppAdmin, orgId),
        teamType.teamTypeId,
        'new description',
        orgId
      );
      expect(updatedTeamType.description).toBe('new description');
    });
  });
});
