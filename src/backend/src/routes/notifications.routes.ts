import express from 'express';
import NotificationsController from '../controllers/notifications.controllers.js';

const notificationsRouter = express.Router();

notificationsRouter.post('/task-deadlines', NotificationsController.sendDailySlackNotifications);
notificationsRouter.post('/attendance', NotificationsController.updateScheduledAttendances);

export default notificationsRouter;
