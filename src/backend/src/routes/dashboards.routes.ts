import express from 'express';
import { body } from 'express-validator';
import { nonEmptyString, validateInputs } from '../utils/validation.utils.js';
import DashboardsController from '../controllers/dashboards.controllers.js';

const dashboardsRouter = express.Router();

// Create dashboard
dashboardsRouter.post(
  '/create',
  nonEmptyString(body('name')),
  nonEmptyString(body('link')),
  validateInputs,
  DashboardsController.createDashboard
);

// Get the current user's dashboards
dashboardsRouter.get('/', DashboardsController.getUserDashboards);

// Edit dashboard (save current filters into it)
dashboardsRouter.post(
  '/:dashboardId/edit',
  nonEmptyString(body('link')),
  validateInputs,
  DashboardsController.editDashboard
);

// Delete dashboard
dashboardsRouter.post('/:dashboardId/delete', DashboardsController.deleteDashboard);

export default dashboardsRouter;
