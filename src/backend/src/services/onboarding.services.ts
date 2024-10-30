import { Organization, User } from '@prisma/client';
import prisma from '../prisma/prisma';
import { userHasPermission } from '../utils/users.utils';
import { isAdmin } from 'shared';
import { AccessDeniedAdminOnlyException, NotFoundException } from '../utils/errors.utils';

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

    const teamTypeExists = await prisma.team_Type.findUnique({
      where: { teamTypeId }
    });
    if (!teamTypeExists) {
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
}
