import express from 'express';
import { query } from 'express-validator';
import McpController from '../controllers/mcp.controllers.js';
import { readOnlyGuard, requireApiToken } from '../utils/mcp-auth.utils.js';
import { isDate, validateInputs } from '../utils/validation.utils.js';

const mcpRouter = express.Router();

// this router authenticates with per-user API tokens rather than the session cookie, and is read only
mcpRouter.use(requireApiToken);
mcpRouter.use(readOnlyGuard);

mcpRouter.get('/health', McpController.healthCheck);
mcpRouter.get('/cars/:carNumber/projects', McpController.getProjectsByCarNumber);
mcpRouter.get('/projects/:wbsNum', McpController.getProject);
mcpRouter.get('/projects/:wbsNum/work-packages', McpController.getWorkPackages);
mcpRouter.get('/projects/:wbsNum/tasks', McpController.getTasks);
mcpRouter.get('/events', isDate(query('startDate')), isDate(query('endDate')), validateInputs, McpController.getEvents);

export default mcpRouter;
