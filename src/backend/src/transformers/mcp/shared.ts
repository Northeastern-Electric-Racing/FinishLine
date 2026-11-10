import { McpUser } from 'shared';

/**
 * Helpers shared by the MCP transformers.
 *
 * The guiding rule for this whole directory: an LLM only ever needs a person's name, plus their id so
 * it can hand them back to a write tool, so users are collapsed to exactly that rather than nested
 * objects. Never call getUserFullName here - it issues its own query per user, which becomes an N+1
 * across a list.
 */

type NamedUser = { userId: string; firstName: string; lastName: string };

/**
 * Collapses a user to their id and display name.
 * @param user the user, selected down to just their id and name
 * @returns the id and "First Last"
 */
export const mcpUser = (user: NamedUser): McpUser => ({ userId: user.userId, name: `${user.firstName} ${user.lastName}` });

/**
 * Collapses an optional user, such as a wbs element's lead, to their id and display name.
 * @param user the user, selected down to just their id and name
 * @returns the id and "First Last", or undefined when there is no user
 */
export const optionalMcpUser = (user: NamedUser | null | undefined): McpUser | undefined =>
  user ? mcpUser(user) : undefined;
