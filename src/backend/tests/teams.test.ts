import TeamsService from '../src/services/teams.services';
import prisma from '../src/prisma/prisma';
import * as teamsTransformer from '../src/transformers/teams.transformer';
import { prismaTeam1, sharedTeam1, updatedSharedTeam1 } from './test-data/teams.test-data';
import teamQueryArgs from '../src/prisma-query-args/teams.query-args';
import { flash, superman, wonderwoman } from './test-data/users.test-data';
import * as userUtils from '../src/utils/users.utils';

describe('Teams', () => {
  beforeEach(() => {
    jest.spyOn(teamsTransformer, 'default').mockReturnValue(sharedTeam1);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('getAllTeams works', async () => {
    jest.spyOn(prisma.team, 'findMany').mockResolvedValue([prismaTeam1]);

    const teams = await TeamsService.getAllTeams();

    expect(teams).toStrictEqual([sharedTeam1]);
    expect(prisma.team.findMany).toHaveBeenCalledTimes(1);
    expect(prisma.team.findMany).toHaveBeenCalledWith({ ...teamQueryArgs });
  });

  test('getSingleTeam works', async () => {
    jest.spyOn(prisma.team, 'findUnique').mockResolvedValue(prismaTeam1);

    const { teamId } = prismaTeam1;
    const team = await TeamsService.getSingleTeam(teamId);

    expect(team).toStrictEqual(sharedTeam1);
    expect(prisma.team.findUnique).toHaveBeenCalledTimes(1);
    expect(prisma.team.findUnique).toHaveBeenCalledWith({ where: { teamId }, ...teamQueryArgs });
  });

  test('getSingleTeam not found', async () => {
    jest.spyOn(prisma.team, 'findUnique').mockResolvedValue(null);

    const { teamId } = prismaTeam1;
    await expect(() => TeamsService.getSingleTeam(teamId)).rejects.toThrow();

    expect(prisma.team.findUnique).toHaveBeenCalledTimes(1);
    expect(prisma.team.findUnique).toHaveBeenCalledWith({ where: { teamId }, ...teamQueryArgs });
  });

  describe('editTeam', () => {
    test('setTeamMembers works', async () => {
      jest.spyOn(prisma.team, 'findUnique').mockResolvedValue(prismaTeam1);
      jest.spyOn(prisma.team, 'update').mockResolvedValue(prismaTeam1);
      jest.spyOn(userUtils, 'getUsers').mockResolvedValue([superman, wonderwoman]);

      const teamId = 'id1';
      const userIds = [
        {
          userId: 2
        },
        {
          userId: 3
        }
      ];
      const res = await TeamsService.updateSingleTeam(flash, sharedTeam1.teamId, [2, 3]);

      expect(prisma.team.findUnique).toHaveBeenCalledTimes(1);
      expect(prisma.team.update).toHaveBeenCalledTimes(1);
      expect(prisma.team.update).toHaveBeenCalledWith({
        where: { teamId },
        data: {
          members: {
            set: userIds
          }
        },
        ...teamQueryArgs
      });
      expect(res).toStrictEqual(updatedSharedTeam1);
    });
  });
});
