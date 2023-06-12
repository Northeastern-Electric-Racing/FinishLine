import TeamsService from '../src/services/teams.services';
import prisma from '../src/prisma/prisma';
import * as teamsTransformer from '../src/transformers/teams.transformer';
import { prismaTeam1, sharedTeam1, justiceLeague } from './test-data/teams.test-data';
import teamQueryArgs from '../src/prisma-query-args/teams.query-args';
import { batman, flash, superman, wonderwoman } from './test-data/users.test-data';
import * as userUtils from '../src/utils/users.utils';
import { AccessDeniedException, HttpException } from '../src/utils/errors.utils';
import teamTransformer from '../src/transformers/teams.transformer';

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

  describe('setTeamMembers', () => {
    test('setTeamMembers members not found', async () => {
      jest.spyOn(prisma.team, 'findUnique').mockResolvedValue(prismaTeam1);
      jest.spyOn(prisma.user, 'findMany').mockResolvedValue([batman]);

      const callSetTeamMembers = async () =>
        await TeamsService.setTeamMembers(flash, sharedTeam1.teamId, [batman.userId, 122, 55]);

      // note that the error does not include batman's id since he was found in the database
      const expectedException = new HttpException(404, 'User(s) with the following ids not found: 122, 55');

      await expect(callSetTeamMembers).rejects.toThrow(expectedException);
    });

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
      const res = await TeamsService.setTeamMembers(flash, sharedTeam1.teamId, [2, 3]);

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
      expect(res).toStrictEqual(sharedTeam1);
    });
  });

  describe('Edit Team Description', () => {
    test('Update Team Description Success', async () => {
      const newJustice = { ...justiceLeague, description: 'hello!' };

      jest.spyOn(prisma.team, 'findUnique').mockResolvedValueOnce(justiceLeague);
      jest.spyOn(prisma.team, 'update').mockResolvedValue(newJustice);

      const res = await TeamsService.editDescription(batman, '1', 'hello!');

      expect(res).toStrictEqual(teamTransformer(newJustice));
      expect(prisma.team.findUnique).toHaveBeenCalledTimes(1);
      expect(prisma.team.update).toHaveBeenCalledTimes(1);
    });

    test('Returns Error If Not Admin', async () => {
      jest.spyOn(prisma.team, 'findUnique').mockResolvedValueOnce(justiceLeague);

      await expect(() => TeamsService.editDescription(wonderwoman, '1', 'Hello!')).rejects.toThrow(
        new AccessDeniedException('you must be an admin or the team lead to update the members!')
      );

      expect(prisma.team.findUnique).toHaveBeenCalledTimes(1);
    });
  });

  describe('setTeamHead', () => {
    test('setTeamHead head not found', async () => {
      jest.spyOn(prisma.team, 'findUnique').mockResolvedValue(prismaTeam1);

      const callSetTeamHead = async () => await TeamsService.setTeamHead(flash, sharedTeam1.teamId, 122);

      const expectedException = new HttpException(404, 'User with id: 122 not found!');

      await expect(callSetTeamHead).rejects.toThrow(expectedException);
    });

    test('setTeamHead works', async () => {
      jest.spyOn(prisma.team, 'findUnique').mockResolvedValue(prismaTeam1);
      jest.spyOn(prisma.team, 'update').mockResolvedValue(prismaTeam1);
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(superman);

      const teamId = 'id1';
      const res = await TeamsService.setTeamHead(flash, sharedTeam1.teamId, 2);

      expect(prisma.team.findUnique).toHaveBeenCalledTimes(1);
      expect(prisma.team.update).toHaveBeenCalledTimes(1);
      expect(prisma.team.update).toHaveBeenCalledWith({
        where: { teamId },
        data: {
          leader: {
            connect: {
              userId: 2
            }
          }
        },
        ...teamQueryArgs
      });
      expect(res).toStrictEqual(sharedTeam1);
    });
  });
});
