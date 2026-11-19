import { query } from 'express-validator';
import AnnouncementController from '../controllers/announcements.controllers.js';
import { nonEmptyString, validateInputs } from '../utils/validation.utils.js';
import { createRouter } from '../utils/api-key.utils.js';

const announcementsRouter = createRouter();

announcementsRouter.get(
  '/current-user',
  nonEmptyString(query('cursor').optional()),
  validateInputs,
  AnnouncementController.getUserUnreadAnnouncements
);
announcementsRouter.post('/:announcementId/remove', AnnouncementController.removeUserAnnouncement);

export default announcementsRouter;
