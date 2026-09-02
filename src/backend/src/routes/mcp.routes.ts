import express from 'express';
import McpController from '../controllers/mcp.controllers.js';
import { readOnlyGuard, requireApiToken } from '../utils/mcp-auth.utils.js';

const mcpRouter = express.Router();

// this router authenticates with per-user API tokens rather than the session cookie, and is read only
mcpRouter.use(requireApiToken);
mcpRouter.use(readOnlyGuard);

mcpRouter.get('/health', McpController.healthCheck);

export default mcpRouter;
