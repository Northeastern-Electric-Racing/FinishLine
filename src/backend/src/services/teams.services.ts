import { Team } from 'shared';
import teamQueryArgs from '../prisma-query-args/team.query-args';
import prisma from '../prisma/prisma';
import teamsTransformer from '../transformers/teams.transformer';
import { NotFoundException } from '../utils/errors.utils';

export default class TeamsService {
  /**
   * Gets all of the teams across the side
   * @returns a list of teams
   */
  static async getAllTeams(): Promise<Team[]> {
    const teams = await prisma.team.findMany(teamQueryArgs);
    return teams.map(teamsTransformer);
  }

  /**
   * Gets a team by id
   * @param teamId of team to retrieve
   * @returns a team
   */
  static async getSingleTeam(teamId: string): Promise<Team> {
    const team = await prisma.team.findUnique({
      where: { teamId },
      ...teamQueryArgs
    });

    if (!team) {
      throw new NotFoundException('Team', teamId);
    }

    return teamsTransformer(team);
  }
}
