import express from 'express';
import BayDashboardController from '../controllers/bay-dashboard.controllers.js';

const bayDashboardRouter = express.Router();

bayDashboardRouter.get('/organization', BayDashboardController.getBayDashboardOrganization);

export default bayDashboardRouter;
