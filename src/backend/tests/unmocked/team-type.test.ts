import prisma from '../../src/prisma/prisma';
import TeamsService from '../../src/services/teams.services';
import { AccessDeniedAdminOnlyException, HttpException } from '../../src/utils/errors.utils';
import { batman, superman, theVisitor } from '../test-data/users.test-data';

describe('Team Type Tests', () => {
  beforeEach(async () => {
    await prisma.design_Review.deleteMany();
    await prisma.teamType.deleteMany();
  });

  describe('Create Team Type', () => {
    it('Create team type fails if user is not an admin', async () => {
      await expect(async () => await TeamsService.createTeamType(theVisitor, 'Team 2', 'Warning icon')).rejects.toThrow(
        new AccessDeniedAdminOnlyException('create a team type')
      );
    });

    it('Create team type fails if there is already another team type with the same name', async () => {
      await TeamsService.createTeamType(superman, 'teamType1', 'YouTubeIcon');
      await expect(async () => await TeamsService.createTeamType(batman, 'teamType1', 'Warning icon')).rejects.toThrow(
        new HttpException(400, 'Cannot create a teamType with a name that already exists')
      );
    });

    it('Create team type works', async () => {
      const result = await TeamsService.createTeamType(superman, 'teamType3', 'YouTubeIcon');

      expect(result).toEqual({
        name: 'teamType3',
        iconName: 'YouTubeIcon',
        teamTypeId: result.teamTypeId
      });
    });
  });

  describe('Get all team types works', () => {
    it('Get all team types works', async () => {
      const teamType1 = await TeamsService.createTeamType(superman, 'teamType1', 'YouTubeIcon');
      const teamType2 = await TeamsService.createTeamType(batman, 'teamType2', 'WarningIcon');
      const result = await TeamsService.getAllTeamTypes();
      expect(result).toStrictEqual([teamType1, teamType2]);
    });
  });
});
