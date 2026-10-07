import { createMcpHandler } from '@modelcontextprotocol/server';
import { toNodeHandler } from '@modelcontextprotocol/node';
import { HttpException } from '../utils/errors.utils.js';
import { AgentContext, buildMcpServer } from './tools.js';

/**
 * Reads the authenticated caller back out of the pass-through authInfo attachAuthInfo set.
 *
 * Nothing should reach this handler without going through requireApiToken and attachAuthInfo first,
 * so a miss is a wiring mistake rather than a bad token. Failing loudly here beats destructuring
 * undefined inside the server factory and surfacing as an unexplained protocol error.
 *
 * @param authInfo the pass-through auth the transport forwarded
 * @returns the authenticated user and organization
 * @throws if the caller was never resolved
 */
const getAgentContext = (authInfo: unknown): AgentContext => {
  const context = (authInfo as { extra?: unknown } | undefined)?.extra as AgentContext | undefined;

  if (!context?.user || !context?.organization) {
    throw new HttpException(401, 'Authentication Failed: the request never resolved to a user and organization');
  }

  return context;
};

/**
 * The MCP handler for FinishLine.
 *
 * The factory runs once per request, so each request gets a fresh server built for its own caller
 * and nothing is retained between requests. That is what makes the endpoint stateless and safe to
 * run behind a load balancer with more than one instance.
 *
 * responseMode 'json' pins plain JSON responses instead of upgrading to server sent events; we emit
 * no progress or logging notifications, and it keeps the endpoint easy to test with curl.
 */
const mcpHandler = createMcpHandler(({ authInfo }) => buildMcpServer(getAgentContext(authInfo)), {
  responseMode: 'json'
});

export const mcpNodeHandler = toNodeHandler(mcpHandler);
