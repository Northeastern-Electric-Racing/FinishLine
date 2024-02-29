import { Design_Review, Design_Review_Status } from '@prisma/client';
import { User, isGuest } from 'shared';
import { AccessDeniedGuestException, NotFoundException } from '../utils/errors.utils';
import prisma from '../prisma/prisma';

export default class DesignReviewService {
  static async createDesignReview(
    user: User,
    dateScheduled: string,
    teamTypeId: string,
    requiredMembers: User[],
    optionalMembers: User[],
    location: string,
    isOnline: boolean,
    isInPerson: boolean,
    zoomLink: string,
    docTemplateLink: string,
    wbsElementId: number,
    meetingTimes: number[]
  ): Promise<Design_Review> {
    if (isGuest(user.role)) throw new AccessDeniedGuestException('create design review');

    const teamType = await prisma.teamType.findFirst( {
      where: {teamTypeId}
    });

    if (!teamType) {
      throw new NotFoundException('Team Type', teamTypeId);
    }

    const userCreated = await prisma.user.findUnique({
      where: { userId: user.userId }
    });

    if (!userCreated) {
      throw new NotFoundException('User', user.userId);
    }

    const WBS_Element = await prisma.wBS_Element.findUnique({
      where: { wbsElementId }
    });

    if (!WBS_Element) {
      throw new NotFoundException('WBS Element', wbsElementId);
    }

    const design_review = await prisma.design_Review.create({
      data: {
        dateScheduled,
        dateCreated: new Date(),
        status: Design_Review_Status.UNCONFIRMED,
        location,
        isOnline,
        isInPerson,
        zoomLink,
        docTemplateLink,
        userCreated: { connect: { userId: user.userId } },
        teamType: { connect: { teamTypeId: teamType.teamTypeId } },
        requiredMembers: { connect: requiredMembers.map((user) => ({ userId: user.userId })) },
        optionalMembers: { connect: optionalMembers.map((user) => ({ userId: user.userId })) },
        meetingTimes,
        wbsElement: { connect: { wbsElementId } }
      }
    });

    return design_review;
  }
}
