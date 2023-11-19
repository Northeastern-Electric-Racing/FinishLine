import { AuthenticatedUser, User, isHead } from 'shared';
import { fullNamePipe } from './pipes';

/**
 * Construct the autocomplete option that displays user's full name and email
 * @param user the user info to be displayed in autocomplte option
 * @returns the autocomplete option with label and id
 */
export const userToAutocompleteOption = (user: User): { label: string; id: number } => {
  return { label: `${fullNamePipe(user)} (${user.email})`, id: user.userId };
};

/**
 * Determines whether a user is authorized to view the Admin Tools page.
 *
 * @param user the user to check
 * @returns whether they can view Admin Tools
 */
export const canAccessAdminTools = (user?: AuthenticatedUser): boolean => {
  if (!user || !user.isAtLeastFinanceLead) return false;
  return isHead(user.role) || user.isAtLeastFinanceLead;
};
