import { Prisma, User } from '@prisma/client';

const teamQueryArgsMembersOnly = Prisma.validator<Prisma.TeamArgs>()({
  include: {
    members: true,
    leader: true
  }
});

/**
 * Returns true if every given user is on the given team (either a member or the team lead)
 * @param team the given team with members and lead included in the get payload
 * @param users the given users
 * @returns true or false
 */
export const allUsersOnTeam = (team: Prisma.TeamGetPayload<typeof teamQueryArgsMembersOnly>, users: User[]): boolean => {
  const members: number[] = team.members.map((user) => user.userId).concat(team.leaderId);
  return users.map((user) => user.userId).every((user) => members.includes(user));
};

/**
 * Returns true if the user is the team lead or a team member
 */
export const isUserOnTeam = (team: Prisma.TeamGetPayload<typeof teamQueryArgsMembersOnly>, user: User): boolean => {
  return team.leaderId === user.userId || team.members.map((user) => user.userId).includes(user.userId);
};
