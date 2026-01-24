import { Change_Request, Design_Review } from '@prisma/client';
import { User } from 'shared';
import { PopUpService } from '../services/pop-up.services.js';

/**
 * Sends a pop up that a design review was scheduled
 * @param designReview dr that was created
 * @param members optional and required members of the dr
 * @param submitter the user who created the dr
 * @param workPackageName the name of the work package associated witht the dr
 * @param organizationId  id of the organization of the dr
 */
export const sendDrPopUp = async (
  designReview: Design_Review,
  members: User[],
  submitter: User,
  workPackageName: string,
  organizationId: string
) => {
  const designReviewLink = `/settings/preferences?drId=${designReview.designReviewId}`;

  const msg = `Design Review for ${workPackageName} is being scheduled by ${submitter.firstName} ${submitter.lastName}`;
  await PopUpService.sendPopUpToUsers(
    msg,
    'calendar_month',
    members.map((member) => member.userId),
    organizationId,
    designReviewLink
  );
};

/**
 * Sends a pop up that a change request was reviewed
 * @param changeRequest cr that was requested review
 * @param submitter the user who submitted the cr
 * @param accepted true if the cr changes were accepted, false if denied
 * @param organizationId id of the organization of the cr
 */
export const sendCrReviewedPopUp = async (
  changeRequest: Change_Request,
  submitter: User,
  accepted: boolean,
  organizationId: string
) => {
  const changeRequestLink = `/change-requests/${changeRequest.crId}`;
  await PopUpService.sendPopUpToUsers(
    `CR #${changeRequest.identifier} has been ${accepted ? 'approved!' : 'denied.'}`,
    accepted ? 'check_circle' : 'cancel',
    [submitter.userId],
    organizationId,
    changeRequestLink
  );
};

/**
 * Sends a finishline pop up to all requested reviewers of a change request
 * @param changeRequest cr that was requested review
 * @param reviewers user's reviewing the cr
 * @param organizationId id of the organization of the cr
 */
export const sendCrRequestReviewPopUp = async (changeRequest: Change_Request, reviewers: User[], organizationId: string) => {
  const changeRequestLink = `/change-requests/${changeRequest.crId}`;
  await PopUpService.sendPopUpToUsers(
    `Your review has been requested on CR #${changeRequest.identifier}`,
    'edit_note',
    reviewers.map((reviewer) => reviewer.userId),
    organizationId,
    changeRequestLink
  );
};

/**
 * Sends a finishline pop up to a user whose review was requested on a part
 * @param partLink link to the part
 * @param partName name of the part
 * @param reviewer user whose review was requested
 * @param organizationId id of the organization of the part
 */
export const sendPartReviewRequestPopUp = async (
  partLink: string,
  partName: string,
  reviewerId: string,
  organizationId: string
) => {
  await PopUpService.sendPopUpToUsers(
    `Your review has been requested on ${partName}`,
    'edit_note',
    [reviewerId],
    organizationId,
    partLink
  );
};

/**
 * Sends a finishline pop up to a user who is assigned to a part
 * @param partLink link to the part
 * @param partName name of the part
 * @param assignee user who is assigned to the part
 * @param organizationId id of the organization of the part
 */
export const sendPartAssignmentPopUp = async (
  partLink: string,
  partName: string,
  assigneeId: string,
  organizationId: string
) => {
  await PopUpService.sendPopUpToUsers(
    `You have been assigned to ${partName}`,
    'edit_note',
    [assigneeId],
    organizationId,
    partLink
  );
};
