import { Organization, User_API_Token } from '@prisma/client';
import { ApiTokenMetadata, GeneratedApiToken, notGuest, User } from 'shared';
import prisma from '../prisma/prisma.js';
import { AccessDeniedGuestException } from '../utils/errors.utils.js';
import { userHasPermission } from '../utils/users.utils.js';
import { generateApiToken } from '../utils/api-tokens.utils.js';

/**
 * Strips an API token row down to the metadata that is safe to send to the client. The raw token is
 * never stored, so it can never be included here.
 * @param apiToken the token row
 * @returns the displayable metadata for the token
 */
const apiTokenMetadata = (apiToken: User_API_Token): ApiTokenMetadata => ({
  apiTokenId: apiToken.apiTokenId,
  name: apiToken.name,
  preview: apiToken.preview,
  dateCreated: apiToken.dateCreated,
  lastUsedAt: apiToken.lastUsedAt ?? undefined
});

export default class ApiTokenService {
  /**
   * Gets the metadata for the given user's active API token, if they have one.
   * @param user the user whose token we're fetching
   * @returns the token metadata, or null if the user has no active token
   */
  static async getCurrentUserApiToken(user: User): Promise<ApiTokenMetadata | null> {
    const apiToken = await prisma.user_API_Token.findFirst({
      where: { userId: user.userId, dateRevoked: null }
    });

    return apiToken ? apiTokenMetadata(apiToken) : null;
  }

  /**
   * Generates a new API token for the given user, revoking any token they already had. This backs
   * both the "generate" and "regenerate" actions, since generating is always a rotation.
   * @param user the user the token belongs to
   * @param organization the organization the request was made in, used for the permission check
   * @returns the token metadata along with the raw token, which is only ever returned here
   * @throws if the user is a guest in this organization
   */
  static async generateApiToken(user: User, organization: Organization): Promise<GeneratedApiToken> {
    const hasPermission = await userHasPermission(user.userId, organization.organizationId, notGuest);
    if (!hasPermission) throw new AccessDeniedGuestException('generate an API token');

    const { token, tokenHash, preview } = generateApiToken();

    const [, createdToken] = await prisma.$transaction([
      prisma.user_API_Token.updateMany({
        where: { userId: user.userId, dateRevoked: null },
        data: { dateRevoked: new Date() }
      }),
      prisma.user_API_Token.create({
        data: { userId: user.userId, tokenHash, preview }
      })
    ]);

    return { ...apiTokenMetadata(createdToken), token };
  }
}
