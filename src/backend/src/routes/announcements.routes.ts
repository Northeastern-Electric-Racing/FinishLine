import express from 'express';
import AnnouncementController from '../controllers/announcements.controllers.js';

const announcementsRouter = express.Router();

announcementsRouter.get('/current-user', AnnouncementController.getUserUnreadAnnouncements);
announcementsRouter.post('/:announcementId/remove', AnnouncementController.removeUserAnnouncement);

export default announcementsRouter;
