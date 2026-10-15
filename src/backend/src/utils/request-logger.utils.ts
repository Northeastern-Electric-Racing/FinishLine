import { Request, Response, NextFunction } from 'express';
import { describeRoute } from './request-context.utils.js';

// paths that are hit constantly by infrastructure (ALB health checks) and would drown out real traffic
const IGNORED_PATHS = new Set(['/health']);

/**
 * Middleware that logs one line of JSON per request once it completes, with its latency,
 * so CloudWatch Logs Insights can rank endpoints by latency, volume, and response size.
 */
export const logRequests = (req: Request, res: Response, next: NextFunction) => {
  if (IGNORED_PATHS.has(req.path)) return next();

  const start = performance.now();
  let logged = false;

  const log = (aborted: boolean) => {
    if (logged) return;
    logged = true;

    const contentLength = res.getHeader('content-length');
    console.log(
      JSON.stringify({
        msg: 'request',
        method: req.method,
        route: describeRoute(req),
        // no status if the client left before a response was sent (statusCode would just be Express's default 200)
        status: res.headersSent ? res.statusCode : undefined,
        durationMs: Math.round(performance.now() - start),
        bytes: contentLength === undefined ? undefined : Number(contentLength),
        aborted,
        userId: req.currentUser?.userId,
        organizationId: req.organization?.organizationId
      })
    );
  };

  // finish: the response was fully handed off to the client
  res.on('finish', () => log(false));
  // close without finish: the client disconnected before the response was sent (e.g. reload or navigation)
  res.on('close', () => log(!res.writableFinished));

  next();
};
