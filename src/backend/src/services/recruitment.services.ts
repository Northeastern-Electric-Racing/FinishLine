import { User } from '@prisma/client';
import { isAdmin } from 'shared';
import prisma from '../prisma/prisma';
import { AccessDeniedAdminOnlyException, HttpException, NotFoundException } from '../utils/errors.utils';
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

  static async editMilestone(
    submitter: User,
    name: string,
    description: string,
    dateOfEvent: Date,
    milestoneId: string,
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

    const currentMilestone = await prisma.milestone.findUnique({
      where: {
        milestoneId
      }
    });

    if (!currentMilestone) {
      throw new NotFoundException('Milestone', milestoneId);
    }

    const updatedMilestone = await prisma.milestone.update({
      where: {
        milestoneId
      },
      data: {
        name,
        description,
        dateOfEvent,
        organizationId,
        userCreatedId: submitter.userId
      }
    });

    return updatedMilestone;
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
}
