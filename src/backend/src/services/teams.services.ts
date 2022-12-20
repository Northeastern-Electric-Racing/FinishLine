import { Team } from 'shared';
import { Role, User } from '@prisma/client';
import teamQueryArgs from '../prisma-query-args/teams.query-args';
import prisma from '../prisma/prisma';
import teamTransformer from '../transformers/teams.transformer';
import { HttpException, NotFoundException } from '../utils/errors.utils';
import { getUsers } from '../utils/users.utils';

interface UserId {
  userId: number;
}

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

    return teamTransformer(team);
  }

  /**
   * Update the given teamId's team's members
   * @param submitter a user who's making this request
   * @param teamId a id of team to be updated
   * @param userIds a array of user Ids that represent team's new members
   * @returns a updated team
   * @throws if the team is not found, the submitter has no priviledge, or any user from the given userIds does not exist
   */
  static async updateSingleTeam(submitter: User, teamId: string, userIds: number[]): Promise<Team> {
    let users;

    // find and vertify the given teamId exist
    const team = await prisma.team.findUnique({
      where: { teamId },
      ...teamQueryArgs
    });

    if (!team) throw new HttpException(404, `Team with id ${teamId} not found!`);
    if (submitter.role !== Role.ADMIN && submitter.role !== Role.APP_ADMIN && submitter.userId !== team.leaderId)
      throw new HttpException(403, 'Access Denied');

    try {
      users = await getUsers(userIds);
    } catch (error) {
      throw new HttpException(404, `${error}`);
    }

    // retrieve userId for every given users to update team's members in the database
    const transoformedUsers = users.map((user) => {
      return {
        userId: user.userId
      };
    });

    const updateTeam = await prisma.team.update({
      where: {
        teamId
      },
      data: {
        members: {
          set: transoformedUsers
        }
      },
      ...teamQueryArgs
    });

    return teamTransformer(updateTeam);
  }
}
