import express from 'express';
import { body } from 'express-validator';
import { BayDashboardWidgetSize, BayDashboardWidgetType } from 'shared';
import BayDashboardAdminController from '../controllers/bay-dashboard-admin.controllers.js';
import { intMinZero, validateInputs } from '../utils/validation.utils.js';

/**
 * Authenticated bay dashboard routes, used by the Admin Tools to read and edit what the TV displays.
 * Separated from bay-dashboard.routes because these endpoints are authenticated, while the public TV endpoints are not.
 */
const bayDashboardAdminRouter = express.Router();

bayDashboardAdminRouter.get('/admin', BayDashboardAdminController.getCurrentBayDashboardConfig);

// every widget type in the schema is accepted
const SELECTABLE_WIDGET_TYPES = Object.values(BayDashboardWidgetType);

bayDashboardAdminRouter.post(
  '/admin/save',
  body('slots').isArray(),
  intMinZero(body('slots.*.position')),
  body('slots.*.size').isIn(Object.values(BayDashboardWidgetSize)),
  body('slots.*.rotationSeconds').optional().isInt({ min: 1 }).not().isString(),
  // a slot can be empty, but a slot that does carry a widget must name a type the TV can render
  body('slots.*.widget')
    .optional()
    .isObject()
    .bail()
    .custom((widget: { type?: string }) => {
      if (!widget.type || !SELECTABLE_WIDGET_TYPES.includes(widget.type as BayDashboardWidgetType)) {
        throw new Error(`Widget type must be one of: ${SELECTABLE_WIDGET_TYPES.join(', ')}`);
      }
      return true;
    }),
  body('slots.*.widget.text').optional({ nullable: true }).isString(),
  validateInputs,
  BayDashboardAdminController.saveBayDashboardConfig
);

export default bayDashboardAdminRouter;
