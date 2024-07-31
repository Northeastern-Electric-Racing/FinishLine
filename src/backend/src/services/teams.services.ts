import { isAdmin, isHead, Team, TeamType } from 'shared';
import { User, WBS_Element_Status } from '@prisma/client';
import prisma from '../prisma/prisma';
import teamTransformer from '../transformers/teams.transformer';
import {
  NotFoundException,
  AccessDeniedException,
  HttpException,
  AccessDeniedAdminOnlyException,
  InvalidOrganizationException
} from '../utils/errors.utils';
import { getPrismaQueryUserIds, getUsers, userHasPermission } from '../utils/users.utils';
import { isUnderWordCount } from 'shared';
import { removeUsersFromList } from '../utils/teams.utils';
import { getTeamQueryArgs } from '../prisma-query-args/teams.query-args';

export default class TeamsService {
  /**
   * Gets all teams
   * @param organizationId The organization the user is currently in
   * @returns a list of teams
   */
  static async getAllTeams(organizationId: string): Promise<Team[]> {
    const teams = await prisma.team.findMany({
      where: { dateArchived: null, organizationId },
      ...getTeamQueryArgs(organizationId)
    });
    return teams.map(teamTransformer);
  }

  /**
   * Gets a team with the given id
   * @param teamId - id of team to retrieve
   * @param organizationId The organization the user is currently in
   * @returns a team
   * @throws if the team is not found in the db
   */
  static async getSingleTeam(teamId: string, organizationId: string): Promise<Team> {
    const team = await prisma.team.findUnique({
      where: { teamId },
      ...getTeamQueryArgs(organizationId)
    });

    if (!team) {
      throw new NotFoundException('Team', teamId);
    }
    if (team.organizationId !== organizationId) throw new InvalidOrganizationException('Team');

    return teamTransformer(team);
  }

  /**
   * Update the given teamId's team's members
   * @param submitter a user who's making this request
   * @param teamId a id of team to be updated
   * @param userIds a array of user Ids that replaces team's old members
   * @param organizationId The organization the user is currently in
   * @returns a updated team
   * @throws if the team is not found, the submitter has no priviledge, the team is archived, or any user from the given userIds does not exist
   */
  static async setTeamMembers(submitter: User, teamId: string, userIds: string[], organizationId: string): Promise<Team> {
    // find and verify the given teamId exist
    const team = await TeamsService.getSingleTeam(teamId, organizationId);
    if (team.dateArchived) throw new HttpException(400, 'Cannot edit the members of an archived team');

    const isTeamLead = team.leads.some((lead) => lead.userId === submitter.userId);

    if (
      !(await userHasPermission(submitter.userId, organizationId, isAdmin)) &&
      submitter.userId !== team.head.userId &&
      !isTeamLead
    )
      throw new AccessDeniedException('you must be an admin, the team head, or a team lead to update the members!');

    // this throws if any of the users aren't found
    const users = await getUsers(userIds);

    if (users.map((user) => user.userId).includes(team.head.userId))
      throw new HttpException(400, 'team head cannot be a member!');

    // if the new members array includes a current lead on that team, that member will be deleted as a lead of that team
    const newTeamLeads = removeUsersFromList(team.leads, users);

    const updateTeam = await prisma.team.update({
      where: {
        teamId
      },
      data: {
        members: {
          set: getPrismaQueryUserIds(users)
        },
        leads: {
          set: getPrismaQueryUserIds(newTeamLeads)
        }
      },
      ...getTeamQueryArgs(organizationId)
    });

    return teamTransformer(updateTeam);
  }

  /**
   * Changes the description of the given team to be the new description
   * @param user The user who is editing the description
   * @param teamId The id for the team that is being edited
   * @param newDescription the new description for the team
   * @param organizationId The organization the user is currently in
   * @returns The team with the new description
   */
  static async editDescription(user: User, teamId: string, newDescription: string, organizationId: string): Promise<Team> {
    if (!isUnderWordCount(newDescription, 300)) throw new HttpException(400, 'Description must be less than 300 words');

    const team = await TeamsService.getSingleTeam(teamId, organizationId);
    if (team.dateArchived) throw new HttpException(400, 'Cannot edit the description of an archived team');

    if (!((await userHasPermission(user.userId, organizationId, isAdmin)) || user.userId === team.head.userId))
      throw new AccessDeniedException('you must be an admin or the team head to update the members!');

    const updateTeam = await prisma.team.update({
      where: { teamId },
      data: {
        description: newDescription
      },
      ...getTeamQueryArgs(organizationId)
    });

    return teamTransformer(updateTeam);
  }

