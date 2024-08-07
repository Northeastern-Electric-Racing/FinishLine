import { User } from '@prisma/client';
import { isAdmin } from 'shared';
import prisma from '../prisma/prisma';
import { AccessDeniedAdminOnlyException, HttpException, NotFoundException } from '../utils/errors.utils';
import { userHasPermission } from '../utils/users.utils';

export default class RecruitmentServices {
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

  static async deleteMilestone(deleter: User, milestoneId: string, organizationId: string): Promise<void> {
    if (!(await userHasPermission(deleter.userId, organizationId, isAdmin)))
      throw new AccessDeniedAdminOnlyException('delete milestone');

    const milestone = await prisma.milestone.findUnique({ where: { milestoneId } });

    if (!milestone) throw new NotFoundException('Milestone', milestoneId);
    await prisma.milestone.delete({ where: { milestoneId } });

    if (!organizationId) {
      throw new HttpException(400, `Milestone with id ${milestoneId} doesn't exist`);
    }
  }
}
