import { Team, TeamPreview, User } from 'shared';
import { fullNamePipe } from './pipes';

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

/**
 * Converts a user to an option for an autocomplete
 * @param user user that is being converted to an autocomplete option
 * @returns an autocomplete option
 */
export const userToAutocompleteOption = (user?: User): { label: string; id: string } => {
  if (!user) return { label: '', id: '' };
  return { label: `${fullNamePipe(user)} (${user.email}) - ${user.role}`, id: user.userId.toString() };
};

/**
 * Compares two users, used to sort a list of users alphabetically
 * @param user1 first user
 * @param user2 second user
 * @returns 1 if user 1 comes before user 2 alphabetically and -1 otherwise
 */
export const userComparator = (user1: User, user2: User) => {
  return user1.firstName > user2.firstName ? 1 : -1;
};

export type SubmitText = 'Submit' | 'Save' | 'Create' | 'Yes' | 'Delete' | 'Schedule' | 'Send To Advisor' | 'Submit to SABO';

export type CancelText = 'Cancel' | 'Delete' | 'Exit' | 'No';
