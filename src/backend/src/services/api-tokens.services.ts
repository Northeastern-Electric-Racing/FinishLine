import { Organization, User as PrismaUser } from '@prisma/client';
import { ApiTokenMetadata, GeneratedApiToken, notGuest, User } from 'shared';
import prisma from '../prisma/prisma.js';
import {
  AccessDeniedException,
  AccessDeniedGuestException,
  DeletedException,
  HttpException,
  NotFoundException
} from '../utils/errors.utils.js';
import { userHasPermission } from '../utils/users.utils.js';
import { generateApiToken, hashApiToken } from '../utils/api-tokens.utils.js';
import { apiTokenTransformer } from '../transformers/api-token.transformer.js';
import { getOrganization } from '../utils/auth.utils.js';

/**
 * Resolves the organization for an API token request when no organization id was sent.
 *
 * Falls back to the user's organization when they only belong to one, which lets a client be
 * configured with nothing but a token. Users in multiple organizations must be explicit.
 *
 * @param userId the id of the user making the request
 * @returns the organization the request should run against
 * @throws if the user belongs to zero or multiple organizations
 */
const getSoleOrganization = async (userId: string): Promise<Organization> => {
  const roles = await prisma.role.findMany({ where: { userId } });

  if (roles.length !== 1) {
    throw new AccessDeniedException(
      'Organization not provided: send an organizationId header when your user belongs to multiple organizations'
    );
  }

  const organization = await prisma.organization.findUnique({
    where: { organizationId: roles[0].organizationId },
    // only this user's membership row is needed, so don't hydrate every member of the organization
    include: { users: { where: { userId }, select: { userId: true } } }
  });

  if (!organization) throw new NotFoundException('Organization', roles[0].organizationId);
  if (organization.dateDeleted) throw new DeletedException('Organization', organization.organizationId);

  // mirrors the membership check getOrganization does, so both paths are equally strict
  if (organization.users.length === 0) {
    throw new AccessDeniedException('Cannot access this organization');
  }

  return organization;
};

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

    return apiToken ? apiTokenTransformer(apiToken) : null;
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

    return { ...apiTokenTransformer(createdToken), token };
  }

  /**
   * Resolves a raw API token to the user it belongs to and the organization the request runs against.
   *
   * The guest check runs on every call, so demoting someone to guest revokes their token's access
   * immediately rather than whenever the token is next rotated.
   *
   * @param token the raw API token the client sent
   * @param organizationId the organization the client asked for, or undefined to use the user's only organization
   * @returns the token's user and the organization to scope the request to
   * @throws if the token is missing, unknown, or revoked, the organization can't be resolved, or the user is a guest
   */
  static async authenticateApiToken(
    token: string | undefined,
    organizationId: string | undefined
  ): Promise<{ user: PrismaUser; organization: Organization }> {
    if (!token) throw new HttpException(401, 'Authentication Failed: No API token provided!');

    const apiToken = await prisma.user_API_Token.findUnique({
      where: { tokenHash: hashApiToken(token) },
      include: { user: true }
    });

    if (!apiToken || apiToken.dateRevoked) throw new HttpException(401, 'Authentication Failed: Invalid API token!');

    const { user } = apiToken;

    // an explicit organization id wins, and getOrganization already verifies membership
    const organization = organizationId
      ? await getOrganization({ organizationid: organizationId }, user)
      : await getSoleOrganization(user.userId);

    const hasPermission = await userHasPermission(user.userId, organization.organizationId, notGuest);
    if (!hasPermission) throw new AccessDeniedException('guests cannot use the API');

    // fire and forget: last used is for auditing and must never add latency or fail the request
    prisma.user_API_Token
      .update({ where: { apiTokenId: apiToken.apiTokenId }, data: { lastUsedAt: new Date() } })
      .catch(() => {});

    return { user, organization };
  }
}
