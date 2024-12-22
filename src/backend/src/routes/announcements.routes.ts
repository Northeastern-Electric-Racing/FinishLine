import express from 'express';
import AnnouncementController from '../controllers/announcements.controllers';
import { nonEmptyString } from '../utils/validation.utils';
import { body } from 'express-validator';

const announcementsRouter = express.Router();

announcementsRouter.get('/current-user', AnnouncementController.getUserUnreadAnnouncements);
announcementsRouter.post(
  '/current-user/remove',
  nonEmptyString(body('announcementId')),
  AnnouncementController.removeUserAnnouncement
);

export default announcementsRouter;
