import { Organization, User } from '@prisma/client';
import prisma from '../prisma/prisma';
import { userHasPermission } from '../utils/users.utils';
import { isAdmin } from 'shared';
import { AccessDeniedAdminOnlyException, DeletedException, NotFoundException } from '../utils/errors.utils';

export default class OnboardingServices {
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

  static async deleteChecklist(deleter: User, checklistId: string, organization: Organization) {
    if (!(await userHasPermission(deleter.userId, organization.organizationId, isAdmin)))
      throw new AccessDeniedAdminOnlyException('delete a checklist');

    const checklist = await prisma.checklist.findUnique({
      where: { checklistId }
    });

    if (!checklist) throw new NotFoundException('Checklist', checklistId);

    if (checklist.dateDeleted) throw new DeletedException('Checklist', checklistId);

    await prisma.checklist.update({
      where: { checklistId },
      data: { dateDeleted: new Date(), userDeletedId: deleter.userId }
    });
  }
}
