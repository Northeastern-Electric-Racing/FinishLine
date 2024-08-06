import { User } from '@prisma/client';
import { isAdmin } from 'shared';
import prisma from '../prisma/prisma';
import { AccessDeniedAdminOnlyException, DeletedException, HttpException, NotFoundException } from '../utils/errors.utils';
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
      throw new NotFoundException('Organization', organizationId);
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
      throw new NotFoundException('Organization', organizationId);
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

    if (currentMilestone.dateDeleted) {
      throw new DeletedException('Milestone', milestoneId);
    }

    const updatedMilestone = await prisma.milestone.update({
      where: {
        milestoneId
      },
      data: {
        name,
        description,
        dateOfEvent,
        organizationId
      }
    });

    return updatedMilestone;
  }
}
