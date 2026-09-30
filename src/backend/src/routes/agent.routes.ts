import express from 'express';
import { body, query } from 'express-validator';
import AgentController from '../controllers/agent.controllers.js';
import { readOnlyGuard, requireApiToken } from '../utils/mcp-auth.utils.js';
import { isDate, nonEmptyString, validateInputs } from '../utils/validation.utils.js';

const agentRouter = express.Router();

// this router authenticates with per-user API tokens rather than the session cookie, and is read only
// apart from the admin only routes registered above readOnlyGuard
agentRouter.use(requireApiToken);

// the admin check lives in the service, and this deliberately has no MCP tool so it is only reachable through the API
agentRouter.post(
  '/slack/messages',
  // public (C) or private (G) channel ids only, so this cannot be used to DM users
  body('channelId')
    .isString()
    .matches(/^[CG][A-Z0-9]{8,}$/)
    .withMessage('channelId must be a slack channel id, e.g. C0123456789'),
  nonEmptyString(body('message').trim()).isLength({ max: 4000 }),
  validateInputs,
  AgentController.sendSlackMessage
);

agentRouter.use(readOnlyGuard);

agentRouter.get('/health', AgentController.healthCheck);
agentRouter.get('/projects', query('offset').optional().isInt({ min: 0 }), validateInputs, AgentController.getProjects);
agentRouter.get('/projects/:wbsNum', AgentController.getProject);
agentRouter.get('/projects/:wbsNum/work-packages', AgentController.getWorkPackages);
agentRouter.get(
  '/projects/:wbsNum/tasks',
  query('offset').optional().isInt({ min: 0 }),
  validateInputs,
  AgentController.getTasks
);
agentRouter.get('/events', isDate(query('startDate')), isDate(query('endDate')), validateInputs, AgentController.getEvents);

export default agentRouter;
