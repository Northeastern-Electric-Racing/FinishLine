import { Design_Review, Design_Review_Status, User } from '@prisma/client';
import { DesignReview, isAdmin, isNotLeadership } from 'shared';
import prisma from '../prisma/prisma';
import {
  NotFoundException,
  AccessDeniedMemberException,
  DeletedException,
  HttpException,
  AccessDeniedAdminOnlyException
} from '../utils/errors.utils';
import { getUsers, getPrismaQueryUserIds } from '../utils/users.utils';
import { validateMeetingTimes } from '../utils/design-reviews.utils';
import designReviewQueryArgs from '../prisma-query-args/design-reviews.query-args';
import { designReviewTransformer } from '../transformers/design-review.transformer';
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
   * @param requiredMembers required members for the design review
   * @param optionalMembers optional members for the design review
   * @param isOnline is the design review online (IF TRUE: zoom link should be requried))
   * @param isInPerson is the design review in person (IF TRUE: location should be required)
   * @param zoomLink the zoom link for the design review meeting
   * @param location the location for the design review meeting
   * @param docTemplateLink the document template link for the design review
   * @param status see Design_Review_Status enum
   * @param attendees the attendees for the design review (should they have any relation to the other shit / can't edit this after STATUS: DONE)
   * @param meetingTimes meeting time must be between 0-84 (Monday 12am - Sunday 12am, 1hr minute increments)
   */

  static async editDesignReviews(
    user: User,
    designReviewId: string,
    dateScheduled: Date,
    teamTypeId: string,
    requiredMembers: number[],
    optionalMembers: number[],
    isOnline: boolean,
    isInPerson: boolean,
    zoomLink: string | null,
    location: string | null,
    docTemplateLink: string | null,
    status: Design_Review_Status,
    attendees: number[],
    meetingTimes: number[]
  ): Promise<Design_Review> {
    // verify user is allowed to edit work package
    if (isNotLeadership(user.role)) throw new AccessDeniedMemberException('edit design reviews');
    console.log(zoomLink);

    // make sure the requiredMembers are not in the optionalMembers
    if (requiredMembers.length > 0 && requiredMembers.some((rMember) => optionalMembers.includes(rMember))) {
      throw new HttpException(400, 'required members cannot be in optional members');
    }
    // throw if a user isn't found, then build prisma queries for connecting userIds
    const updatedRequiredMembers = getPrismaQueryUserIds(await getUsers(requiredMembers));
    const updatedOptionalMembers = getPrismaQueryUserIds(await getUsers(optionalMembers));
    const updatedAttendees = getPrismaQueryUserIds(await getUsers(attendees));

    // make sure there is a zoom link if the design review is online
    if (isOnline && zoomLink === null) {
      throw new HttpException(400, 'zoom link is required for online design reviews');
    }
    // make sure there is a location if the design review is in person
    if (isInPerson && location === null) {
      throw new HttpException(400, 'location is required for in person design reviews');
    }

    // throws if meeting times are not: consecutive and between 0-84
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

    // actually try to update the design review
    const updateDesignReviews = await prisma.design_Review.update({
      where: { designReviewId },
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
    return updateDesignReviews;
  }
}
