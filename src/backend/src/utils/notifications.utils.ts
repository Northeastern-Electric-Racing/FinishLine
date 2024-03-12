import { Team, Task as Prisma_Task, WBS_Element } from '@prisma/client';
import { UserWithSettings } from './auth.utils';
import { HttpException } from './errors.utils';
import { UserWithTeams, getTeamsFromUsers } from './teams.utils';

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
  const usersTeams = getTeamsFromUsers(users);

  firstUsersTeams: for (const team of usersTeams[0]) {
    for (let i = 1; i < usersTeams.length; i++) {
      // If the team is not found in the current user's teams, continue to the next team
      if (!usersTeams[i].some((t) => t.teamId === team.teamId)) continue firstUsersTeams;
    }
    return team;
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