  /**
   * Update the team's head of the given team to the given user
   * @param submitter The submitter of this request
   * @param teamId The id for the team that is being edited
   * @param userId The user to be the new team's head
   * @param organizationId The organization the user is currently in
   * @returns The team with the new head
   * @throws if the team is not found, the submitter has no privilege, the team is archived, or any user from the given userIds does not exist
   */
  static async setTeamHead(submitter: User, teamId: string, userId: string, organizationId: string): Promise<Team> {
    const team = await TeamsService.getSingleTeam(teamId, organizationId);
    if (team.dateArchived) throw new HttpException(400, 'Cannot edit the head of an archived team');

    if (!(await userHasPermission(submitter.userId, organizationId, isAdmin)) && submitter.userId !== team.head.userId)
      throw new AccessDeniedException('You must be an admin or the head to update the head!');

    const newHead = await prisma.user.findUnique({
      where: { userId }
    });

    if (!newHead) throw new NotFoundException('User', userId);

    // If the new head is a current member on the team, remove them as a member
    const newTeamMembers = removeUsersFromList(team.members, [newHead]);

    // If the new head is a current lead on the team, remove them as a lead
    const newTeamLeads = removeUsersFromList(team.leads, [newHead]);

    if (!newHead) throw new NotFoundException('User', userId);
    if (!(await userHasPermission(newHead.userId, organizationId, isHead)))
      throw new AccessDeniedException('The team head must be at least a head');

    // checking to see if any other teams have the new head as their current head or lead
    const newHeadTeam = await prisma.team.findFirst({
      where: {
        AND: [
          { OR: [{ headId: userId }, { leads: { some: { userId } } }] },
          { NOT: { teamId: team.teamId } },
          { organizationId }
        ]
      }
    });

    if (newHeadTeam)
      throw new AccessDeniedException(
        'The new team head must not be a head or lead of another team in the same organization!'
      );

    const updateTeam = await prisma.team.update({
      where: { teamId },
      data: {
        head: {
          connect: { userId }
        },
        members: {
          set: getPrismaQueryUserIds(newTeamMembers)
        },
        leads: {
          set: getPrismaQueryUserIds(newTeamLeads)
        }
      },
      ...getTeamQueryArgs(organizationId)
    });
    return teamTransformer(updateTeam);
  }

  /**
   * Hard deletes the team with the given teamId
   * @param deleter the user submitting this request
   * @param teamId the id of the team to be deleted
   * @param organizationId The organization the user is currently in
   */
  static async deleteTeam(deleter: User, teamId: string, organizationId: string): Promise<void> {
    if (!(await userHasPermission(deleter.userId, organizationId, isAdmin)))
      throw new AccessDeniedAdminOnlyException('delete teams');

    const team = await prisma.team.findUnique({ where: { teamId }, ...getTeamQueryArgs(organizationId) });

    if (!team) throw new NotFoundException('Team', teamId);

    await prisma.team.delete({ where: { teamId } });
  }

