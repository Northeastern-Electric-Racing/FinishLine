import { Task as Prisma_Task, WBS_Element, Design_Review } from '@prisma/client';
import { UserWithSettings } from './auth.utils';

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
