import { Checklist, Organization, User } from '@prisma/client';
import prisma from '../prisma/prisma';
import { userHasPermission } from '../utils/users.utils';
import { isAdmin } from 'shared';
import { AccessDeniedAdminOnlyException, DeletedException, HttpException, NotFoundException } from '../utils/errors.utils';
import { downloadImageFile } from '../utils/google-integration.utils';

export default class OnboardingServices {
  /* Checklist section */

  /**
   * gets all checklists for the given organization
   * @param organization the organization of the checklists
   * @returns all checklists for the given organization
   */
  static async getAllChecklists(organization: Organization) {
    const allChecklists = await prisma.checklist.findMany({
      where: { organizationId: organization.organizationId, dateDeleted: null, parentChecklistId: null },
      include: { subtasks: true, teamType: true, usersChecked: true }
    });

    return allChecklists;
  }

  /**
   * Gets all the general checklists for the given organization
   * @param organization the organization of the checklists
   * @returns all the general checklists for the given organization
   */
  static async getGeneralChecklists(organization: Organization) {
    const generalChecklists = await prisma.checklist.findMany({
      where: {
        organizationId: organization.organizationId,
        teamId: null,
        teamTypeId: null,
        dateDeleted: null,
        parentChecklistId: null
      },
      include: {
        subtasks: {
          include: {
            usersChecked: true
          }
        },
        teamType: true,
        usersChecked: true
      }
    });
    return generalChecklists;
  }

  /**
   * Gets all the checklists that this user has checked
   * @param user the user who has checked the checklists
   * @param organization the organization of the checklists
   * @returns all the checklists that this user has checked
   */
  static async getCheckedChecklists(user: User, organization: Organization) {
    const allChecklists = await prisma.checklist.findMany({
      where: { organizationId: organization.organizationId, dateDeleted: null },
      include: { subtasks: true, usersChecked: true }
    });

    const checkedChecklists = allChecklists.filter((checklist) =>
      checklist.usersChecked.some((userChecked) => userChecked.userId === user.userId)
    );

    return checkedChecklists;
  }

  /**
   * Gets all the checklists for the given teamType Ids
   * @param teamTypeIds the teamType Ids of the checklists
   * @param organization the organization of the checklists
   * @returns all the checklists for the given teamType Ids
   */
  static async getUsersChecklists(userId: string, organization: Organization) {
    const user = await prisma.user.findUnique({ where: { userId }, include: { teamsAsMember: true } });
    if (!user) {
      throw new NotFoundException('User', userId);
    }

    const teamTypeIds: string[] = user.teamsAsMember
      .map((team) => team.teamTypeId)
      .filter((id): id is string => id !== null);
    const teamIds: string[] = user.teamsAsMember.map((team) => team.teamId).filter((id): id is string => id !== null);

    const teamTypeChecklists = await prisma.checklist.findMany({
      where: {
        organizationId: organization.organizationId,
        dateDeleted: null,
        teamTypeId: { in: teamTypeIds },
        parentChecklistId: null
      },
      include: {
        subtasks: {
          include: {
            usersChecked: true
          }
        },
        teamType: true
      }
    });

    const teamChecklists = await prisma.checklist.findMany({
      where: {
        organizationId: organization.organizationId,
        dateDeleted: null,
        teamId: { in: teamIds },
        parentChecklistId: null
      },
      include: {
        subtasks: {
          include: {
            usersChecked: true
          }
        },
        team: true
      }
    });

    return [...teamTypeChecklists, ...teamChecklists];
  }

