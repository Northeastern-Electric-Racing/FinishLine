import { isAdmin, isHead, Team } from 'shared';
import { User } from '@prisma/client';
import teamQueryArgs from '../prisma-query-args/teams.query-args';
import prisma from '../prisma/prisma';
import teamTransformer from '../transformers/teams.transformer';
import { NotFoundException, AccessDeniedException, HttpException } from '../utils/errors.utils';
import { getUsers } from '../utils/users.utils';
import { isUnderWordCount } from 'shared';

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
    if (!isAdmin(submitter.role) && submitter.userId !== team.leaderId)
      throw new AccessDeniedException('you must be an admin or the team lead to update the members!');

    // this throws if any of the users aren't found
    const users = await getUsers(userIds);

    if (users.map((user) => user.userId).includes(team.leader.userId))
      throw new HttpException(400, 'team leader cannot be a member!');

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
    if (!isUnderWordCount(newDescription, 300)) throw new HttpException(400, 'Description must be less than 300 words');

    const team = await prisma.team.findUnique({
      where: { teamId },
      ...teamQueryArgs
    });

    if (!team) throw new NotFoundException('Team', teamId);
    if (!(isAdmin(user.role) || user.userId === team.leaderId))
      throw new AccessDeniedException('you must be an admin or the team lead to update the members!');

    const updateTeam = await prisma.team.update({
      where: { teamId },
      data: {
        description: newDescription
      },
      ...teamQueryArgs
    });

    return teamTransformer(updateTeam);
  }

  /**
   * Update the team's head of the given team to the given user
   * @param submitter The submitter of this request
   * @param teamId The id for the team that is being edited
   * @param userId The user to be the new team's head
   * @returns The team with the new head
   */
  static async setTeamHead(submitter: User, teamId: string, userId: number): Promise<Team> {
    const team = await prisma.team.findUnique({
      where: { teamId },
      ...teamQueryArgs
    });

    if (!team) throw new NotFoundException('Team', teamId);
    if (!isAdmin(submitter.role) && submitter.userId !== team.leaderId)
      throw new AccessDeniedException('You must be an admin or the team lead to update the leader!');

    const newHead = await prisma.user.findUnique({
      where: { userId }
    });

    if (!newHead) throw new NotFoundException('User', userId);
    if (!isHead(newHead.role)) throw new AccessDeniedException('The team head must be at least an head');

    const updateTeam = await prisma.team.update({
      where: { teamId },
      data: {
        leader: {
          connect: { userId }
        }
      },
      ...teamQueryArgs
    });

    return teamTransformer(updateTeam);
  }
}
