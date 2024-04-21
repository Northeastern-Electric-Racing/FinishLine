import { isAdmin, isHead, Team, TeamType } from 'shared';
import { User, WBS_Element_Status } from '@prisma/client';
import teamQueryArgs from '../prisma-query-args/teams.query-args';
import prisma from '../prisma/prisma';
import teamTransformer from '../transformers/teams.transformer';
import {
  NotFoundException,
  AccessDeniedException,
  HttpException,
  AccessDeniedAdminOnlyException
} from '../utils/errors.utils';
import { getPrismaQueryFromUserIds, getPrismaQueryUserIds, getUsers } from '../utils/users.utils';
import { isUnderWordCount } from 'shared';
import { removeUsersFromList } from '../utils/teams.utils';

export default class TeamsService {
  /**
   * Gets all teams
   * @returns a list of teams
   */
  static async getAllTeams(): Promise<Team[]> {
    const teams = await prisma.team.findMany({ where: { dateArchived: null }, ...teamQueryArgs });
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
   * @throws if the team is not found, the submitter has no priviledge, the team is archived, or any user from the given userIds does not exist
   */
  static async setTeamMembers(submitter: User, teamId: string, userIds: number[]): Promise<Team> {
    // find and verify the given teamId exist
    const team = await prisma.team.findUnique({
      where: { teamId },
      ...teamQueryArgs
    });

    if (!team) {
      throw new NotFoundException('Team', teamId);
    }

    const isTeamLead = team.leads.some((lead) => lead.userId === submitter.userId);

    if (!isAdmin(submitter.role) && submitter.userId !== team.headId && !isTeamLead)
      throw new AccessDeniedException('you must be an admin, the team head, or a team lead to update the members!');

    // this throws if any of the users aren't found
    const users = await getUsers(userIds);

    if (users.map((user) => user.userId).includes(team.headId))
      throw new HttpException(400, 'team head cannot be a member!');

    if (team.dateArchived) throw new HttpException(400, 'Cannot edit the members of an archived team');

    // if the new members array includes a current lead on that team, that member will be deleted as a lead of that team
    const newTeamLeadIds = removeUsersFromList(team.leads, users);

    const updateTeam = await prisma.team.update({
      where: {
        teamId
      },
      data: {
        members: {
          set: getPrismaQueryUserIds(users)
        },
        leads: {
          set: getPrismaQueryFromUserIds(newTeamLeadIds)
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
    if (!(isAdmin(user.role) || user.userId === team.headId))
      throw new AccessDeniedException('you must be an admin or the team head to update the members!');

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
   * @throws if the team is not found, the submitter has no privilege, the team is archived, or any user from the given userIds does not exist
   */
  static async setTeamHead(submitter: User, teamId: string, userId: number): Promise<Team> {
    const team = await prisma.team.findUnique({
      where: { teamId },
      ...teamQueryArgs
    });

    if (!team) throw new NotFoundException('Team', teamId);

    if (team.dateArchived) throw new HttpException(400, 'Cannot edit the head of an archived team');

    if (!isAdmin(submitter.role) && submitter.userId !== team.headId)
      throw new AccessDeniedException('You must be an admin or the head to update the head!');

    const newHead = await prisma.user.findUnique({
      where: { userId }
    });

    if (!newHead) throw new NotFoundException('User', userId);

    // If the new head is a current member on the team, remove them as a member
    const newTeamMemberIds = removeUsersFromList(team.members, [newHead]);

    // If the new head is a current lead on the team, remove them as a lead
    const newTeamLeadIds = removeUsersFromList(team.leads, [newHead]);

    if (!newHead) throw new NotFoundException('User', userId);
    if (!isHead(newHead.role)) throw new AccessDeniedException('The team head must be at least a head');

    // checking to see if any other teams have the new head as their current head or lead
    const newHeadTeam = await prisma.team.findFirst({
      where: { AND: [{ OR: [{ headId: userId }, { leads: { some: { userId } } }] }, { NOT: { teamId: team.teamId } }] }
    });

    if (newHeadTeam) throw new AccessDeniedException('The new team head must not be a head or lead of another team');

    const updateTeam = await prisma.team.update({
      where: { teamId },
      data: {
        head: {
          connect: { userId }
        },
        members: {
          set: getPrismaQueryFromUserIds(newTeamMemberIds)
        },
        leads: {
          set: getPrismaQueryFromUserIds(newTeamLeadIds)
        }
      },
      ...teamQueryArgs
    });
    return teamTransformer(updateTeam);
  }

  /**
   * Hard deletes the team with the given teamId
   * @param deleter the user submitting this request
   * @param teamId the id of the team to be deleted
   */
  static async deleteTeam(deleter: User, teamId: string): Promise<void> {
    const team = await prisma.team.findUnique({ where: { teamId }, ...teamQueryArgs });

    if (!team) throw new NotFoundException('Team', teamId);
    if (!isAdmin(deleter.role)) throw new AccessDeniedAdminOnlyException('delete teams');

    await prisma.team.delete({ where: { teamId }, ...teamQueryArgs });
  }

  /**
   * Creates a new team in the database
   * @param submitter The submitter who is trying to create a new team
   * @param teamName the name of the new team
   * @param headId the id of the user who will be the head on the new team
   * @param slackId the slack id for the slack channel for the team
   * @param description a short description of the team (must be less than 300 words)
   * @returns The newly created team
   */
  static async createTeam(
    submitter: User,
    teamName: string,
    headId: number,
    slackId: string,
    description: string
  ): Promise<Team> {
    if (!isAdmin(submitter.role)) {
      throw new AccessDeniedException('You must be an admin or higher to create a new team!');
    }

    if (!isUnderWordCount(description, 300)) throw new HttpException(400, 'Description must be less than 300 words');

    const newHead = await prisma.user.findUnique({
      where: { userId: headId }
    });

    if (!newHead) throw new NotFoundException('User', headId);
    if (!isHead(newHead.role)) throw new HttpException(400, 'The team head must be at least a head');

    // checking to see if any other teams have the new head as their current head
    const newHeadTeam = await prisma.team.findFirst({
      where: { headId }
    });

    if (newHeadTeam) throw new HttpException(400, 'The new team head must not be a head of another team');

    const duplicateName = await prisma.team.findFirst({
      where: { teamName }
    });

    if (duplicateName) throw new HttpException(400, 'The new team name must not be the name of another team');

    const createdTeam = await prisma.team.create({
      data: {
        teamName,
        slackId,
        description,
        head: { connect: { userId: headId } }
      },
      ...teamQueryArgs
    });

    return teamTransformer(createdTeam);
  }

  /**
   * Update the given teamId's team's leads
   * @param submitter a user who's making this request
   * @param teamId a id of team to be updated
   * @param userIds a array of user Ids that replaces team's old leads
   * @returns an updated team
   * @throws if the team is not found, the submitter has no privilege, the team is archived, or any user from the given userIds does not exist
   */
  static async setTeamLeads(submitter: User, teamId: string, userIds: number[]): Promise<Team> {
    const team = await prisma.team.findUnique({
      where: { teamId },
      ...teamQueryArgs
    });

    const newLeads = await getUsers(userIds);

    if (!team) throw new NotFoundException('Team', teamId);

    if (team.dateArchived) throw new HttpException(400, 'Cannot edit the leads of an archived team');

    if (!isAdmin(submitter.role) && submitter.userId !== team.headId) {
      throw new AccessDeniedException('You must be an admin or the head to update the lead!');
    }

    if (newLeads.map((lead) => lead.userId).includes(team.headId)) {
      throw new HttpException(400, 'A lead cannot be the head of the team!');
    }

    // removes the new leads as current members of the given team (if they are current members of that team)
    const newTeamMemberIds = removeUsersFromList(team.members, newLeads);

    const updateTeam = await prisma.team.update({
      where: { teamId },
      data: {
        leads: {
          set: getPrismaQueryUserIds(newLeads)
        },
        members: {
          set: getPrismaQueryFromUserIds(newTeamMemberIds)
        }
      },
      ...teamQueryArgs
    });

    return teamTransformer(updateTeam);
  }

  /**
   * Archives/unarchives a given team
   * @param submitter a user who's archiving the team
   * @param teamId a id of team to be updated
   * @returns the archived team
   * @throws if the team is not found, the submitter has no privilege, the team has any projects that are not complete
   */
  static async archiveTeam(subimtter: User, teamId: string): Promise<Team> {
    const team = await prisma.team.findFirst({
      where: { teamId },
      ...teamQueryArgs
    });

    if (!team) throw new NotFoundException('Team', teamId);

    if (!isAdmin(subimtter.role)) {
      throw new AccessDeniedException('You must be an admin or above to archive a team');
    }

    if (team.projects.some((project) => project.wbsElement.status !== WBS_Element_Status.COMPLETE)) {
      throw new HttpException(400, 'A team is not archivable if it has any active projects, or incomplete projects');
    }

    const updateData = {
      dateArchived: team.dateArchived === null ? new Date() : null,
      userArchived: team.userArchivedId === null ? { connect: { userId: subimtter.userId } } : { disconnect: true }
    };

    const updatedTeam = await prisma.team.update({
      where: { teamId },
      ...teamQueryArgs,
      data: updateData
    });

    return teamTransformer(updatedTeam);
  }

  /**
   * Creates a team type
   * @param submitter the user who is creating the team type
   * @param name the name of the team type
   * @param iconName the name of the icon
   * @returns the created team
   */
  static async createTeamType(submitter: User, name: string, iconName: string): Promise<TeamType> {
    if (!isAdmin(submitter.role)) {
      throw new AccessDeniedAdminOnlyException('create a team type');
    }

    const duplicateName = await prisma.teamType.findUnique({
      where: { name }
    });

    if (duplicateName) {
      throw new HttpException(400, 'Cannot create a teamType with a name that already exists');
    }

    const teamType = await prisma.teamType.create({
      data: {
        name,
        iconName
      }
    });

    return teamType;
  }

  /**
   * Gets all the team types in the database
   * @returns all the team types
   */
  static async getAllTeamTypes(): Promise<TeamType[]> {
    const teamTypes = await prisma.teamType.findMany();
    return teamTypes;
  }
}
