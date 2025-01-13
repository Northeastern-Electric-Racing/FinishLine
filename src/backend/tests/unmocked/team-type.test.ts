import prisma from '../../src/prisma/prisma';
import { Organization } from '@prisma/client';
import TeamsService from '../../src/services/teams.services';
import {
  AccessDeniedAdminOnlyException,
  AccessDeniedException,
  HttpException,
  NotFoundException,
  DeletedException
} from '../../src/utils/errors.utils';
import { batmanAppAdmin, supermanAdmin, wonderwomanGuest } from '../test-data/users.test-data';
import { createTestOrganization, createTestUser, resetUsers } from '../test-utils';
import { vi } from 'vitest';

vi.mock('../../src/utils/google-integration.utils', async () => {
  const actual = await vi.importActual('../../src/utils/google-integration.utils');
  return {
    actual,
    uploadFile: vi.fn(),
    createCalendar: vi.fn().mockResolvedValue('mocked-calendar-id')
  };
});

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
            '',
            organization
          )
      ).rejects.toThrow(new AccessDeniedAdminOnlyException('create a team type'));
    });

    it('Create team type fails if there is already another team type with the same name', async () => {
      await TeamsService.createTeamType(
        await createTestUser(supermanAdmin, orgId),
        'teamType1',
        'YouTubeIcon',
        '',
        organization
      );

      await expect(
        async () =>
          await TeamsService.createTeamType(
            await createTestUser(batmanAppAdmin, orgId),
            'teamType1',
            'Warning icon',
            '',
            organization
          )
      ).rejects.toThrow(new HttpException(400, 'Cannot create a teamType with a name that already exists'));
    });

    it('Create team type works', async () => {
      const result = await TeamsService.createTeamType(
        await createTestUser(supermanAdmin, orgId),
        'teamType3',
        'YouTubeIcon',
        '',
        organization
      );

      expect(result).toEqual({
        name: 'teamType3',
        iconName: 'YouTubeIcon',
        description: '',
        imageFileId: null,
        organizationId: orgId,
        teamTypeId: result.teamTypeId,
        calendarId: 'mocked-calendar-id'
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
        organization
      );
      const teamType2 = await TeamsService.createTeamType(
        await createTestUser(batmanAppAdmin, orgId),
        'teamType2',
        'WarningIcon',
        '',
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
        '',
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
            organization
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
            organization
          )
      ).rejects.toThrow(new HttpException(400, 'Description must be less than 300 words'));
    });

    it('succeds and updates the team type', async () => {
      const teamType = await TeamsService.createTeamType(
        await createTestUser(supermanAdmin, orgId),
        'teamType1',
        'YouTubeIcon',
        '',
        organization
      );
      const updatedTeamType = await TeamsService.editTeamType(
        await createTestUser(batmanAppAdmin, orgId),
        teamType.teamTypeId,
        'new name',
        'new icon',
        'new description',
        organization
      );
      expect(updatedTeamType.name).toBe('new name');
      expect(updatedTeamType.iconName).toBe('new icon');
      expect(updatedTeamType.description).toBe('new description');
    });
  });

  describe('Delete team type', () => {
    it('Fails if user is not an admin', async () => {
      const teamType = await TeamsService.createTeamType(
        await createTestUser(supermanAdmin, orgId),
        'teamType1',
        '',
        '',
        organization
      );
      await expect(
        async () =>
          await TeamsService.deleteTeamType(await createTestUser(wonderwomanGuest, orgId), teamType.teamTypeId, organization)
      ).rejects.toThrow(new AccessDeniedAdminOnlyException('only admins can delete team types'));
    });

    it('Fails if team type doesn`t exist', async () => {
      await expect(
        async () => await TeamsService.deleteTeamType(await createTestUser(supermanAdmin, orgId), '1', organization)
      ).rejects.toThrow(new NotFoundException('Team Type', '1'));
    });

    it('Fails if team type is already deleted', async () => {
      const teamType = await TeamsService.createTeamType(
        await createTestUser(supermanAdmin, orgId),
        'teamType1',
        'YouTubeIcon',
        '',
        organization
      );
      await TeamsService.deleteTeamType(await createTestUser(supermanAdmin, orgId), teamType.teamTypeId, organization);

      await expect(
        async () =>
          await TeamsService.deleteTeamType(await createTestUser(batmanAppAdmin, orgId), teamType.teamTypeId, organization)
      ).rejects.toThrow(new DeletedException('Team Type', teamType.teamTypeId));
    });

    it('Successfully soft deletes the team type', async () => {
      const teamType = await TeamsService.createTeamType(
        await createTestUser(supermanAdmin, orgId),
        'teamType1',
        'YouTubeIcon',
        '',
        organization
      );
      await TeamsService.deleteTeamType(await createTestUser(batmanAppAdmin, orgId), teamType.teamTypeId, organization);

      const deletedTeamType = await prisma.team_Type.findUnique({
        where: { teamTypeId: teamType.teamTypeId }
      });

      expect(deletedTeamType).not.toBe(null);
      expect(deletedTeamType?.dateDeleted).not.toBe(null);
      expect(deletedTeamType?.deletedById).not.toBe(null);
    });
  });
});
