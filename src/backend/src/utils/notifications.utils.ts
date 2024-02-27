import { Team, Task as Prisma_Task, WBS_Element } from '@prisma/client';
import { UserWithSettings } from './auth.utils';
import { HttpException } from './errors.utils';

export type UserWithTeams = UserWithSettings & {
  teamAsHead: Team | null;
  teamsAsLead: Team[] | null;
  teamsAsMember: Team[] | null;
};

export type TaskWithAssignees = Prisma_Task & {
  assignees: UserWithSettings[] | null;
  wbsElement: WBS_Element | null;
};

export const usersToSlackPings = (users: UserWithSettings[]) => {
  // https://api.slack.com/reference/surfaces/formatting#mentioning-users
  return users.map((user) => `<@${user.userSettings?.slackId}>`).join(' ');
};

/**
 * Gets the team of a task's assignees.
 * Assumes all assigness share a team
 * @param users the users of the task
 * @returns the team assigned to the task
 */
export const getTeamFromTaskAssignees = (users: UserWithTeams[]): Team => {
  const allTeams = users.map((user) => {
    const teams = [];
    if (user.teamAsHead) teams.push(user.teamAsHead);
    if (user.teamsAsLead) teams.push(...user.teamsAsLead);
    if (user.teamsAsMember) teams.push(...user.teamsAsMember);
    return teams;
  });

  // Find common teams across all users
  const commonTeams = allTeams.reduce((acc, teams, index) => {
    if (index === 0) {
      return teams;
    }
    return acc.filter((team) => teams.some((t) => t.teamId === team.teamId));
  }, allTeams[0] || []);

  // Assuming we return the Slack ID of the first common team if there are any
  if (commonTeams.length > 0) {
    return commonTeams[0]; // Return the first common team
  }

  throw new HttpException(400, 'All of the users do not share a team!');
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
