import { Organization, User } from '@prisma/client';
import prisma from '../prisma/prisma';
import { userHasPermission } from '../utils/users.utils';
import { isAdmin } from 'shared';
import { AccessDeniedAdminOnlyException, DeletedException, NotFoundException } from '../utils/errors.utils';

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
    description: string | null,
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
    }

    const checklistItem = await prisma.checklistItem.create({
      data: {
        name,
        checklistId,
        description,
        parentChecklistItemId,
        userCreatedId: submitter.userId,
        organizationId: organization.organizationId
      }
    });

    return checklistItem;
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
