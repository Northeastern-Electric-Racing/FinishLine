import express from 'express';
import NotificationsController from '../controllers/notifications.controllers';
import { nonEmptyString } from '../utils/validation.utils';
import { body } from 'express-validator';

const notificationsRouter = express.Router();

notificationsRouter.post('/task-deadlines', NotificationsController.sendDailySlackNotifications);
notificationsRouter.get('/current-user', NotificationsController.getUserUnreadNotifications);
notificationsRouter.post(
  '/curent-user/remove',
  nonEmptyString(body('notificationId')),
  NotificationsController.removeUserNotification
);

export default notificationsRouter;
