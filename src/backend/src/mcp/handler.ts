import { createMcpHandler } from '@modelcontextprotocol/server';
import { toNodeHandler } from '@modelcontextprotocol/node';
import { AgentContext, buildMcpServer } from './tools.js';

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
const mcpHandler = createMcpHandler(({ authInfo }) => buildMcpServer(authInfo?.extra as unknown as AgentContext), {
  responseMode: 'json'
});

export const mcpNodeHandler = toNodeHandler(mcpHandler);
