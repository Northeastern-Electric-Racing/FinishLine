import { NextFunction, Request, Response } from 'express';
import ApiTokenService from '../services/api-tokens.services.js';
import { AccessDeniedException, HttpException } from './errors.utils.js';

/** The header an API client sends its token in. */
const API_KEY_HEADER = 'x-api-key';

/**
 * The header a shared bot (the Slack bot) sends with an admin token to act as a specific Slack user.
 * Node lowercases incoming header names, so this matches regardless of the casing the client used.
 */
const SLACKBOT_USER_ID_HEADER = 'x-slackbot-user-id';

/**
 * Authenticates a request using a per-user API token instead of the session cookie.
 *
 * Populates req.currentUser and req.organization exactly like getUserAndOrganization does, so
 * downstream services are indistinguishable from the ones the cookie authenticated API calls.
 *
 * If an x-slackbot-user-id header is present, the token must be an admin's and the request runs as the
 * organization member linked to that Slack id (see ApiTokenService.authenticateApiToken).
 */
export const requireApiToken = async (req: Request, _res: Response, next: NextFunction) => {
  try {
    const tokenHeader = req.headers[API_KEY_HEADER];
    const organizationHeader = req.headers.organizationid;
    const slackUserHeader = req.headers[SLACKBOT_USER_ID_HEADER];

    // a repeated header arrives as an array; treat that as ambiguous rather than picking one
    if (Array.isArray(slackUserHeader)) {
      throw new HttpException(401, 'Authentication Failed: Multiple Slack user ids provided!');
    }

    const { user, organization } = await ApiTokenService.authenticateApiToken(
      typeof tokenHeader === 'string' ? tokenHeader.trim() : undefined,
      typeof organizationHeader === 'string' ? organizationHeader : undefined,
      slackUserHeader
    );

    req.currentUser = user;
    req.organization = organization;

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
 * Hands the authenticated caller to the MCP handler.
 *
 * toNodeHandler forwards req.auth to the handler as its pass-through authInfo, and AuthInfo.extra
 * is the documented place for data of our own, so the MCP server factory reads the user,
 * organization, and current car back out of it. Must run after requireApiToken and getCurrentCar.
 */
export const attachAuthInfo = (req: Request, _res: Response, next: NextFunction) => {
  req.auth = {
    token: '',
    clientId: req.currentUser.userId,
    scopes: [],
    extra: { user: req.currentUser, organization: req.organization, currentCar: req.currentCar }
  };

  return next();
};
