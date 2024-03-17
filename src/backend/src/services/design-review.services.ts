import { DesignReview, WbsNumber, isAdmin, isLeadership } from 'shared';
import prisma from '../prisma/prisma';
import {
  AccessDeniedAdminOnlyException,
  DeletedException,
  NotFoundException,
  HttpException,
  AccessDeniedException
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
   * Creates a design review
   * @param submitter user who submitted the design review
   * @param dateScheduled when the design review is scheduled for
   * @param teamTypeId team type id of the design review
   * @param requiredMemberIds ids of the required members to attend the design review
   * @param optionalMemberIds ids of the optional members to attend the design reivew
   * @param isOnline if design review is online
   * @param isInPerson if design review is in person
   * @param docTemplateLink link to the doc template
   * @param wbsNum wbs number for the design review
   * @param meetingTimes the meeting times for the design review
   * @param zoomLink link for the zoom if design review is online
   * @param location location of the design review if in person
   * @returns a design review
   */
  static async createDesignReview(
    submitter: User,
    dateScheduled: Date,
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
    if (!isLeadership(submitter.role)) throw new AccessDeniedException('create design review');

    const teamType = await prisma.teamType.findFirst({
      where: { teamTypeId }
    });

    if (!teamType) {
      throw new NotFoundException('Team Type', teamTypeId);
    }

    const wbsElement = await prisma.wBS_Element.findUnique({
      where: {
        wbsNumber: {
          carNumber: wbsNum.carNumber,
          projectNumber: wbsNum.projectNumber,
          workPackageNumber: wbsNum.workPackageNumber
        }
      }
    });

    if (!wbsElement) {
      throw new NotFoundException('WBS Element', wbsNum.carNumber);
    }

    if (meetingTimes.length === 0) {
      throw new HttpException(400, 'There must be at least one meeting time');
    }

    // checks if the meeting times are valid times and are all continous (ie. [1, 2, 3, 4])
    for (let i = 0; i < meetingTimes.length; i++) {
      if (i === meetingTimes.length - 1) {
        if (meetingTimes[i] < 0 || meetingTimes[i] > 83) {
          throw new HttpException(400, 'Meeting times have to be in range 0-83');
        }
        continue;
      }
      if (meetingTimes[i + 1] - meetingTimes[i] !== 1 || meetingTimes[i] < 0 || meetingTimes[i] > 83) {
        throw new HttpException(400, 'Meeting times have to be continous and in range 0-83');
      }
    }

    if (isOnline && !zoomLink) {
      throw new HttpException(400, 'If the design review is online then there needs to be a zoom link');
    }

    if (isInPerson && !location) {
      throw new HttpException(400, 'If the design review is in person then there needs to be a location');
    }

    if (dateScheduled.valueOf() < new Date().valueOf()) {
      throw new HttpException(400, 'Design review cannot be scheduled for a past day');
    }

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
        userCreated: { connect: { userId: submitter.userId } },
        teamType: { connect: { teamTypeId: teamType.teamTypeId } },
        requiredMembers: { connect: requiredMemberIds.map((memberId) => ({ userId: memberId })) },
        optionalMembers: { connect: optionalMemberIds.map((memberId) => ({ userId: memberId })) },
        meetingTimes,
        wbsElement: { connect: { wbsElementId: wbsElement.wbsElementId } }
      },
      ...designReviewQueryArgs
    });

    const members = await prisma.user.findMany({
      where: { userId: { in: optionalMemberIds.concat(requiredMemberIds) } }
    });

    if (!members) {
      throw new NotFoundException('User', 'Cannot find members who are invited to the design review');
    }

    // get the user settings for all the members invited, who are leaderingship
    const memberUserSettings = await prisma.user_Settings.findMany({
      where: { userId: { in: members.map((member) => member.userId) } }
    });

    if (!memberUserSettings) {
      throw new NotFoundException('User Settings', 'Cannot find settings of members');
    }

    // send a slack message to all leadership invited to the design review
    for (const memberUserSetting of memberUserSettings) {
      if (memberUserSetting.slackId) {
        try {
          await sendSlackDesignReviewNotification(memberUserSetting.slackId, designReview.designReviewId);
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
