import { AsyncLocalStorage } from 'node:async_hooks';
import { Request, Response, NextFunction } from 'express';

const requestContext = new AsyncLocalStorage<Request>();

/**
 * Middleware that makes the current request available to code that doesn't receive it directly
 * (e.g. the Prisma query logger), for the rest of that request's async work.
 */
export const withRequestContext = (req: Request, _res: Response, next: NextFunction) => {
  requestContext.run(req, next);
};

const UUID_PATTERN = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi;

/**
 * Describes a request using its matched route pattern (e.g. "GET /teams/:teamId") rather than the raw URL,
 * so log lines group by endpoint. When no route matched (e.g. 404s, or requests rejected by auth before routing),
 * falls back to the raw path with ids replaced by ":id" so those still group together.
 * @param req the request to describe
 * @returns the method and route pattern
 */
export const describeRoute = (req: Request): string => {
  const path = req.route?.path
    ? `${req.baseUrl}${req.route.path}`
    : req.originalUrl.split('?')[0].replace(UUID_PATTERN, ':id');
  // a router's root route ("/") would otherwise show up as e.g. "/users/"
  const trimmedPath = path.length > 1 && path.endsWith('/') ? path.slice(0, -1) : path;
  return `${req.method} ${trimmedPath}`;
};

/**
 * Describes the request currently being handled (see describeRoute)
 * @returns the request description, or undefined when called outside of a request (e.g. startup, background jobs)
 */
export const getCurrentRequestRoute = (): string | undefined => {
  const req = requestContext.getStore();
  return req ? describeRoute(req) : undefined;
};