  /**
   * Creates a new team in the database
   * @param submitter The submitter who is trying to create a new team
   * @param teamName the name of the new team
   * @param headId the id of the user who will be the head on the new team
   * @param slackId the slack id for the slack channel for the team
   * @param description a short description of the team (must be less than 300 words)
   * @param isFinanceTeam whether the team is the finance team
   * @param organizationId The organization the user is currently in
   * @returns The newly created team
   */
  static async createTeam(
    submitter: User,
    teamName: string,
    headId: string,
    slackId: string,
    description: string,
    isFinanceTeam: boolean,
    organizationId: string
  ): Promise<Team> {
    if (!(await userHasPermission(submitter.userId, organizationId, isAdmin))) {
      throw new AccessDeniedException('You must be an admin or higher to create a new team!');
    }

    if (!isUnderWordCount(description, 300)) throw new HttpException(400, 'Description must be less than 300 words');

    const newHead = await prisma.user.findUnique({
      where: { userId: headId }
    });

    if (!newHead) throw new NotFoundException('User', headId);
    if (!(await userHasPermission(newHead.userId, organizationId, isHead)))
      throw new HttpException(400, 'The team head must be at least a head');

    // checking to see if any other teams have the new head as their current head
    const newHeadTeam = await prisma.team.findFirst({
      where: { headId, organizationId }
    });

    if (newHeadTeam)
      throw new HttpException(400, 'The new team head must not be a head of another team in the same organization.');

    const duplicateName = await prisma.team.findFirst({
      where: { teamName, organizationId }
    });

    if (duplicateName) throw new HttpException(400, 'The new team name must not be the name of another team');

    const financeTeam = await prisma.team.findFirst({
      where: { financeTeam: true, organizationId }
    });

    if (isFinanceTeam && financeTeam) throw new HttpException(400, 'There can only be one finance team in an organization');

    const createdTeam = await prisma.team.create({
      data: {
        teamName,
        slackId,
        description,
        head: { connect: { userId: headId } },
        organization: { connect: { organizationId } },
        financeTeam: isFinanceTeam
      },
      ...getTeamQueryArgs(organizationId)
    });

    return teamTransformer(createdTeam);
  }

  /**
   * Update the given teamId's team's leads
   * @param submitter a user who's making this request
   * @param teamId a id of team to be updated
   * @param userIds a array of user Ids that replaces team's old leads
   * @param organizationId The organization the user is currently in
   * @returns an updated team
   * @throws if the team is not found, the submitter has no privilege, the team is archived, or any user from the given userIds does not exist
   */
  static async setTeamLeads(submitter: User, teamId: string, userIds: string[], organizationId: string): Promise<Team> {
    const team = await TeamsService.getSingleTeam(teamId, organizationId);
    if (team.dateArchived) throw new HttpException(400, 'Cannot edit the leads of an archived team');

    if (!(await userHasPermission(submitter.userId, organizationId, isAdmin)) && submitter.userId !== team.head.userId) {
      throw new AccessDeniedException('You must be an admin or the head to update the lead!');
    }

    const newLeads = await getUsers(userIds);

    if (newLeads.map((lead) => lead.userId).includes(team.head.userId)) {
      throw new HttpException(400, 'A lead cannot be the head of the team!');
    }

    // removes the new leads as current members of the given team (if they are current members of that team)
    const newTeamMembers = removeUsersFromList(team.members, newLeads);

    const updateTeam = await prisma.team.update({
      where: { teamId },
      data: {
        leads: {
          set: getPrismaQueryUserIds(newLeads)
        },
        members: {
          set: getPrismaQueryUserIds(newTeamMembers)
        }
      },
      ...getTeamQueryArgs(organizationId)
    });

    return teamTransformer(updateTeam);
  }

  /**
   * Archives/unarchives a given team
   * @param submitter a user who's archiving the team
   * @param teamId a id of team to be updated
   * @param organizationId The organization the user is currently in
   * @returns the archived team
   * @throws if the team is not found, the submitter has no privilege, the team has any projects that are not complete
   */
  static async archiveTeam(submitter: User, teamId: string, organizationId: string): Promise<Team> {
    const team = await prisma.team.findUnique({
      where: { teamId },
      ...getTeamQueryArgs(organizationId)
    });

    if (!team) throw new NotFoundException('Team', teamId);
    if (team.organizationId !== organizationId) throw new InvalidOrganizationException('Team');

    if (!(await userHasPermission(submitter.userId, organizationId, isAdmin)))
      throw new AccessDeniedException('You must be an admin or above to archive a team');

    if (team.projects.some((project) => project.wbsElement.status !== WBS_Element_Status.COMPLETE))
      throw new HttpException(400, 'A team is not archivable if it has any active projects, or incomplete projects');

    const updateData = {
      dateArchived: team.dateArchived === null ? new Date() : null,
      userArchived: team.userArchivedId === null ? { connect: { userId: submitter.userId } } : { disconnect: true }
    };

    const updatedTeam = await prisma.team.update({
      where: { teamId },
      data: updateData,
      ...getTeamQueryArgs(organizationId)
    });

    return teamTransformer(updatedTeam);
  }

