import express from 'express';
import NotificationsController from '../controllers/notifications.controllers';

const notificationsRouter = express.Router();

notificationsRouter.post('/task-deadlines', NotificationsController.sendDailySlackNotifications);
notificationsRouter.get('/current-user', NotificationsController.getUserUnreadNotifications);
notificationsRouter.post('/:notificationId/remove', NotificationsController.removeUserNotification);

export default notificationsRouter;
