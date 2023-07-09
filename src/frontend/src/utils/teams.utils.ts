import { Team, TeamPreview, User } from 'shared';

export const makeTeamList = (team: Team | TeamPreview): User[] => {
  return team.members.concat(team.head).concat(team.leads);
};
