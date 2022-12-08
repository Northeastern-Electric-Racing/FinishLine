import TeamsService from '../src/services/teams.services';
import prisma from '../src/prisma/prisma';
import * as teamsTransformer from '../src/transformers/teams.transformer';
import { prismaTeam1, sharedTeam1 } from './test-data/teams.test-data';
import teamQueryArgs from '../src/prisma-query-args/team.query-args';

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
});
