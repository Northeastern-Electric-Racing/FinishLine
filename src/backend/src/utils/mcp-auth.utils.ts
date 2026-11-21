import { NextFunction, Request, Response } from 'express';
import ApiTokenService from '../services/api-tokens.services.js';
import { AccessDeniedException } from './errors.utils.js';

/** The header an API client sends its token in. */
const API_KEY_HEADER = 'x-api-key';

/**
 * Authenticates a request using a per-user API token instead of the session cookie.
 *
 * Populates req.currentUser and req.organization exactly like getUserAndOrganization does, so
 * downstream services are indistinguishable from the ones the cookie authenticated API calls.
 */
export const requireApiToken = async (req: Request, _res: Response, next: NextFunction) => {
  try {
    const tokenHeader = req.headers[API_KEY_HEADER];
    const organizationHeader = req.headers.organizationid;

    const { user, organization } = await ApiTokenService.authenticateApiToken(
      typeof tokenHeader === 'string' ? tokenHeader.trim() : undefined,
      typeof organizationHeader === 'string' ? organizationHeader : undefined
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