  /**
   * Creates a new checklist
   * @param name the name of the checklist
   * @param descriptions the descriptions of the checklist
   * @param isOptional whether the checklist is optional
   * @param teamId the team Id of the checklist
   * @param teamTypeId the teamType Id of the checklist
   * @param parentChecklistId the parent checklist Id of the checklist
   * @param organization the organization of the checklist
   * @returns the created checklist
   */
  static async createChecklist(
    creator: User,
    name: string,
    descriptions: string[],
    isOptional: boolean,
    teamId: string | null,
    teamTypeId: string | null,
    parentChecklistId: string | null,
    organization: Organization
  ) {
    if (!(await userHasPermission(creator.userId, organization.organizationId, isAdmin))) {
      throw new AccessDeniedAdminOnlyException('create a checklist');
    }

    if (teamId && teamTypeId) {
      throw new HttpException(400, 'Checklist cannot be assigned to both a team and a team type');
    }

    if (!teamId && !teamTypeId) {
      if (parentChecklistId) {
        const parentChecklist = await prisma.checklist.findFirst({ where: { checklistId: parentChecklistId } });
        if (parentChecklist?.teamId || parentChecklist?.teamTypeId) {
          throw new HttpException(400, 'Parent checklist must also be a general checklist');
        }
      }
    }

    if (teamId) {
      const team = await prisma.team.findUnique({ where: { teamId } });

      if (!team) {
        throw new NotFoundException('Team', teamId);
      }
    }

    if (teamTypeId) {
      const teamType = await prisma.team_Type.findUnique({ where: { teamTypeId } });

      if (!teamType) {
        throw new NotFoundException('Team Type', teamTypeId);
      }
    }

    if (parentChecklistId) {
      const parentChecklist = await prisma.checklist.findUnique({ where: { checklistId: parentChecklistId } });

      if (!parentChecklist) {
        throw new NotFoundException('Checklist', parentChecklistId);
      }

      if (parentChecklist.teamId !== teamId || parentChecklist.teamTypeId !== teamTypeId) {
        throw new HttpException(400, 'Parent checklist must have the same teamId or teamTypeId');
      }

      if (parentChecklist.dateDeleted) {
        throw new DeletedException('Checklist', parentChecklistId);
      }
    }

    const checklist: Checklist = await prisma.checklist.create({
      data: {
        name,
        descriptions,
        isOptional,
        organizationId: organization.organizationId,
        teamId,
        teamTypeId,
        parentChecklistId,
        userCreatedId: creator.userId
      }
    });

    return checklist;
  }

  /**
   * Edits a checklist
   * @param checklistId the id of the checklist to edit
   * @param name the name of the checklist
   * @param descriptions the descriptions of the checklist
   * @param isOptional whether the checklist is optional
   * @param teamId the team Id of the checklist
   * @param teamTypeId the teamType Id of the checklist
   * @param parentChecklistId the parent checklist Id of the checklist
   * @param organization the organization of the checklist
   * @returns the edited checklist
   */
  static async editChecklist(
    editor: User,
    checklistId: string,
    name: string,
    descriptions: string[],
    isOptional: boolean,
    teamId: string | null,
    teamTypeId: string | null,
    parentChecklistId: string | null,
    organization: Organization
  ) {
    if (!(await userHasPermission(editor.userId, organization.organizationId, isAdmin))) {
      throw new AccessDeniedAdminOnlyException('edit a checklist');
    }

    if (teamId && teamTypeId) {
      throw new HttpException(400, 'Checklist cannot be assigned to both a team and a team type');
    }

    if (!teamId && !teamTypeId) {
      const generalChecklist = await prisma.checklist.findFirst({
        where: { organizationId: organization.organizationId, teamId: null, teamTypeId: null, dateDeleted: null }
      });

      if (generalChecklist && parentChecklistId) {
        if (generalChecklist.checklistId !== parentChecklistId) {
          throw new HttpException(400, 'Parent checklist must be the general checklist');
        }
      }

      if (generalChecklist && !parentChecklistId) {
        throw new HttpException(400, 'General checklist already exists');
      }
    }

    if (teamId) {
      const team = await prisma.team.findUnique({ where: { teamId } });

      if (!team) {
        throw new NotFoundException('Team', teamId);
      }
    }

    if (teamTypeId) {
      const teamType = await prisma.team_Type.findUnique({ where: { teamTypeId } });

      if (!teamType) {
        throw new NotFoundException('Team Type', teamTypeId);
      }
    }

    if (parentChecklistId) {
      const parentChecklist = await prisma.checklist.findUnique({ where: { checklistId: parentChecklistId } });

      if (!parentChecklist) {
        throw new NotFoundException('Checklist', parentChecklistId);
      }

      if (parentChecklist.dateDeleted) {
        throw new DeletedException('Checklist', parentChecklistId);
      }

      if (parentChecklist.teamId !== teamId || parentChecklist.teamTypeId !== teamTypeId) {
        throw new HttpException(400, 'Parent checklist must have the same teamId or teamTypeId');
      }
    }

    const checklist = await prisma.checklist.findUnique({ where: { checklistId } });

    if (!checklist) {
      throw new NotFoundException('Checklist', checklistId);
    }

    if (checklist.dateDeleted) {
      throw new DeletedException('Checklist', checklistId);
    }

    const editedChecklist: Checklist = await prisma.checklist.update({
      where: { checklistId },
      data: {
        name,
        descriptions,
        isOptional,
        teamId,
        teamTypeId,
        parentChecklistId
      }
    });

    return editedChecklist;
  }

