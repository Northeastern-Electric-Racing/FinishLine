import { Checklist, Organization, Team_Type, User } from '@prisma/client';
import prisma from '../prisma/prisma';
import { userHasPermission } from '../utils/users.utils';
import { isAdmin, TeamType } from 'shared';
import { AccessDeniedAdminOnlyException, DeletedException, HttpException, NotFoundException } from '../utils/errors.utils';

export default class OnboardingServices {
  /* Checklist section */

  /**
   * gets all checklists for the given organization
   * @param organization the organization of the checklists
   * @returns all checklists for the given organization
   */
  static async getAllChecklists(organization: Organization) {
    const allChecklists = prisma.checklist.findMany({
      where: { organizationId: organization.organizationId, dateDeleted: null },
      include: {
        checklistItems: {
          where: { dateDeleted: null }
        }
      }
    });

    return allChecklists;
  }

  /**
   * Gets all the checklists that this user has checked
   * @param user the user who has checked the checklists
   * @param organization the organization of the checklists
   * @returns all the checklists that this user has checked
   */
  static async getCheckedChecklists(user: User, organization: Organization) {
    const checkedChecklists = prisma.checklist.findMany({
      where: { organizationId: organization.organizationId, dateDeleted: null },
      include: {
        checklistItems: {
          where: { dateDeleted: null, usersChecked: { some: { userId: user.userId } } }
        }
      }
    });

    return checkedChecklists;
  }

  /*
   * Gets all checklists for the given user.
   * @param user the current user to get checklists for
   * @returns all checklists for the given user Id
   */
  static async getUsersChecklists(user: User) {
    const generalChecklists = await prisma.checklist.findMany({
      where: { teamTypeId: null, dateDeleted: null },
      include: { checklistItems: true }
    });

    const userTeams = await prisma.team.findMany({
      where: { members: { some: { userId: user.userId } } },
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
      where: { teamTypeId: { in: userTeamTypes.map((teamType) => teamType.teamTypeId) }, dateDeleted: null },
      include: { checklistItems: true }
    });

    return generalChecklists.concat(userChecklists);
  }

