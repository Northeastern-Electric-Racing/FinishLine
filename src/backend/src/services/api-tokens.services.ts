import { Organization, User as PrismaUser } from '@prisma/client';
import { ApiTokenMetadata, GeneratedApiToken, isAdmin, notGuest, User } from 'shared';
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

/**
 * Resolves the FinishLine user a Slack bot is acting on behalf of.
 *
 * Slack ids are only unique per workspace and nothing stops two users from entering the same id, so
 * the lookup is scoped to the organization and must match exactly one user rather than picking one.
 *
 * @param slackUserId the Slack user id of the person who messaged the bot
 * @param organizationId the organization the admin token resolved to
 * @returns the matching user
 * @throws if no user, or more than one user, in the organization has that Slack id
 */
const getUserBySlackId = async (slackUserId: string, organizationId: string): Promise<PrismaUser> => {
  const users = await prisma.user.findMany({
    where: {
      userSettings: { slackId: slackUserId },
      organizations: { some: { organizationId } }
    },
    take: 2
  });

  if (users.length === 0) {
    throw new HttpException(401, 'Authentication Failed: No user in this organization is linked to that Slack id!');
  }
  if (users.length > 1) {
    throw new HttpException(401, 'Authentication Failed: Multiple users in this organization are linked to that Slack id!');
  }

  return users[0];
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
   * When a Slack user id is given, the request is being made by a shared bot on behalf of that Slack
   * user. The token must then belong to an admin of the organization (anything else fails outright,
   * never falling back to the token's own user), and the request runs as the organization member
   * linked to that Slack id instead of as the token's owner.
   *
   * @param token the raw API token the client sent
   * @param organizationId the organization the client asked for, or undefined to use the user's only organization
   * @param slackUserId the Slack user id the bot is acting for, or undefined for a normal token request
   * @returns the user to act as and the organization to scope the request to
   * @throws if the token is missing, unknown, or revoked, the organization can't be resolved, the user
   * is a guest, or a Slack user id was given and the token isn't an admin's or the id doesn't resolve
   */
  static async authenticateApiToken(
    token: string | undefined,
    organizationId: string | undefined,
    slackUserId?: string
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

    if (slackUserId === undefined) return { user, organization };

    // a header that was sent but is blank must not fall through to acting as the admin, and an empty
    // string would otherwise match every user who never set a Slack id (the column defaults to '')
    const trimmedSlackUserId = slackUserId.trim();
    if (!trimmedSlackUserId) throw new HttpException(401, 'Authentication Failed: Empty Slack user id!');

    const isTokenAdmin = await userHasPermission(user.userId, organization.organizationId, isAdmin);
    if (!isTokenAdmin) throw new AccessDeniedException('only admin API tokens can act on behalf of a Slack user');

    const slackUser = await getUserBySlackId(trimmedSlackUserId, organization.organizationId);

    // the impersonated user is held to the same rule as a token owner
    const slackUserHasPermission = await userHasPermission(slackUser.userId, organization.organizationId, notGuest);
    if (!slackUserHasPermission) throw new AccessDeniedException('guests cannot use the API');

    return { user: slackUser, organization };
  }
}
