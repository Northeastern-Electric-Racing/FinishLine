import { DesignReview, WbsNumber, isAdmin, isGuest, isLeadership } from 'shared';
import prisma from '../prisma/prisma';
import {
  AccessDeniedAdminOnlyException,
  DeletedException,
  NotFoundException,
  AccessDeniedGuestException,
  HttpException
} from '../utils/errors.utils';
import { User, Design_Review_Status } from '@prisma/client';
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
    requiredMemberIds: number[],
    optionalMemberIds: number[],
    isOnline: boolean,
    isInPerson: boolean,
    docTemplateLink: string,
    wbsNum: WbsNumber,
    meetingTimes: number[],
    zoomLink?: string,
    location?: string
  ): Promise<DesignReview> {
    if (isGuest(user.role)) throw new AccessDeniedGuestException('create design review');

    const teamType = await prisma.teamType.findFirst({
      where: { teamTypeId }
    });

    if (!teamType) {
      throw new NotFoundException('Team Type', teamTypeId);
    }

    const wbs_Element = await prisma.wBS_Element.findUnique({
      where: {
        wbsNumber: {
          carNumber: wbsNum.carNumber,
          projectNumber: wbsNum.projectNumber,
          workPackageNumber: wbsNum.workPackageNumber
        }
      }
    });

    if (!wbs_Element) {
      throw new NotFoundException('WBS Element', wbsNum.carNumber);
    }

    for (let i = 0; i < meetingTimes.length - 1; i++) {
      if (meetingTimes[i + 1] - meetingTimes[i] !== 1 || meetingTimes[i] < 0 || meetingTimes[i] > 48) {
        throw new HttpException(400, 'Meeting times have to be continous and in range 0-48');
      }
    }

    if (isOnline && !zoomLink) {
      throw new HttpException(400, 'If the design review is online then there needs to be a zoom link');
    }

    if (isInPerson && !location) {
      throw new HttpException(400, 'If the design review is in person then there needs to be a location');
    }

    // if (dateScheduled <= new Date().toDateString()) {
    //   throw new HttpException(400, 'Design review cannot be scheduled for the same day (or before), its created');
    // }

    const designReview = await prisma.design_Review.create({
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
        requiredMembers: { connect: requiredMemberIds.map((memberId) => ({ userId: memberId })) },
        optionalMembers: { connect: optionalMemberIds.map((memberId) => ({ userId: memberId })) },
        meetingTimes,
        wbsElement: { connect: { wbsElementId: wbs_Element.wbsElementId } }
      },
      ...designReviewQueryArgs
    });

    // send to all the people invited to the design review
    for (const memberId of requiredMemberIds.concat(optionalMemberIds)) {
      const memberUserSettings = await prisma.user_Settings.findUnique({ where: { userId: memberId } });
      const member = await prisma.user.findUnique({ where: { userId: memberId } });
      if (memberUserSettings && member && memberUserSettings.slackId && isLeadership(member.role)) {
        try {
          await sendSlackDesignReviewNotification(memberUserSettings.slackId, designReview.designReviewId);
        } catch (err: unknown) {
          if (err instanceof Error) {
            throw new HttpException(500, `Failed to send slack notification: ${err.message}`);
          }
        }
      }
    }

    return designReviewTransformer(designReview);
  }

  /**
   * Retrieves a single design review
   *
   * @param submitter the user who is trying to retrieve the design review
   * @param designReviewId the id of the design review to retrieve
   * @returns the design review
   */
  static async getSingleDesignReview(submitter: User, designReviewId: string): Promise<DesignReview> {
    const designReview = await prisma.design_Review.findUnique({
      where: { designReviewId },
      ...designReviewQueryArgs
    });

    if (!designReview) throw new NotFoundException('Design Review', designReviewId);

    if (designReview.dateDeleted) throw new DeletedException('Design Review', designReviewId);

    return designReviewTransformer(designReview);
  }
}
