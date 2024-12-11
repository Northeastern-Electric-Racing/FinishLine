import express from 'express';
import NotificationsController from '../controllers/notifications.controllers';
import { nonEmptyString, validateInputs } from '../utils/validation.utils';
import { body } from 'express-validator';

const notificationsRouter = express.Router();

notificationsRouter.post('/task-deadlines', NotificationsController.sendDailySlackNotifications);
notificationsRouter.post(
  '/send/users',
  nonEmptyString(body('text')),
  nonEmptyString(body('iconName')),
  body('userIds').isArray(),
  nonEmptyString(body('userIds.*')),
  validateInputs,
  NotificationsController.sendNotificationToUsers
);

export default notificationsRouter;
