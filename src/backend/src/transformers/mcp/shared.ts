/**
 * Helpers shared by the MCP transformers.
 *
 * The guiding rule for this whole directory: an LLM only ever needs a person's name, so users are
 * collapsed to a single string rather than nested objects. Never call getUserFullName here - it
 * issues its own query per user, which becomes an N+1 across a list.
 */

/**
 * Collapses a user to a display name.
 * @param user the user, selected down to just their name
 * @returns "First Last", or undefined when there is no user
 */
export const fullName = (user: { firstName: string; lastName: string } | null | undefined): string | undefined => {
  return user ? `${user.firstName} ${user.lastName}` : undefined;
};
