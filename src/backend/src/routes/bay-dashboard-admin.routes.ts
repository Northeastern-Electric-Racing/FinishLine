import express from 'express';
import { body } from 'express-validator';
import { BayDashboardWidgetSize } from 'shared';
import BayDashboardAdminController from '../controllers/bay-dashboard-admin.controllers.js';
import { intMinZero, validateInputs } from '../utils/validation.utils.js';

/**
 * Authenticated bay dashboard routes, used by the Admin Tools to read and edit what the TV displays.
 * Separated from bay-dashboard.routes because these endpoints are authenticated, while the public TV endpoints are not.
 */
const bayDashboardAdminRouter = express.Router();

bayDashboardAdminRouter.get('/admin', BayDashboardAdminController.getCurrentBayDashboardConfig);

bayDashboardAdminRouter.post(
  '/admin/save',
  body('slots').isArray(),
  intMinZero(body('slots.*.position')),
  body('slots.*.size').isIn(Object.values(BayDashboardWidgetSize)),
  body('slots.*.widget').optional().isObject(),
  body('slots.*.widget.text').optional({ nullable: true }).isString(),
  validateInputs,
  BayDashboardAdminController.saveBayDashboardConfig
);

export default bayDashboardAdminRouter;
