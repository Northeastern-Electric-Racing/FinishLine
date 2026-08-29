import express from 'express';
import { query } from 'express-validator';
import AgentController from '../controllers/agent.controllers.js';
import { readOnlyGuard, requireApiToken } from '../utils/mcp-auth.utils.js';
import { isDate, validateInputs } from '../utils/validation.utils.js';

const agentRouter = express.Router();

// this router authenticates with per-user API tokens rather than the session cookie, and is read only
agentRouter.use(requireApiToken);
agentRouter.use(readOnlyGuard);

agentRouter.get('/health', AgentController.healthCheck);
agentRouter.get('/projects', AgentController.getProjects);
agentRouter.get('/projects/:wbsNum', AgentController.getProject);
agentRouter.get('/projects/:wbsNum/work-packages', AgentController.getWorkPackages);
agentRouter.get('/projects/:wbsNum/tasks', AgentController.getTasks);
agentRouter.get('/events', isDate(query('startDate')), isDate(query('endDate')), validateInputs, AgentController.getEvents);

export default agentRouter;
