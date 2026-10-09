import express from 'express';
import NotificationsController from '../controllers/notifications.controllers.js';

const notificationsRouter = express.Router();

notificationsRouter.post('/daily', NotificationsController.sendDailySlackNotifications);
notificationsRouter.post('/hourly', NotificationsController.sendHourlySlackNotifications);

export default notificationsRouter;