  /**
   * Creates a new checklist in the given organization Id.
   * @param submitter a user who is making the request
   * @param name the name of the checklist
   * @param teamTypeId the teamType the checklist
   * @param organization the organization of the checklist
   * @returns a newly created checklist
   */
  static async createChecklist(submitter: User, name: string, teamTypeId: string | null, organization: Organization) {
    if (!(await userHasPermission(submitter.userId, organization.organizationId, isAdmin))) {
      throw new AccessDeniedAdminOnlyException('non-admin tried to create a checklist');
    }

    if (teamTypeId) {
      const teamType = await prisma.team_Type.findUnique({
        where: { teamTypeId }
      });

      if (!teamType) {
        throw new NotFoundException('Team Type', teamTypeId);
      }
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
   * Deletes a checklist in the given checklist Id.
   * @param deleter a user who is making the request
   * @param checklistId the checklist
   * @param organization the organization of the checklist
   */
  static async deleteChecklist(deleter: User, checklistId: string, organization: Organization) {
    if (!(await userHasPermission(deleter.userId, organization.organizationId, isAdmin)))
      throw new AccessDeniedAdminOnlyException('delete a checklist');

    const checklist = await prisma.checklist.findUnique({
      where: { checklistId }
    });

    if (!checklist) throw new NotFoundException('Checklist', checklistId);

    if (checklist.dateDeleted) throw new DeletedException('Checklist', checklistId);

    await prisma.checklistItem.updateMany({
      where: { checklistId },
      data: { dateDeleted: new Date(), userDeletedId: deleter.userId }
    });

    await prisma.checklist.update({
      where: { checklistId },
      data: { dateDeleted: new Date(), userDeletedId: deleter.userId }
    });
  }

  /* Checklist Item section */

  /**
   * Creates a new checklist item in the given checklist Id.
   * @param submitter a user who is making the request
   * @param name the name of the checklist
   * @param checklistId the checklist
   * @param description the description of the item
   * @param parentChecklistItemId the parent checklist item this item belongs to
   * @param organization the organization of the checklist
   * @returns a newly created checklist
   */
  static async createChecklistItem(
    submitter: User,
    name: string,
    checklistId: string,
    parentChecklistItemId: string | null,
    descriptions: string[],
    organization: Organization
  ) {
    if (!(await userHasPermission(submitter.userId, organization.organizationId, isAdmin))) {
      throw new AccessDeniedAdminOnlyException('non-admin tried to create a checklist item');
    }

    const checklist = await prisma.checklist.findUnique({
      where: { checklistId }
    });

    if (!checklist) {
      throw new NotFoundException('Checklist', checklistId);
    }

    if (parentChecklistItemId) {
      const parentChecklistItem = await prisma.checklistItem.findUnique({
        where: { checklistItemId: parentChecklistItemId }
      });

      if (!parentChecklistItem) {
        throw new NotFoundException('Checklist Item', parentChecklistItemId);
      }

      if (parentChecklistItem.checklistId !== checklistId) {
        throw new HttpException(400, 'Cannot have parent checklist item with a different checklist');
      }
    }

    const checklistItem = await prisma.checklistItem.create({
      data: {
        name,
        checklistId,
        descriptions,
        parentChecklistItemId,
        userCreatedId: submitter.userId,
        organizationId: organization.organizationId
      }
    });

    return checklistItem;
  }

  /**
   * Updated a checklist item in the given checklist Id.
   * @param submitter a user who is making the request
   * @param name the name of the checklist
   * @param checklistId the checklist
   * @param description the description of the item
   * @param parentChecklistItemId the parent checklist item this item belongs to
   * @param subtaskIds the subtasks ids of the item
   * @param organization the organization of the checklist
   * @returns an updated checklist item
   */
  static async updateChecklistItem(
    submitter: User,
    name: string,
    checklistItemId: string,
    parentChecklistItemId: string | null,
    descriptions: string[],
    subtaskIds: string[],
    organization: Organization
  ) {
    if (!(await userHasPermission(submitter.userId, organization.organizationId, isAdmin))) {
      throw new AccessDeniedAdminOnlyException('non-admin tried to update a checklist item');
    }

    const checklistItem = await prisma.checklistItem.findUnique({
      where: { checklistItemId, dateDeleted: null },
      include: {
        subtasks: true
      }
    });

    if (!checklistItem) {
      throw new NotFoundException('Checklist Item', checklistItemId);
    }

    if (parentChecklistItemId) {
      const parentChecklistItem = await prisma.checklistItem.findUnique({
        where: { checklistItemId: parentChecklistItemId }
      });

      if (!parentChecklistItem) {
        throw new NotFoundException('Checklist Item', parentChecklistItemId);
      }

      if (parentChecklistItem.checklistItemId !== checklistItemId) {
        throw new HttpException(400, 'Cannot have parent checklist item that is part a different checklist');
      }
    }

    await Promise.all(
      subtaskIds.map(async (subtaskId) => {
        const subtask = await prisma.checklistItem.findUnique({
          where: { checklistItemId: subtaskId, dateDeleted: null }
        });

        if (!subtask) {
          throw new NotFoundException('Checklist Item', subtaskId);
        }
      })
    );

    await prisma.checklistItem.update({
      where: { checklistItemId },
      data: {
        name,
        parentChecklistItemId,
        descriptions,
        subtasks: {
          connect: subtaskIds.map((subtaskId) => ({
            checklistItemId: subtaskId
          }))
        }
      }
    });
  }

  /**
   * Deletes a checklist in the given checklist item Id.
   * @param deleter a user who is making the request
   * @param checklistItemId the checklist item
   * @param organization the organization of the checklist
   */
  static async deleteChecklistItem(deleter: User, checklistItemId: string, organization: Organization) {
    if (!(await userHasPermission(deleter.userId, organization.organizationId, isAdmin)))
      throw new AccessDeniedAdminOnlyException('delete a checklist item');

    const checklistItem = await prisma.checklistItem.findUnique({
      where: { checklistItemId }
    });

    if (!checklistItem) throw new NotFoundException('Checklist Item', checklistItemId);

    if (checklistItem.dateDeleted) throw new DeletedException('Checklist Item', checklistItemId);

    await prisma.checklistItem.updateMany({
      where: { parentChecklistItemId: checklistItemId },
      data: { dateDeleted: new Date(), userDeletedId: deleter.userId }
    });

    await prisma.checklistItem.update({
      where: { checklistItemId },
      data: { dateDeleted: new Date(), userDeletedId: deleter.userId }
    });
  }
}
