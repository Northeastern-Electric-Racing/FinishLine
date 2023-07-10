import { Prisma, User } from '@prisma/client';

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
  const members: number[] = team.members
    .map((user) => user.userId)
    .concat(team.headId)
    .concat(team.leads.map((lead) => lead.userId));
  return users.map((user) => user.userId).every((user) => members.includes(user));
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
