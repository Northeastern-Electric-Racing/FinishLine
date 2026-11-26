import { Organization, User as PrismaUser } from '@prisma/client';
import { ApiTokenMetadata, GeneratedApiToken, isAdmin, notGuest, User } from 'shared';
import prisma from '../prisma/prisma.js';
import {
  AccessDeniedAdminOnlyException,
  AccessDeniedException,
  AccessDeniedGuestException,
  DeletedException,
  HttpException,
  NotFoundException
} from '../utils/errors.utils.js';
import { userHasPermission } from '../utils/users.utils.js';
import { generateApiToken, hashApiToken, ORGANIZATION_API_TOKEN_PREFIX } from '../utils/api-tokens.utils.js';
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
 * @param organizationId the organization the bot token belongs to
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

/**
 * Resolves a request made with an organization's (the Slack bot's) token to the Slack user it is acting for.
 *
 * The bot token has no user of its own, so it can only ever be used together with a Slack user id,
 * and it is pinned to the organization it belongs to.
 *
 * @param organization the organization whose bot token the request was made with
 * @param organizationId the organization the client asked for, if any; must match the token's
 * @param slackUserId the Slack user id the bot is acting for
 * @returns the user to act as and the token's organization
 * @throws if the organization is deleted or mismatched, the Slack id is missing or blank, it doesn't
 * resolve to exactly one member of the organization, or that member is a guest
 */
const authenticateOrganizationApiToken = async (
  organization: Organization,
  organizationId: string | undefined,
  slackUserId: string | undefined
): Promise<{ user: PrismaUser; organization: Organization }> => {
  if (organization.dateDeleted) throw new DeletedException('Organization', organization.organizationId);
  if (organizationId !== undefined && organizationId !== organization.organizationId) {
    throw new AccessDeniedException('this API token belongs to a different organization');
  }

  if (slackUserId === undefined) {
    throw new HttpException(401, 'Authentication Failed: Organization API tokens must act on behalf of a Slack user!');
  }

  // an empty string would otherwise match every user who never set a Slack id (the column defaults to '')
  const trimmedSlackUserId = slackUserId.trim();
  if (!trimmedSlackUserId) throw new HttpException(401, 'Authentication Failed: Empty Slack user id!');

  const slackUser = await getUserBySlackId(trimmedSlackUserId, organization.organizationId);

  // the impersonated user is held to the same rule as a token owner
  const hasPermission = await userHasPermission(slackUser.userId, organization.organizationId, notGuest);
  if (!hasPermission) throw new AccessDeniedException('guests cannot use the API');

  // every impersonated request is logged so actions taken through the bot can be traced to who asked for them
  console.info(
    `[api-token] organization ${organization.organizationId} bot token acting as user ${slackUser.userId} ` +
      `(slack id ${trimmedSlackUserId})`
  );

  return { user: slackUser, organization };
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
   * Checks whether the organization has a Slack bot token. Only the hash is stored, so this is all
   * there is to report.
   * @param submitter the user asking
   * @param organization the organization to check
   * @returns true if the organization has a bot token
   * @throws if the submitter isn't an admin
   */
  static async hasOrganizationApiToken(submitter: User, organization: Organization): Promise<boolean> {
    if (!(await userHasPermission(submitter.userId, organization.organizationId, isAdmin))) {
      throw new AccessDeniedAdminOnlyException('view the organization API token');
    }

    const { apiTokenHash } = await prisma.organization.findUniqueOrThrow({
      where: { organizationId: organization.organizationId },
      select: { apiTokenHash: true }
    });

    return apiTokenHash !== null;
  }

  /**
   * Generates a new Slack bot token for the organization, replacing (and so revoking) any it already
   * had. The token isn't tied to the admin who generated it, so it keeps working if they leave.
   * @param submitter the admin generating the token
   * @param organization the organization the token belongs to
   * @returns the raw token, which is only ever returned here
   * @throws if the submitter isn't an admin
   */
  static async generateOrganizationApiToken(submitter: User, organization: Organization): Promise<string> {
    if (!(await userHasPermission(submitter.userId, organization.organizationId, isAdmin))) {
      throw new AccessDeniedAdminOnlyException('generate an organization API token');
    }

    const { token, tokenHash } = generateApiToken(ORGANIZATION_API_TOKEN_PREFIX);

    await prisma.organization.update({
      where: { organizationId: organization.organizationId },
      data: { apiTokenHash: tokenHash }
    });

    return token;
  }

  /**
   * Resolves a raw API token to the user the request runs as and the organization it runs against.
   *
   * A personal (user) token always acts as its owner. The guest check runs on every call, so demoting
   * someone to guest revokes their token's access immediately rather than whenever it is next rotated.
   * Personal tokens may never send a Slack user id, so an admin's token can't impersonate anyone.
   *
   * An organization (bot) token has no user of its own: it must send a Slack user id, and the request
   * runs as the organization member linked to that id. This is the only way to act as another user.
   *
   * @param token the raw API token the client sent
   * @param organizationId the organization the client asked for, or undefined to infer it
   * @param slackUserId the Slack user id the bot is acting for, or undefined for a normal token request
   * @returns the user to act as and the organization to scope the request to
   * @throws if the token is missing, unknown, or revoked, the organization can't be resolved, the user
   * is a guest, a personal token sent a Slack user id, or an organization token didn't send a valid one
   */
  static async authenticateApiToken(
    token: string | undefined,
    organizationId: string | undefined,
    slackUserId?: string
  ): Promise<{ user: PrismaUser; organization: Organization }> {
    if (!token) throw new HttpException(401, 'Authentication Failed: No API token provided!');

    const tokenHash = hashApiToken(token);

    const apiToken = await prisma.user_API_Token.findUnique({ where: { tokenHash }, include: { user: true } });

    if (!apiToken) {
      const organization = await prisma.organization.findUnique({ where: { apiTokenHash: tokenHash } });
      if (!organization) throw new HttpException(401, 'Authentication Failed: Invalid API token!');

      return authenticateOrganizationApiToken(organization, organizationId, slackUserId);
    }

    if (apiToken.dateRevoked) throw new HttpException(401, 'Authentication Failed: Invalid API token!');

    // checked before anything else so a personal token can never fall through to acting as its owner
    if (slackUserId !== undefined) {
      throw new AccessDeniedException('only the organization API token can act on behalf of a Slack user');
    }

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