  /**
   * Creates a team type
   * @param submitter the user who is creating the team type
   * @param name the name of the team type
   * @param iconName the name of the icon
   * @param organizationId The organization the user is currently in
   * @returns the created team
   */
  static async createTeamType(
    submitter: User,
    name: string,
    iconName: string,
    description: string,
    filePath: string | null,
    organizationId: string
  ): Promise<TeamType> {
    if (!(await userHasPermission(submitter.userId, organizationId, isAdmin))) {
      throw new AccessDeniedAdminOnlyException('create a team type');
    }

    const duplicateName = await prisma.team_Type.findUnique({
      where: { uniqueTeamType: { name, organizationId } }
    });

    if (duplicateName) {
      throw new HttpException(400, 'Cannot create a teamType with a name that already exists');
    }

    const teamType = await prisma.team_Type.create({
      data: {
        name,
        iconName,
        description,
        imageFileId: filePath,
        organizationId
      }
    });

    return teamType;
  }

  /**
   * Gets a team with the given id
   * @param teamTypeId - id of teamType to retrieve
   * @param organizationId The organization the user is currently in
   * @returns a teamType
   * @throws if the team is not found in the db
   */
  static async getSingleTeamType(teamTypeId: string, organizationId: string): Promise<TeamType> {
    const teamType = await prisma.team_Type.findUnique({
      where: { teamTypeId }
    });

    if (!teamType) throw new NotFoundException('Team Type', teamTypeId);
    if (teamType.organizationId !== organizationId) throw new InvalidOrganizationException('Team Type');

    return teamType;
  }

  /**
   * Gets all the team types for the given organization
   * @param organizationId The organization the user is currently in
   * @returns all the team types for the given organization
   */
  static async getAllTeamTypes(organizationId: string): Promise<TeamType[]> {
    const teamTypes = await prisma.team_Type.findMany({ where: { organizationId } });
    return teamTypes;
  }

  /**
   * Changes the description of the given teamType to be the new description
   * @param user The user who is editing the description
   * @param teamTypeId The id for the teamType that is being edited
   * @param name the new name for the team
   * @param iconName the new icon name for the team
   * @param description the new description for the team
   * @param organizationId The organization the user is currently in
   * @returns The team with the new description
   */
  static async editTeamType(
    user: User,
    teamTypeId: string,
    name: string,
    iconName: string,
    description: string,
    filePath: string | null,
    organizationId: string
  ): Promise<TeamType> {
    if (!isUnderWordCount(description, 300)) throw new HttpException(400, 'Description must be less than 300 words');

    if (!(await userHasPermission(user.userId, organizationId, isAdmin)))
      throw new AccessDeniedException('you must be an admin to edit the team types description');

    const currentTeamType = await prisma.team_Type.findUnique({
      where: { teamTypeId }
    });

    const updatedTeamType = await prisma.team_Type.update({
      where: { teamTypeId },
      data: {
        name,
        iconName,
        description,
        imageFileId: filePath ? filePath : currentTeamType?.imageFileId
      }
    });

    return updatedTeamType;
  }

  /**
   * Sets the teamType for a team
   * @param submitter the user who is setting the team type
   * @param teamId id of the team
   * @param teamTypeId id of the teamType
   * @param organizationId The organization the user is currently in
   * @returns the updated team with teamType
   */
  static async setTeamType(submitter: User, teamId: string, teamTypeId: string, organizationId: string): Promise<Team> {
    if (!(await userHasPermission(submitter.userId, organizationId, isAdmin))) {
      throw new AccessDeniedAdminOnlyException('set a team type');
    }

    const teamType = await prisma.team_Type.findFirst({
      where: { teamTypeId }
    });

    if (!teamType) throw new NotFoundException('Team Type', teamTypeId);
    if (teamType.organizationId !== organizationId) throw new InvalidOrganizationException('Team Type');

    const team = await prisma.team.findUnique({
      where: { teamId },
      ...getTeamQueryArgs(organizationId)
    });

    if (!team) throw new NotFoundException('Team', teamId);
    if (team.organizationId !== organizationId) throw new InvalidOrganizationException('Team');

    const updatedTeam = await prisma.team.update({
      where: { teamId },
      data: {
        teamType: {
          connect: { teamTypeId }
        }
      },
      ...getTeamQueryArgs(organizationId)
    });

    return teamTransformer(updatedTeam);
  }
}
