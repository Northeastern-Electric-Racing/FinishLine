import express from 'express';
import NotificationsController from '../controllers/notifications.controllers';

const notificationsRouter = express.Router();

notificationsRouter.post('/task-deadlines', NotificationsController.sendTaskDeadlineSlackNotifications);

export default notificationsRouter;
