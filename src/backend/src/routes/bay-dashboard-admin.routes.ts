import { Bay_Dashboard_Widget_Size, Bay_Dashboard_Widget_Type } from '@prisma/client';
import express from 'express';
import { body } from 'express-validator';
import BayDashboardAdminController from '../controllers/bay-dashboard-admin.controllers.js';
import { intMinZero, validateInputs } from '../utils/validation.utils.js';

/**
 * Authenticated bay dashboard routes, used by the Admin Tools to read and edit what the TV displays.
 * Separated from bay-dashboard.routes because these endpoints are authenticated, while the public TV endpoints are not.
 */
const bayDashboardAdminRouter = express.Router();

// every widget type in the schema is accepted for now
const SELECTABLE_WIDGET_TYPES = Object.values(Bay_Dashboard_Widget_Type);

bayDashboardAdminRouter.post(
  '/admin/save',
  body('slots').isArray(),
  intMinZero(body('slots.*.position')),
  body('slots.*.size').isIn(Object.values(Bay_Dashboard_Widget_Size)),
  intMinZero(body('slots.*.rotationSeconds').optional()),
  // a slot can be empty, but a slot that does carry a widget must name a type the TV can render
  body('slots.*.widget')
    .optional()
    .isObject()
    .bail()
    .custom((widget: { type?: string }) => {
      if (!widget.type || !SELECTABLE_WIDGET_TYPES.includes(widget.type as Bay_Dashboard_Widget_Type)) {
        throw new Error(`Widget type must be one of: ${SELECTABLE_WIDGET_TYPES.join(', ')}`);
      }
      return true;
    }),
  body('slots.*.widget.text').optional().isString(),
  validateInputs,
  BayDashboardAdminController.saveBayDashboardConfig
);

export default bayDashboardAdminRouter;
