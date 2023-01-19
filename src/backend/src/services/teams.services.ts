import { Team } from 'shared';
import { Role, User } from '@prisma/client';
import teamQueryArgs from '../prisma-query-args/teams.query-args';
import prisma from '../prisma/prisma';
import teamTransformer from '../transformers/teams.transformer';
import { NotFoundException, AccessDeniedException } from '../utils/errors.utils';
import { getUsers } from '../utils/users.utils';

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
   * @param userIds a array of user Ids that replaces team's old members
   * @returns a updated team
   * @throws if the team is not found, the submitter has no priviledge, or any user from the given userIds does not exist
   */
  static async setTeamMembers(submitter: User, teamId: string, userIds: number[]): Promise<Team> {
    // find and verify the given teamId exist
    const team = await prisma.team.findUnique({
      where: { teamId },
      ...teamQueryArgs
    });

    if (!team) throw new NotFoundException('Team', teamId);
    if (submitter.role !== Role.ADMIN && submitter.role !== Role.APP_ADMIN && submitter.userId !== team.leaderId)
      throw new AccessDeniedException('you must be an admin or the team lead to update the members!');

    // this throws if any of the users aren't found
    const users = await getUsers(userIds);

    // retrieve userId for every given users to update team's members in the database
    const transformedUsers = users.map((user) => {
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
          set: transformedUsers
        }
      },
      ...teamQueryArgs
    });

    return teamTransformer(updateTeam);
  }

  /**
   * Changes the description of the given team to be the new description
   * @param user The user who is editing the description
   * @param teamId The id for the team that is being edited
   * @param newDescription the new description for the team
   * @returns The team with the new description
   */
  static async editDescription(user: User, teamId: string, newDescription: string): Promise<Team> {
    const team = await prisma.team.findUnique({
      where: { teamId },
      ...teamQueryArgs
    });

    if (!team) throw new NotFoundException('Team', teamId);
    if (!(user.role === Role.APP_ADMIN || user.role === Role.ADMIN || user.userId === team.leaderId))
      throw new AccessDeniedException();

    const updateTeam = await prisma.team.update({
      where: { teamId },
      data: {
        description: newDescription
      },
      ...teamQueryArgs
    });

    return teamTransformer(updateTeam);
  }
}
