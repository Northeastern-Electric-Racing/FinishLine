import CalendarController from '../controllers/calendar.controllers.js';
import { createRouter } from '../utils/api-key.utils.js';

const icsRouter = createRouter();

icsRouter.get('/:token', CalendarController.getIcsFeed);

export default icsRouter;
