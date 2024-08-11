import { User } from '@prisma/client';
import { isAdmin } from 'shared';
import prisma from '../prisma/prisma';
import {
  AccessDeniedAdminOnlyException,
  DeletedException,
  HttpException,
  InvalidOrganizationException,
  NotFoundException
} from '../utils/errors.utils';
import { userHasPermission } from '../utils/users.utils';

export default class RecruitmentServices {
  /**
   * Creates a new milestone in the given organization Id
   * @param submitter a user who is making this request
   * @param name the name of the user
   * @param description description of the milestone
   * @param dateOfEvent date of the event of the milestone
   * @param organizationId the organization Id of the milestone
   * @returns A newly created milestone
   */
  static async createMilestone(
    submitter: User,
    name: string,
    description: string,
    dateOfEvent: Date,
    organizationId: string
  ) {
    const organization = await prisma.organization.findUnique({
      where: { organizationId }
    });

    if (!organization) {
      throw new HttpException(400, `Organization with id ${organizationId} doesn't exist`);
    }

    if (!(await userHasPermission(submitter.userId, organizationId, isAdmin)))
      throw new AccessDeniedAdminOnlyException('create a milestone');

    const milestone = await prisma.milestone.create({
      data: {
        name,
        description,
        dateOfEvent,
        organizationId,
        userCreatedId: submitter.userId
      }
    });

    return milestone;
  }

  /**
   * Gets all Milestons for the given organization Id
   * @param organizationId organization Id of the milestone
   * @returns all the milestones from the given organization
   */
  static async getAllMilestones(organizationId: string) {
    const allMilestones = await prisma.milestone.findMany({
      where: { organizationId }
    });

    if (!organizationId) {
      throw new HttpException(400, `Organization with id ${organizationId} doesn't exist`);
    }

    return allMilestones;
  }

  /**
   * Deletes the milestone for the given milestoneId and organizationId
   * @param deleter the name of the user deleting the milestone
   * @param milestoneId milestone id for the specific milestone
   * @param organizationId organization Id of the milestone
   */
  static async deleteMilestone(deleter: User, milestoneId: string, organizationId: string): Promise<void> {
    const organization = await prisma.organization.findUnique({
      where: { organizationId }
    });
    if (!organization) {
      throw new NotFoundException('Organization', organizationId);
    }

    if (!(await userHasPermission(deleter.userId, organizationId, isAdmin)))
      throw new AccessDeniedAdminOnlyException('delete milestone');

    const milestone = await prisma.milestone.findUnique({ where: { milestoneId } });

    if (!milestone) throw new NotFoundException('Milestone', milestoneId);

    if (milestone.dateDeleted) throw new DeletedException('Milestone', milestoneId);

    await prisma.milestone.update({
      where: { milestoneId },
      data: { dateDeleted: new Date(), userDeletedId: deleter.userId }
    });
  }
}
