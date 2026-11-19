import NotificationsController from '../controllers/notifications.controllers.js';
import { createRouter } from '../utils/api-key.utils.js';

const notificationsRouter = createRouter();

notificationsRouter.post('/task-deadlines', NotificationsController.sendDailySlackNotifications);
notificationsRouter.post('/attendance', NotificationsController.updateScheduledAttendances);

export default notificationsRouter;
