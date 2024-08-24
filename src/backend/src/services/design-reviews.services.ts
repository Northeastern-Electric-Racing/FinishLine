import { Design_Review_Status, Team_Type, User } from '@prisma/client';
import {
  DesignReview,
  WbsNumber,
  isAdmin,
  isLeadership,
  isNotLeadership,
  DesignReviewStatus,
  AvailabilityCreateArgs
} from 'shared';
import prisma from '../prisma/prisma';
import {
  NotFoundException,
  AccessDeniedMemberException,
  DeletedException,
  HttpException,
  AccessDeniedAdminOnlyException,
  AccessDeniedException,
  InvalidOrganizationException
} from '../utils/errors.utils';
import {
  getUsers,
  getPrismaQueryUserIds,
  userHasPermission,
  areUsersinList,
  updateUserAvailability
} from '../utils/users.utils';
import { isUserOnDesignReview, validateMeetingTimes } from '../utils/design-reviews.utils';
import { designReviewTransformer } from '../transformers/design-reviews.transformer';
import {
  sendDRConfirmationToThread,
  sendDRScheduledSlackNotif,
  sendDRUserConfirmationToThread,
  sendSlackDRNotifications,
  sendSlackDesignReviewConfirmNotification
} from '../utils/slack.utils';
import { getDesignReviewQueryArgs } from '../prisma-query-args/design-reviews.query-args';
import { getWorkPackageQueryArgs } from '../prisma-query-args/work-packages.query-args';
import { UserWithSettings } from '../utils/auth.utils';
import { getUserScheduleSettingsQueryArgs } from '../prisma-query-args/user.query-args';

export default class DesignReviewsService {
  /**
   * Gets all design reviews in the database
   * @param organizationId the organization id of the current user
   * @returns All of the design reviews
   */
  static async getAllDesignReviews(organizationId: string): Promise<DesignReview[]> {
    const designReviews = await prisma.design_Review.findMany({
      where: { dateDeleted: null, wbsElement: { organizationId } },
      ...getDesignReviewQueryArgs(organizationId)
    });
    return designReviews.map(designReviewTransformer);
  }

  /**
   * Deletes a design review
   * @param submitter the user who deleted the design review
   * @param designReviewId the id of the design review to be deleted
   * @param organizationId the organization that the user is currently in
   */
  static async deleteDesignReview(submitter: User, designReviewId: string, organizationId: string): Promise<DesignReview> {
    const designReview = await prisma.design_Review.findUnique({
      where: { designReviewId },
      ...getDesignReviewQueryArgs(organizationId)
    });

    if (!designReview) throw new NotFoundException('Design Review', designReviewId);
    if (designReview.dateDeleted) throw new DeletedException('Design Review', designReviewId);
    if (designReview.wbsElement.organizationId !== organizationId) throw new InvalidOrganizationException('Design Review');

    if (
      !(
        (await userHasPermission(submitter.userId, organizationId, isAdmin)) ||
        submitter.userId === designReview.userCreatedId
      )
    )
      throw new AccessDeniedAdminOnlyException('delete design reviews');

    const deletedDesignReview = await prisma.design_Review.update({
      where: { designReviewId },
      data: { dateDeleted: new Date(), userDeleted: { connect: { userId: submitter.userId } } },
      ...getDesignReviewQueryArgs(organizationId)
    });

    return designReviewTransformer(deletedDesignReview);
  }

