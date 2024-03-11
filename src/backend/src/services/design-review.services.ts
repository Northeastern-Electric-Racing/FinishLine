import { DesignReview, isAdmin, isGuest } from 'shared';
import prisma from '../prisma/prisma';
import {
  AccessDeniedAdminOnlyException,
  DeletedException,
  NotFoundException,
  AccessDeniedGuestException,
  HttpException
} from '../utils/errors.utils';
import { User, Design_Review_Status, Design_Review } from '@prisma/client';
import designReviewQueryArgs from '../prisma-query-args/design-review.query-args';
import { designReviewTransformer } from '../transformers/design-review.transformer';
import { sendSlackDesignReviewNotification } from '../utils/slack.utils';

export default class DesignReviewService {
  /**
   * Gets all design reviews in the database
   * @returns All of the design reviews
   */
  static async getAllDesignReviews(): Promise<DesignReview[]> {
    const designReviews = await prisma.design_Review.findMany({
      where: { dateDeleted: null },
      ...designReviewQueryArgs
    });
    return designReviews.map(designReviewTransformer);
  }

  /**
   * Deletes a design review
   * @param submitter the user who deleted the design review
   * @param designReviewId the id of the design review to be deleted
   */

  static async deleteDesignReview(submitter: User, designReviewId: string): Promise<DesignReview> {
    const designReview = await prisma.design_Review.findUnique({
      where: { designReviewId }
    });

    if (!designReview) throw new NotFoundException('Design Review', designReviewId);

    if (!(isAdmin(submitter.role) || submitter.userId === designReview.userCreatedId))
      throw new AccessDeniedAdminOnlyException('delete design reviews');

    if (designReview.dateDeleted) throw new DeletedException('Design Review', designReviewId);

    const deletedDesignReview = await prisma.design_Review.update({
      where: { designReviewId },
      data: { dateDeleted: new Date(), userDeleted: { connect: { userId: submitter.userId } } },
      ...designReviewQueryArgs
    });

    return designReviewTransformer(deletedDesignReview);
  }

  /**
   *
   * @param user user who created the design review
   * @param dateScheduled when the design review is scheduled for
   * @param teamTypeId team type id the design review concerns
   * @param requiredMembers users who need to be at the design review
   * @param optionalMembers users who do not need to be at the design review
   * @param location where the design review will be held
   * @param isOnline if the design reivew is held online
   * @param isInPerson if the design review is held in person
   * @param zoomLink what the zoom link is
   * @param docTemplateLink doc template link
   * @param wbsElementId wbs element id the design review is related to
   * @param meetingTimes meeting times
   * @throws if permissions are not valid to create a design review
   * @returns a newly created design review
   */
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

    const teamType = await prisma.teamType.findFirst({
      where: { teamTypeId }
    });

    if (!teamType) {
      throw new NotFoundException('Team Type', teamTypeId);
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

    for (const member of requiredMembers.concat(optionalMembers)) {
      // send to all the people invited to the design review
      const memberUserSettings = await prisma.user_Settings.findUnique({ where: { userId: member.userId } });
      if (memberUserSettings && memberUserSettings.slackId) {
        try {
          await sendSlackDesignReviewNotification(memberUserSettings.slackId, design_review.designReviewId);
        } catch (err: unknown) {
          if (err instanceof Error) {
            throw new HttpException(500, `Failed to send slack notification: ${err.message}`);
          }
        }
      }
    }

    return design_review;
  }
}
