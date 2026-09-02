import { NextFunction, Request, Response } from 'express';
import { Organization } from '@prisma/client';
import { notGuest, Role } from 'shared';
import prisma from '../prisma/prisma.js';
import { AccessDeniedException, DeletedException, HttpException, NotFoundException } from './errors.utils.js';
import { getOrganization } from './auth.utils.js';
import { hashApiToken } from './api-tokens.utils.js';
import { userHasPermission } from './users.utils.js';

/** The header an API client sends its token in. */
const API_KEY_HEADER = 'x-api-key';

/**
 * Resolves the organization for an API token request when no organizationId header was sent.
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
 * Authenticates a request using a per-user API token instead of the session cookie.
 *
 * Populates req.currentUser and req.organization exactly like getUserAndOrganization does, so
 * downstream services are indistinguishable from the ones the cookie authenticated API calls.
 */
export const requireApiToken = async (req: Request, _res: Response, next: NextFunction) => {
  try {
    const header = req.headers[API_KEY_HEADER];
    const token = typeof header === 'string' ? header.trim() : undefined;

    if (!token) throw new HttpException(401, 'Authentication Failed: No API token provided!');

    const apiToken = await prisma.user_API_Token.findUnique({
      where: { tokenHash: hashApiToken(token) },
      include: { user: true }
    });

    if (!apiToken || apiToken.dateRevoked) throw new HttpException(401, 'Authentication Failed: Invalid API token!');

    const { user } = apiToken;

    // an explicit organizationId header wins, and getOrganization already verifies membership
    const organization = req.headers.organizationid
      ? await getOrganization(req.headers, user)
      : await getSoleOrganization(user.userId);

    // re-checked on every request so demoting someone to guest revokes their token's access immediately
    const hasPermission = await userHasPermission(user.userId, organization.organizationId, notGuest);
    if (!hasPermission) throw new AccessDeniedException('guests cannot use the API');

    req.currentUser = user;
    req.organization = organization;

    // fire and forget: last used is for auditing and must never add latency or fail the request
    prisma.user_API_Token
      .update({ where: { apiTokenId: apiToken.apiTokenId }, data: { lastUsedAt: new Date() } })
      .catch(() => {});

    return next();
  } catch (error) {
    return next(error);
  }
};

/**
 * Rejects any write attempt. The API token surface is intentionally read only for now, so this is
 * enforced structurally rather than left to each route to remember.
 */
export const readOnlyGuard = (req: Request, _res: Response, next: NextFunction) => {
  if (req.method !== 'GET' && req.method !== 'OPTIONS') {
    return next(new AccessDeniedException('the API is currently read only'));
  }

  return next();
};

/**
 * Gets the role type the given user holds in the given organization.
 * @param userId the id of the user
 * @param organizationId the id of the organization
 * @returns the user's role type, or undefined if they have no role there
 */
export const getRoleInOrganization = async (userId: string, organizationId: string): Promise<Role | undefined> => {
  const role = await prisma.role.findUnique({ where: { uniqueRole: { userId, organizationId } } });

  return role?.roleType as Role | undefined;
};

/**
 * Hands the authenticated caller to the MCP handler.
 *
 * toNodeHandler forwards req.auth to the handler as its pass-through authInfo, and AuthInfo.extra
 * is the documented place for data of our own, so the MCP server factory reads the user and
 * organization back out of it. Must run after requireApiToken.
 */
export const attachAuthInfo = (req: Request, _res: Response, next: NextFunction) => {
  req.auth = {
    token: '',
    clientId: req.currentUser.userId,
    scopes: [],
    extra: { user: req.currentUser, organization: req.organization }
  };

  return next();
};
