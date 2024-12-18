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
 * @param designReview
 * @param members
 * @param submitter
 * @param workPackageName
 * @param organizationId
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
 * @param changeRequest
 * @param submitter
 * @param accepted
 * @param organizationId
 */
export const sendHomeCrReviewedNotification = async (
  changeRequest: Change_Request,
  submitter: User,
  accepted: boolean,
  organizationId: string
) => {
  const isProd = process.env.NODE_ENV === 'production';

  const changeRequestLink = isProd
    ? `https://finishlinebyner.com/change-requests/${changeRequest.crId}`
    : `http://localhost:3000/change-requests/${changeRequest.crId}`;
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
 * @param changeRequest
 * @param newReviewers
 * @param organizationId
 */
export const sendHomeCrRequestReviewNotification = async (
  changeRequest: Change_Request,
  newReviewers: User[],
  organizationId: string
) => {
  const changeRequestLink = `/change-requests/${changeRequest.crId}`;
  await NotificationsService.sendNotifcationToUsers(
    `Your review has been requested on CR #${changeRequest.identifier}`,
    'edit_note',
    newReviewers.map((reviewer) => reviewer.userId),
    organizationId,
    changeRequestLink
  );
};
