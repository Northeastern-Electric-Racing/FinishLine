import { Checklist, Team_Type } from '@prisma/client';
import prisma from '../prisma/prisma';
import { AccessDeniedAdminOnlyException, HttpException, NotFoundException } from '../utils/errors.utils';
import { userHasPermission } from '../utils/users.utils';
import { Organization, User } from '@prisma/client';
import { isAdmin, TeamType } from 'shared';

export default class OnboardingServices {
  /**
   * Creates a new checklist in the given organization Id.
   * @param submitter a user who is making the request
   * @param name the name of the checklist
   * @param teamTypeId the teamType the checklist
   * @param organization the organization of the checklist
   * @returns a newly created checklist
   */
  static async createChecklist(submitter: User, name: string, teamTypeId: string, organization: Organization) {
    if (!(await userHasPermission(submitter.userId, organization.organizationId, isAdmin))) {
      throw new AccessDeniedAdminOnlyException('non-admin tried to create a checklist');
    }

    const teamType = await prisma.team_Type.findUnique({
      where: { teamTypeId }
    });

    if (!teamType) {
      throw new NotFoundException('Team Type', teamTypeId);
    }

    const checklist = await prisma.checklist.create({
      data: {
        name,
        checklistItems: {
          create: []
        },
        teamTypeId,
        userCreatedId: submitter.userId,
        organizationId: organization.organizationId
      }
    });
    return checklist;
  }

  /**
   * Gets all checklists for the given user Id.
   * @param userId the user id to get checklists for
   * @returns all checklists for the given user Id
   */
  static async getUsersChecklists(userId: string) {
    const generalChecklists = await prisma.checklist.findMany({
      where: { teamTypeId: null, dateDeleted: null }
    });

    const userTeams = await prisma.team.findMany({
      where: { members: { some: { userId } } },
      include: {
        teamType: {
          include: {
            checklists: true
          }
        }
      }
    });
    if (!userTeams || userTeams.length === 0) {
      throw new HttpException(404, 'This user does not have any teams');
    }

    const userTeamTypes: TeamType[] = userTeams
      .map((team) => team.teamType)
      .filter(
        (teamType): teamType is Team_Type & { checklists: Checklist[] } =>
          teamType !== null && teamType.checklists.length > 0
      );

    const userChecklists = await prisma.checklist.findMany({
      where: { teamTypeId: { in: userTeamTypes.map((teamType) => teamType.teamTypeId) }, dateDeleted: null }
    });

    return generalChecklists.concat(userChecklists);
  }
}
