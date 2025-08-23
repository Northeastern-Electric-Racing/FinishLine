import { AuthenticatedUser, User, isHead, isLeadership } from 'shared';
import { fullNamePipe } from './pipes';

/**
 * Construct the autocomplete option that displays user's full name and email
 * @param user the user info to be displayed in autocomplte option
 * @returns the autocomplete option with label and id
 */
export const userToAutocompleteOption = (user: User): { label: string; id: string } => {
  return { label: `${fullNamePipe(user)} (${user.email})`, id: user.userId };
};

/**
 * Determines whether a user is authorized to view the Admin Tools page.
 *
 * @param user the user to check
 * @returns whether they can view Admin Tools
 */
export const canAccessAdminTools = (user?: AuthenticatedUser): boolean => {
  if (!user || user.isAtLeastFinanceLead === undefined) return false;
  return isHead(user.role) || user.isAtLeastFinanceLead;
};

/**
 * Determines whether a user can promote guests to members.
 *
 * @param user the user to check
 * @returns whether they can add members (leadership role)
 */
export const canAddMembers = (user?: AuthenticatedUser): boolean => {
  if (!user) return false;
  return isLeadership(user.role);
};
