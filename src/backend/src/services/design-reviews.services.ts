import { Design_Review_Status, User } from '@prisma/client';
import { DesignReview, WbsNumber, isAdmin, isLeadership, isNotLeadership } from 'shared';
import prisma from '../prisma/prisma';
import {
  NotFoundException,
  AccessDeniedMemberException,
  DeletedException,
  HttpException,
  AccessDeniedAdminOnlyException,
  AccessDeniedException
} from '../utils/errors.utils';
import { getUsers, getPrismaQueryUserIds } from '../utils/users.utils';
import { isUserOnDesignReview, validateMeetingTimes } from '../utils/design-reviews.utils';
import designReviewQueryArgs from '../prisma-query-args/design-reviews.query-args';
import { designReviewTransformer } from '../transformers/design-reviews.transformer';
import { sendSlackDesignReviewNotification } from '../utils/slack.utils';
export default class DesignReviewsService {
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
   * Create a design review
   * @param submitter User submitting the design review
   * @param dateScheduled when the design review is scheduled for
   * @param teamTypeId team type id
   * @param requiredMemberIds ids of members who are required to go
   * @param optionalMemberIds ids of members who do not have to go
   * @param wbsNum wbs num related to the design review
   * @param meetingTimes meeting times of the design review
   * @returns a new design review
   */
  static async createDesignReview(
    submitter: User,
    dateScheduled: Date,
    teamTypeId: string,
    requiredMemberIds: number[],
    optionalMemberIds: number[],
    wbsNum: WbsNumber,
    meetingTimes: number[]
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

    if (new Date(dateScheduled.toDateString()) < new Date(new Date().toDateString())) {
      throw new HttpException(400, 'Design review cannot be scheduled for a past day');
    }

    const designReview = await prisma.design_Review.create({
      data: {
        dateScheduled,
        dateCreated: new Date(),
        status: Design_Review_Status.UNCONFIRMED,
        isOnline: false,
        isInPerson: false,
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
          await sendSlackDesignReviewNotification(
            memberUserSetting.slackId,
            designReview.designReviewId,
            designReview.wbsElement.name
          );
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

  /**
   * Edits a Design_Review in the database
   * @param user the user editing the design review (must be leadership)
   * @param designReviewId the id of the design review to edit
   * @param dateScheduled the date of the design review
   * @param teamTypeId the team that the design_review is for (software, electrical, etc.)
   * @param requiredMembersIds required members Ids for the design review
   * @param optionalMembersIds optional members Ids for the design review
   * @param isOnline is the design review online (IF TRUE: zoom link should be requried))
   * @param isInPerson is the design review in person (IF TRUE: location should be required)
   * @param zoomLink the zoom link for the design review meeting
   * @param location the location for the design review meeting
   * @param docTemplateLink the document template link for the design review
   * @param status see Design_Review_Status enum
   * @param attendees the attendees for the design review (should they have any relation to the other shit / can't edit this after STATUS: DONE)
   * @param meetingTimes meeting time must be between 0-83 (Monday 12am - Sunday 12am, 1hr minute increments)
   */

  static async editDesignReview(
    user: User,
    designReviewId: string,
    dateScheduled: Date,
    teamTypeId: string,
    requiredMembersIds: number[],
    optionalMembersIds: number[],
    isOnline: boolean,
    isInPerson: boolean,
    zoomLink: string | null,
    location: string | null,
    docTemplateLink: string | null,
    status: Design_Review_Status,
    attendees: number[],
    meetingTimes: number[]
  ): Promise<DesignReview> {
    // verify user is allowed to edit work package
    if (isNotLeadership(user.role)) throw new AccessDeniedMemberException('edit design reviews');

    // make sure the requiredMembersIds are not in the optionalMembers
    if (requiredMembersIds.length > 0 && requiredMembersIds.some((rMemberId) => optionalMembersIds.includes(rMemberId))) {
      throw new HttpException(400, 'required members cannot be in optional members');
    }

    // make sure there is a zoom link if the design review is online
    if (isOnline && zoomLink === null) {
      throw new HttpException(400, 'zoom link is required for online design reviews');
    }
    // make sure there is a location if the design review is in person
    if (isInPerson && location === null) {
      throw new HttpException(400, 'location is required for in person design reviews');
    }

    // throws if meeting times are not: consecutive and between 0-83
    meetingTimes = validateMeetingTimes(meetingTimes);

    // docTemplateLink is required if the status is scheduled or done
    if (status === Design_Review_Status.SCHEDULED || status === Design_Review_Status.DONE) {
      if (docTemplateLink == null) {
        throw new HttpException(400, 'doc template link is required for scheduled and done design reviews');
      }
    }
    // validate the design review exists and is not deleted
    const originaldesignReview = await prisma.design_Review.findUnique({
      where: { designReviewId }
    });
    if (!originaldesignReview) throw new NotFoundException('Design Review', designReviewId);
    if (originaldesignReview.dateDeleted) throw new DeletedException('Design Review', designReviewId);

    // validate the teamTypeId exists
    const teamType = await prisma.teamType.findUnique({
      where: { teamTypeId }
    });
    if (!teamType) throw new NotFoundException('Team Type', teamTypeId);

    // throw if a user isn't found, then build prisma queries for connecting userIds
    const updatedRequiredMembers = getPrismaQueryUserIds(await getUsers(requiredMembersIds));
    const updatedOptionalMembers = getPrismaQueryUserIds(await getUsers(optionalMembersIds));
    const updatedAttendees = getPrismaQueryUserIds(await getUsers(attendees));

    // actually try to update the design review
    const updateDesignReview = await prisma.design_Review.update({
      where: { designReviewId },
      ...designReviewQueryArgs,
      data: {
        designReviewId,
        dateScheduled,
        meetingTimes,
        status,
        teamTypeId,
        requiredMembers: {
          set: updatedRequiredMembers
        },
        optionalMembers: {
          set: updatedOptionalMembers
        },
        location,
        isOnline,
        isInPerson,
        zoomLink,
        docTemplateLink,
        attendees: {
          set: updatedAttendees
        }
      }
    });
    return designReviewTransformer(updateDesignReview);
  }

  /**
   * Edits a design review by confirming a given user's availability and also updating their schedule settings with the given availability
   * @param submitter the member that is being confirmed
   * @param designReviewId the id of the design review
   * @param availability the given member's availabilities
   * @returns the modified design review with its updated confirmedMembers
   */
  static async markUserConfirmed(designReviewId: string, availability: number[], submitter: User): Promise<DesignReview> {
    const designReview = await prisma.design_Review.findUnique({
      where: { designReviewId },
      ...designReviewQueryArgs
    });

    if (!designReview) throw new NotFoundException('Design Review', designReviewId);

    if (designReview.dateDeleted) throw new DeletedException('Design Review', designReviewId);

    if (!isUserOnDesignReview(submitter, designReviewTransformer(designReview)))
      throw new HttpException(400, 'Current user is not in the list of this design reviews members');

    availability.forEach((time) => {
      if (time < 0 || time > 83) {
        throw new HttpException(400, 'Availability times have to be in range 0-83');
      }
    });

    await prisma.schedule_Settings.upsert({
      where: { userId: submitter.userId },
      update: {
        availability
      },
      create: {
        userId: submitter.userId,
        personalGmail: '',
        personalZoomLink: '',
        availability
      }
    });

    // set submitter as confirmed if they're not already
    if (!designReview.confirmedMembers.map((user) => user.userId).includes(submitter.userId)) {
      const updatedDesignReview = await prisma.design_Review.update({
        where: { designReviewId },
        ...designReviewQueryArgs,
        data: {
          confirmedMembers: {
            connect: {
              userId: submitter.userId
            }
          }
        }
      });

      // If all requested attendees have confirmed their schedule, mark design review as confirmed
      if (
        updatedDesignReview.confirmedMembers.length ===
        designReview.requiredMembers.length + designReview.optionalMembers.length
      ) {
        await prisma.design_Review.update({
          where: { designReviewId },
          ...designReviewQueryArgs,
          data: {
            status: Design_Review_Status.CONFIRMED
          }
        });
      }

      return designReviewTransformer(updatedDesignReview);
    }
    return designReviewTransformer(designReview);
  }
}