  /**
   * Deletes a checklist
   * @param checklistId the id of the checklist to delete
   */
  static async deleteChecklist(deleter: User, checklistId: string, organization: Organization) {
    if (!(await userHasPermission(deleter.userId, organization.organizationId, isAdmin))) {
      throw new AccessDeniedAdminOnlyException('delete a checklist');
    }

    const checklist = await prisma.checklist.findUnique({ where: { checklistId }, include: { subtasks: true } });

    if (!checklist) {
      throw new NotFoundException('Checklist', checklistId);
    }

    if (checklist.dateDeleted) {
      throw new DeletedException('Checklist', checklistId);
    }

    await prisma.checklist.updateMany({
      where: { parentChecklistId: checklistId },
      data: { dateDeleted: new Date(), userDeletedId: deleter.userId }
    });

    await prisma.checklist.update({
      where: { checklistId },
      data: { dateDeleted: new Date(), userDeletedId: deleter.userId }
    });
  }

  /**
   * Toggles a user's check on a checklist
   * @param checklistId the id of the checklist to toggle
   * @param userId the id of the user to toggle
   * @returns the updated checklist
   */
  static async toggleChecklist(checklistId: string, user: User, organization: Organization) {
    const checklist = await prisma.checklist.findUnique({
      where: { checklistId, organizationId: organization.organizationId },
      include: { usersChecked: true, subtasks: { where: { dateDeleted: null }, include: { usersChecked: true } } }
    });

    if (!checklist) {
      throw new NotFoundException('Checklist', checklistId);
    }

    if (checklist.dateDeleted) {
      throw new DeletedException('Checklist', checklistId);
    }

    const { userId } = user;
    const isChecked = checklist.usersChecked.some((user) => user.userId === userId);

    if (
      checklist.subtasks.length > 0 &&
      !checklist.subtasks.every((subtask) => subtask.usersChecked.some((user) => user.userId === userId))
    ) {
      throw new HttpException(400, 'Cannot check off this checklist item because not all of its subtasks are checked.');
    }

    if (isChecked) {
      const childChecklists = await prisma.checklist.findMany({
        where: { parentChecklistId: checklistId }
      });

      await Promise.all(
        childChecklists.map((checklist) =>
          prisma.checklist.update({
            where: { checklistId: checklist.checklistId },
            data: {
              usersChecked: {
                disconnect: { userId }
              }
            }
          })
        )
      );

      await prisma.checklist.update({
        where: { checklistId },
        data: {
          usersChecked: {
            disconnect: { userId }
          }
        }
      });
    } else {
      await prisma.checklist.update({
        where: { checklistId },
        data: {
          usersChecked: {
            connect: { userId }
          }
        }
      });
    }

    // Check off the parent checklist if all subtasks are checked
    if (checklist.parentChecklistId) {
      const parentChecklist = await prisma.checklist.findUnique({
        where: { checklistId: checklist.parentChecklistId },
        include: {
          subtasks: {
            where: { dateDeleted: null },
            include: { usersChecked: true }
          }
        }
      });

      if (parentChecklist) {
        const allSubtasksChecked = parentChecklist.subtasks.every((subtask) =>
          subtask.usersChecked.some((user) => user.userId === userId)
        );
        if (allSubtasksChecked) {
          await prisma.checklist.update({
            where: { checklistId: parentChecklist.checklistId },
            data: {
              usersChecked: {
                connect: { userId }
              }
            }
          });
        } else {
          await prisma.checklist.update({
            where: { checklistId: parentChecklist.checklistId },
            data: {
              usersChecked: {
                disconnect: { userId }
              }
            }
          });
        }
      }
    }
    const updatedChecklist = await prisma.checklist.findUnique({
      where: { checklistId },
      include: { usersChecked: true }
    });

    return updatedChecklist;
  }

  static async downloadImage(fileId: string) {
    const fileData = await downloadImageFile(fileId);

    if (!fileData) throw new NotFoundException('Image File', fileId);
    return fileData;
  }
}
