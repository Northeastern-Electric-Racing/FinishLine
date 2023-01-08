import { Team } from 'shared';
import teamQueryArgs from '../prisma-query-args/teams.query-args';
import prisma from '../prisma/prisma';
import teamTransformer from '../transformers/teams.transformer';
import { NotFoundException } from '../utils/errors.utils';
import { calculateProjectStatus } from '../utils/projects.utils';

export default class TeamsService {
  /**
   * Gets all teams
   * @returns a list of teams
   */
  static async getAllTeams(): Promise<Team[]> {
    const teams = await prisma.team.findMany(teamQueryArgs);
    return teams.map(teamTransformer);
  }

  /**
   * Gets a team with the given id
   * @param teamId - id of team to retrieve
   * @returns a team
   * @throws if the team is not found in the db
   */
  static async getSingleTeam(teamId: string): Promise<Team> {
    const team = await prisma.team.findUnique({
      where: { teamId },
      ...teamQueryArgs
    });

    if (!team) {
      throw new NotFoundException('Team', teamId);
    }
    const activeProjects = team.projects.filter((project) => {
      return calculateProjectStatus(project) === 'ACTIVE';
    });

    return teamTransformer({ ...team, projects: activeProjects });
  }
}
