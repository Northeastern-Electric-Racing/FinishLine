import express from 'express';
import BayDashboardAdminController from '../controllers/bay-dashboard-admin.controllers.js';

/**
 * Authenticated bay dashboard routes, used by the Admin Tools to read and edit what the TV displays.
 * Separated from bay-dashboard.routes because these endpoints are authenticated, while the public TV endpoints are not.
 */
const bayDashboardAdminRouter = express.Router();

bayDashboardAdminRouter.get('/admin', BayDashboardAdminController.getCurrentBayDashboardConfig);

export default bayDashboardAdminRouter;
