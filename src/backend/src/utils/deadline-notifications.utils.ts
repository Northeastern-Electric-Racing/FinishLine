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
 * @returns the slack id of the team assigned to the task
 */
export const getTeamFromTaskAssignees = (users: UserWithTeams[]): string => {
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
    return commonTeams[0].slackId; // Return the slackId of the first common team
  }

  throw new HttpException(400, 'All of the users do not share a team!');
};
