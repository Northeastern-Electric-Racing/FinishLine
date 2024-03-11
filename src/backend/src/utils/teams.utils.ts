import { Prisma, User, Team } from '@prisma/client';
import { UserWithTeams } from './notifications.utils';

const teamQueryArgsMembersOnly = Prisma.validator<Prisma.TeamArgs>()({
  include: {
    members: true,
    head: true,
    leads: true
  }
});

/**
 * Returns true if every given user is on the given team (either a member, head, or lead)
 * @param team the given team with members, lead, and head included in the get payload
 * @param users the given users
 * @returns true or false
 */
export const allUsersOnTeam = (team: Prisma.TeamGetPayload<typeof teamQueryArgsMembersOnly>, users: User[]): boolean => {
  return users.every((user) => isUserOnTeam(team, user));
};

/**
 * Returns true if the user is a member, head, or lead of a team
 */
export const isUserOnTeam = (team: Prisma.TeamGetPayload<typeof teamQueryArgsMembersOnly>, user: User): boolean => {
  return (
    team.headId === user.userId ||
    team.leads.map((lead) => lead.userId).includes(user.userId) ||
    team.members.map((member) => member.userId).includes(user.userId)
  );
};

/**
 * Validates that all of the users are at least part of one of the given teams
 *
 * @param teams the teams to check the users are on
 * @param users the users to check are on at least one of the teams
 * @returns if all of the users are part of at least one of ther teams
 */
export const areUsersPartOfTeams = (teams: Prisma.TeamGetPayload<typeof teamQueryArgsMembersOnly>[], users: User[]) => {
  return users.every((user) => teams.some((team) => isUserOnTeam(team, user)));
};

/**
 * Validates that the given user is part of at least one of the given teams
 *
 * @param teams the teams to check the users are on
 * @param user the user to check
 * @returns if all of the users are part of at least one of ther teams
 */
export const isUserPartOfTeams = (teams: Prisma.TeamGetPayload<typeof teamQueryArgsMembersOnly>[], user: User) => {
  return teams.some((team) => isUserOnTeam(team, user));
};

/**
 * Gets the teams from a list of users
 * @param users the users to get the teams from
 * @returns an array of the teams each user is in
 */
export const getTeamsFromUsers = (users: UserWithTeams[]): Team[][] => {
  return users.map((user) => {
    const teams = [];
    if (user.teamAsHead) teams.push(user.teamAsHead);
    if (user.teamsAsLead) teams.push(...user.teamsAsLead);
    if (user.teamsAsMember) teams.push(...user.teamsAsMember);
    return teams;
  });
};
