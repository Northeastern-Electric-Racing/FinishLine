import express from 'express';
import BayDashboardController from '../controllers/bay-dashboard.controllers.js';

/**
 * Public bay dashboard routes, read by the TV in the bay with nobody logged in.
 * Mounted above the JWT middleware in index.ts, unlike bay-dashboard-admin.routes.
 */
const bayDashboardRouter = express.Router();

bayDashboardRouter.get('/:slug/events', BayDashboardController.streamBayDashboardEvents);
bayDashboardRouter.get('/:slug/config', BayDashboardController.getBayDashboardConfig);
bayDashboardRouter.get('/:slug/countdowns', BayDashboardController.getBayDashboardCountdowns);

export default bayDashboardRouter;
