import { Task as Prisma_Task, WBS_Element, Design_Review, Change_Request } from '@prisma/client';
import { UserWithSettings } from './auth.utils';
import NotificationsService from '../services/notifications.services';
import { User } from '@prisma/client';

export type TaskWithAssignees = Prisma_Task & {
  assignees: UserWithSettings[] | null;
  wbsElement: WBS_Element;
};

export type DesignReviewWithAttendees = Design_Review & { attendees: UserWithSettings[]; wbsElement: WBS_Element };

export const usersToSlackPings = (users: UserWithSettings[]) => {
  // https://api.slack.com/reference/surfaces/formatting#mentioning-users
  return users.map(userToSlackPing).join(' ');
};

export const userToSlackPing = (user: UserWithSettings) => {
  return `<@${user.userSettings?.slackId}>`;
};

/**
 * Gets the beginning of the day tomorrow
 * @returns the beginning of the day tomorrow (at 12am)
 */
export const startOfDayTomorrow = () => {
  return new Date(new Date().setHours(24, 0, 0, 0));
};

/**
 * Gets the end of the day tomorrow
 * @returns the end of the day tomorrow (i.e. 12am of the following day)
 */
export const endOfDayTomorrow = () => {
  const startOfDay = startOfDayTomorrow();
  const endOfDay = new Date(startOfDay);
  endOfDay.setDate(startOfDay.getDate() + 1);
  return endOfDay;
};

/**
 * Sends a finishline notification that a design review was scheduled
 * @param designReview dr that was created
 * @param members optional and required members of the dr
 * @param submitter the user who created the dr
 * @param workPackageName the name of the work package associated witht the dr
 * @param organizationId  id of the organization of the dr
 */
export const sendHomeDrNotification = async (
  designReview: Design_Review,
  members: User[],
  submitter: User,
  workPackageName: string,
  organizationId: string
) => {
  const designReviewLink = `/settings/preferences?drId=${designReview.designReviewId}`;

  const msg = `Design Review for ${workPackageName} is being scheduled by ${submitter.firstName} ${submitter.lastName}`;
  await NotificationsService.sendNotifcationToUsers(
    msg,
    'calendar_month',
    members.map((member) => member.userId),
    organizationId,
    designReviewLink
  );
};

/**
 * Sends a finishline notification that a change request was reviewed
 * @param changeRequest cr that was requested review
 * @param submitter the user who submitted the cr
 * @param accepted true if the cr changes were accepted, false if denied
 * @param organizationId id of the organization of the cr
 */
export const sendHomeCrReviewedNotification = async (
  changeRequest: Change_Request,
  submitter: User,
  accepted: boolean,
  organizationId: string
) => {
  const changeRequestLink = `/change-requests/${changeRequest.crId}`;
  await NotificationsService.sendNotifcationToUsers(
    `CR #${changeRequest.identifier} has been ${accepted ? 'approved!' : 'denied.'}`,
    accepted ? 'check_circle' : 'cancel',
    [submitter.userId],
    organizationId,
    changeRequestLink
  );
};

/**
 * Sends a finishline notification to all requested reviewers of a change request
 * @param changeRequest cr that was requested review
 * @param reviewers user's reviewing the cr
 * @param organizationId id of the organization of the cr
 */
export const sendHomeCrRequestReviewNotification = async (
  changeRequest: Change_Request,
  reviewers: User[],
  organizationId: string
) => {
  const changeRequestLink = `/change-requests/${changeRequest.crId}`;
  await NotificationsService.sendNotifcationToUsers(
    `Your review has been requested on CR #${changeRequest.identifier}`,
    'edit_note',
    reviewers.map((reviewer) => reviewer.userId),
    organizationId,
    changeRequestLink
  );
};
