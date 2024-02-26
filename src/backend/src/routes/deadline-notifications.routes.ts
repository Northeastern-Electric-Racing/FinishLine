import express from 'express';
import DeadlineNotificationsController from '../controllers/deadline-notifications.controllers';

const deadlineNotificationsRouter = express.Router();

deadlineNotificationsRouter.get(
  '/sendTaskDeadlineSlackNotifications',
  DeadlineNotificationsController.sendTaskDeadlineSlackNotifications
);

export default deadlineNotificationsRouter;
