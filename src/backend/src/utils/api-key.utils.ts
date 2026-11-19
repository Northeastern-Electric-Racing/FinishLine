import express, { NextFunction, Request, RequestHandler, Response, Router } from 'express';
import { AccessDeniedException } from './errors.utils.js';
import { requireJwtDev, requireJwtProd } from './auth.utils.js';
import { API_KEY_HEADER, requireApiToken } from './mcp-auth.utils.js';

/**
 * API key access, opted into per endpoint.
 *
 * Any request can authenticate with a per-user API token instead of the session cookie, but a token
 * only gets through to endpoints whose controller method carries @ApiKey. Every other endpoint
 * answers a token with a 403. Opting an endpoint in or out is only ever a matter of adding or removing
 * the decorator, and the default for a new endpoint is out.
 *
 * Three pieces make that work:
 *   1. authenticate resolves the caller from either a token or the cookie, and flags token requests.
 *   2. @ApiKey records which controller methods have opted in.
 *   3. createRouter puts a guard in front of every route that refuses flagged requests unless the
 *      route's handler opted in. Every router must be made with it, which a test enforces.
 */

/** Controller methods that accept API key requests. */
const apiKeyEnabled = new WeakSet<Function>();

/**
 * Opts a controller method into API key access. Once present, a request authenticated with an API
 * token can reach every route that ends in this method, reads and writes alike. The services still
 * run their usual permission checks against the token's user.
 *
 * @example
 *   @ApiKey
 *   static async getSingleProject(req: Request, res: Response, next: NextFunction) { ... }
 */
export function ApiKey(method: Function, _context: ClassMethodDecoratorContext): void {
  apiKeyEnabled.add(method);
}

/**
 * Authenticates a request with an API token when it sends one, and with the session cookie otherwise.
 * Replaces the cookie middleware in index.ts. A token request is resolved to its user and organization
 * here, so getUserAndOrganization skips it.
 *
 * @param isProd whether to use the production cookie check or the dev login header
 */
export const authenticate = (isProd: boolean): RequestHandler => {
  const requireJwt = isProd ? requireJwtProd : requireJwtDev;

  return (req: Request, res: Response, next: NextFunction) =>
    req.headers[API_KEY_HEADER] !== undefined ? requireApiToken(req, res, next) : requireJwt(req, res, next);
};

/** The route registering methods the routers use. */
const ROUTE_METHODS = ['get', 'post', 'put', 'patch', 'delete', 'all'] as const;

/**
 * Creates an express router whose routes refuse API key requests unless their handler opted in with
 * @ApiKey. Use this in place of express.Router() in every routes file.
 *
 * The decision is made once, when the route is registered, by looking at the route's last handler,
 * which is the controller method. A route ending in an inline function rather than a controller
 * method cannot be decorated, so it stays closed to API keys. The guard runs before the route's
 * validators, so a refused request is refused before anything else looks at it.
 *
 * Only routes are guarded. router.use is left alone because it mounts middleware and nested routers,
 * which must keep running; a nested router is guarded by being made with createRouter itself.
 */
export const createRouter = (): Router => {
  const router = express.Router();

  for (const method of ROUTE_METHODS) {
    const register = router[method].bind(router) as (...args: unknown[]) => Router;

    router[method] = ((path: unknown, ...handlers: unknown[]) => {
      const lastHandler = handlers.flat(Infinity).at(-1);
      const enabled = typeof lastHandler === 'function' && apiKeyEnabled.has(lastHandler);

      const apiKeyGuard: RequestHandler = (req, _res, next) =>
        req.authenticatedWithApiKey && !enabled
          ? next(new AccessDeniedException('this endpoint is not available with an API key'))
          : next();

      return register(path, apiKeyGuard, ...handlers);
    }) as typeof router.get;
  }

  return router;
};
