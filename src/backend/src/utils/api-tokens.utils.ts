import crypto from 'crypto';

/** Prefix on every FinishLine API token, so leaked keys are easy to grep for and to recognize. */
const API_TOKEN_PREFIX = 'fl_';

/** Number of characters of the raw token we keep in plaintext for display purposes. */
const PREVIEW_LENGTH = 4;

/**
 * Hashes an API token so it can be stored and looked up without ever persisting the raw value.
 *
 * A plain SHA-256 is the right choice here (as opposed to a slow KDF like bcrypt): the token is 256
 * bits of cryptographic randomness rather than a low entropy human password, so there is nothing to
 * brute force, and a fast digest keeps the lookup a single indexed query.
 *
 * @param token the raw API token
 * @returns the hex encoded sha256 digest of the token
 */
export const hashApiToken = (token: string): string => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

/**
 * Generates a new API token along with the values we persist for it.
 *
 * The raw token is returned to the caller exactly once and is never stored; only the hash and a
 * short preview are written to the database.
 *
 * @returns the raw token, its hash, and the preview shown in the UI
 */
export const generateApiToken = (): { token: string; tokenHash: string; preview: string } => {
  const token = API_TOKEN_PREFIX + crypto.randomBytes(32).toString('base64url');

  return {
    token,
    tokenHash: hashApiToken(token),
    preview: token.slice(-PREVIEW_LENGTH)
  };
};
