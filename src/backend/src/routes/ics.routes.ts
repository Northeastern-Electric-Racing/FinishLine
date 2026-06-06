import express from 'express';
import CalendarController from '../controllers/calendar.controllers.js';

const icsRouter = express.Router();

icsRouter.get('/:token', CalendarController.getIcsFeed);

export default icsRouter;
