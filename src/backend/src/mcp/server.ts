import { McpServer } from '@modelcontextprotocol/server';
import { AgentContext, ToolRegistrar } from './tools.utils.js';
import { registerProjectTools } from './projects.tools.js';
import { registerTaskTools } from './tasks.tools.js';
import { registerEventTools } from './events.tools.js';

/** Every domain's tools. A new *.tools.ts file only becomes reachable once it is added here. */
const registrars: ToolRegistrar[] = [registerProjectTools, registerTaskTools, registerEventTools];

/**
 * Builds a FinishLine MCP server for one authenticated caller. Called once per request, so nothing
 * here is shared between callers.
 * @param context the authenticated user and their organization
 */
export const buildMcpServer = (context: AgentContext): McpServer => {
  const server = new McpServer({ name: 'finishline', version: '1.0.0' });

  for (const register of registrars) {
    register(server, context);
  }

  return server;
};
