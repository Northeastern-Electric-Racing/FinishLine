import { Design_Review, Design_Review_Status, User } from '@prisma/client';
import { isNotLeadership } from 'shared';
import prisma from '../prisma/prisma';
import { NotFoundException, AccessDeniedMemberException, DeletedException, HttpException } from '../utils/errors.utils';
import { getUsers, getUserPrismaIds } from '../utils/users.utils';
import { validateMeetingTimes } from '../utils/design-reviews.utils';
export default class DesignReviewsService {
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
   * @param meetingTimes meeting time must be between 0-48 (9-9, 15 minute increments)
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

    // make sure the requiredMembers are not in the optionalMembers
    if (requiredMembers.length > 0 && requiredMembers.some((rMember) => optionalMembers.includes(rMember))) {
      throw new HttpException(400, 'required members cannot be in optional members');
    }

    // make sure the design review is either online or (exclusive) in person
    if (isOnline && isInPerson) {
      throw new HttpException(400, 'design review cannot be both online and in person');
    }

    // throws if meeting times are not: consecutive and between 0-48
    meetingTimes = validateMeetingTimes(meetingTimes);

    // throw if a user isn't found, then build prisma queries for connecting userIds
    const updatedRequiredMembers = getUserPrismaIds(await getUsers(requiredMembers));
    const updatedOptionalMembers = getUserPrismaIds(await getUsers(optionalMembers));
    const updatedAttendees = getUserPrismaIds(await getUsers(attendees));

    // validate the design review exists and is not deleted
    const originaldesignReview = await prisma.design_Review.findUnique({
      where: { designReviewId }
    });
    if (!originaldesignReview) throw new NotFoundException('Design Review', designReviewId);
    if (originaldesignReview.dateDeleted) throw new DeletedException('Design Review', designReviewId);

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