  /**
   * Create a design review
   * @param submitter User submitting the design review
   * @param initialDate what initial date to base the meeting times off of
   * @param teamTypeId team type id
   * @param requiredMemberIds ids of members who are required to go
   * @param optionalMemberIds ids of members who do not have to go
   * @param wbsNum wbs num related to the design review
   * @param meetingTimes meeting times of the design review
   * @param organizationId the organization that the user is currently in
   * @returns a new design review
   */
  static async createDesignReview(
    submitter: User,
    initialDate: string,
    teamTypeId: string,
    requiredMemberIds: string[],
    optionalMemberIds: string[],
    wbsNum: WbsNumber,
    meetingTimes: number[],
    organizationId: string
  ): Promise<DesignReview> {
    if (!(await userHasPermission(submitter.userId, organizationId, isLeadership)))
      throw new AccessDeniedException('create design review');

    const teamType = await DesignReviewsService.getSingleTeamType(teamTypeId, organizationId);

    const wbsElement = await prisma.wBS_Element.findUnique({
      where: {
        wbsNumber: {
          carNumber: wbsNum.carNumber,
          projectNumber: wbsNum.projectNumber,
          workPackageNumber: wbsNum.workPackageNumber,
          organizationId
        }
      },
      include: {
        workPackage: getWorkPackageQueryArgs(organizationId)
      }
    });

    if (!wbsElement) throw new NotFoundException('WBS Element', wbsNum.carNumber);
    if (wbsElement.dateDeleted) throw new DeletedException('WBS Element', wbsNum.carNumber);
    if (wbsElement.organizationId !== organizationId) throw new InvalidOrganizationException('WBS Element');

    // checks if the meeting times are valid times and are all continous (ie. [1, 2, 3, 4])
    validateMeetingTimes(meetingTimes);

    const date = new Date(initialDate);

    if (date.getTime() < new Date().getTime()) {
      throw new HttpException(400, 'Design review cannot be initially set for a past day');
    }

    const designReview = await prisma.design_Review.create({
      data: {
        initialDateScheduled: date,
        dateScheduled: date,
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
      ...getDesignReviewQueryArgs(organizationId)
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
          await sendSlackDesignReviewConfirmNotification(
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

    const project = wbsElement.workPackage?.project;
    const teams = project?.teams;
    if (teams && teams.length > 0) {
      await sendSlackDRNotifications(teams, designReview, submitter, wbsElement.name);
    }

    return designReviewTransformer(designReview);
  }

  /**
   * Retrieves a single design review
   *
   * @param submitter the user who is trying to retrieve the design review
   * @param designReviewId the id of the design review to retrieve
   * @param organizationId the organization that the user is currently in
   * @returns the design review
   */
  static async getSingleDesignReview(
    _submitter: User,
    designReviewId: string,
    organizationId: string
  ): Promise<DesignReview> {
    const designReview = await prisma.design_Review.findUnique({
      where: { designReviewId },
      ...getDesignReviewQueryArgs(organizationId)
    });

    if (!designReview) throw new NotFoundException('Design Review', designReviewId);

    if (designReview.dateDeleted) throw new DeletedException('Design Review', designReviewId);
    if (designReview.wbsElement.organizationId !== organizationId) throw new InvalidOrganizationException('Design Review');

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
   * @param isOnline is the design review online (IF TRUE: zoom link should be requried)
   * @param isInPerson is the design review in person (IF TRUE: location should be required)
   * @param zoomLink the zoom link for the design review meeting
   * @param location the location for the design review meeting
   * @param docTemplateLink the document template link for the design review
   * @param status see Design_Review_Status enum
   * @param attendees the attendees for the design review
   * @param meetingTimes meeting time must be between 0-83 (representing 1hr increments from 10am 10pm, Monday-Sunday)
   * @param organizationId the organization that the user is currently in
   */

  static async editDesignReview(
    user: User,
    designReviewId: string,
    dateScheduled: Date,
    teamTypeId: string,
    requiredMembersIds: string[],
    optionalMembersIds: string[],
    isOnline: boolean,
    isInPerson: boolean,
    zoomLink: string | null,
    location: string | null,
    docTemplateLink: string | null,
    status: Design_Review_Status,
    attendees: string[],
    meetingTimes: number[],
    organizationId: string
  ): Promise<DesignReview> {
    // verify user is allowed to edit design review
    if (await userHasPermission(user.userId, organizationId, isNotLeadership))
      throw new AccessDeniedMemberException('edit design reviews');

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

    // throws if meeting times are not: consecutive and between 0-11
    meetingTimes = validateMeetingTimes(meetingTimes);

    // docTemplateLink is required if the status is scheduled or done
    if (status === Design_Review_Status.SCHEDULED || status === Design_Review_Status.DONE) {
      if (docTemplateLink == null) {
        throw new HttpException(400, 'doc template link is required for scheduled and done design reviews');
      }
    }
    // validate the design review exists and is not deleted
    const originaldesignReview = await prisma.design_Review.findUnique({
      where: { designReviewId },
      ...getDesignReviewQueryArgs(organizationId)
    });
    if (!originaldesignReview) throw new NotFoundException('Design Review', designReviewId);
    if (originaldesignReview.dateDeleted) throw new DeletedException('Design Review', designReviewId);
    if (originaldesignReview.wbsElement.organizationId !== organizationId)
      throw new InvalidOrganizationException('Design Review');

    // validate the teamTypeId exists
    const teamType = await DesignReviewsService.getSingleTeamType(teamTypeId, organizationId);

    // throw if a user isn't found, then build prisma queries for connecting userIds
    const updatedRequiredMembers = getPrismaQueryUserIds(await getUsers(requiredMembersIds));
    const updatedOptionalMembers = getPrismaQueryUserIds(await getUsers(optionalMembersIds));
    const updatedAttendees = getPrismaQueryUserIds(await getUsers(attendees));

    // actually try to update the design review
    const updatedDesignReview = await prisma.design_Review.update({
      where: { designReviewId },
      data: {
        designReviewId,
        dateScheduled,
        meetingTimes,
        status,
        teamTypeId: teamType.teamTypeId,
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
      },
      ...getDesignReviewQueryArgs(organizationId)
    });

    if (status === Design_Review_Status.SCHEDULED) {
      await sendDRScheduledSlackNotif(updatedDesignReview.notificationSlackThreads, updatedDesignReview);
    }

    return designReviewTransformer(updatedDesignReview);
  }

  /**
   * Edits a design review by confirming a given user's availability and also updating their schedule settings with the given availability
   * @param submitter the member that is being confirmed
   * @param designReviewId the id of the design review
   * @param availabilities the given member's availabilities
   * @param organizationId the organization that the user is currently in
   * @returns the modified design review with its updated confirmedMembers
   */
  static async markUserConfirmed(
    designReviewId: string,
    availabilities: AvailabilityCreateArgs[],
    submitter: UserWithSettings,
    organizationId: string
  ): Promise<DesignReview> {
    const designReview = await prisma.design_Review.findUnique({
      where: { designReviewId },
      ...getDesignReviewQueryArgs(organizationId)
    });

    if (!designReview) throw new NotFoundException('Design Review', designReviewId);
    if (designReview.dateDeleted) throw new DeletedException('Design Review', designReviewId);
    if (designReview.wbsElement.organizationId !== organizationId) throw new InvalidOrganizationException('Design Review');

    if (!isUserOnDesignReview(submitter, designReviewTransformer(designReview)))
      throw new HttpException(400, 'Current user is not in the list of this design reviews members');

    let userSettings = await prisma.schedule_Settings.findUnique({
      where: { userId: submitter.userId },
      ...getUserScheduleSettingsQueryArgs()
    });

    if (!userSettings) {
      userSettings = await prisma.schedule_Settings.create({
        data: {
          userId: submitter.userId,
          availabilities: {
            createMany: {
              data: availabilities.map((availability) => ({
                availability: availability.availability,
                dateSet: availability.dateSet
              }))
            }
          },
          personalGmail: '',
          personalZoomLink: ''
        },
        ...getUserScheduleSettingsQueryArgs()
      });
    }

    await updateUserAvailability(availabilities, userSettings, submitter);

    // set submitter as confirmed if they're not already
    if (!designReview.confirmedMembers.map((user) => user.userId).includes(submitter.userId)) {
      const updatedDesignReview = await prisma.design_Review.update({
        where: { designReviewId },
        ...getDesignReviewQueryArgs(organizationId),
        data: {
          confirmedMembers: {
            connect: {
              userId: submitter.userId
            }
          }
        }
      });

      await sendDRUserConfirmationToThread(updatedDesignReview.notificationSlackThreads, submitter);

      // If all required attendees have confirmed their schedule and this member was a required attendee, mark design review as confirmed
      if (
        areUsersinList(designReview.requiredMembers, updatedDesignReview.confirmedMembers) &&
        areUsersinList([submitter], designReview.requiredMembers)
      ) {
        await prisma.design_Review.update({
          where: { designReviewId },
          ...getDesignReviewQueryArgs(organizationId),
          data: {
            status: Design_Review_Status.CONFIRMED
          }
        });

        await sendDRConfirmationToThread(updatedDesignReview.notificationSlackThreads, updatedDesignReview.userCreated);
      }

      return designReviewTransformer(updatedDesignReview);
    }
    return designReviewTransformer(designReview);
  }

  /**
   * Sets the status of a design review, only admin or the user who created the design review can set the status.
   * @param user the user trying to set the status
   * @param designReviewId the id of the design review
   * @param status the status to set the design review to
   * @param organizationId the organization that the user is currently in
   * @returns the modified design review
   */
  static async setStatus(
    user: User,
    designReviewId: string,
    status: DesignReviewStatus,
    organizationId: string
  ): Promise<DesignReview> {
    // validate the design review exists and is not deleted
    const originaldesignReview = await prisma.design_Review.findUnique({
      where: { designReviewId },
      include: { wbsElement: true }
    });
    if (!originaldesignReview) throw new NotFoundException('Design Review', designReviewId);
    if (originaldesignReview.dateDeleted) throw new DeletedException('Design Review', designReviewId);
    if (originaldesignReview.wbsElement.organizationId !== organizationId)
      throw new InvalidOrganizationException('Design Review');

    // verify user is allowed to set the status of the design review
    if (
      !(await userHasPermission(user.userId, organizationId, isAdmin)) &&
      user.userId !== originaldesignReview.userCreatedId
    ) {
      throw new AccessDeniedAdminOnlyException('set the status of a design review');
    }

    // actually try to update the design review
    const updatedDesignReview = await prisma.design_Review.update({
      where: { designReviewId },
      ...getDesignReviewQueryArgs(organizationId),
      data: {
        status
      }
    });

    return designReviewTransformer(updatedDesignReview);
  }

  /**
   * Gets a single team type and validates that it exists and is in the organization
   * @param teamTypeId The id of the team type to get
   * @param organizationId The organization that the user is currently in
   * @returns The retrieved Team Type
   */
  static async getSingleTeamType(teamTypeId: string, organizationId: string): Promise<Team_Type> {
    const teamType = await prisma.team_Type.findUnique({
      where: { teamTypeId }
    });

    if (!teamType) throw new NotFoundException('Team Type', teamTypeId);
    if (teamType.organizationId !== organizationId) throw new InvalidOrganizationException('Team Type');

    return teamType;
  }
}
