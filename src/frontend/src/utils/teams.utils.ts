import { Team, TeamPreview, User } from 'shared';

export const makeTeamList = (team: Team | TeamPreview): User[] => {
  return team.members.concat(team.head).concat(team.leads);
};

export const isUserOnTeam = (team: TeamPreview, user: User): boolean => {
  return (
    team.head.userId === user.userId ||
    team.leads.map((lead) => lead.userId).includes(user.userId) ||
    team.members.map((member) => member.userId).includes(user.userId)
  );
};
