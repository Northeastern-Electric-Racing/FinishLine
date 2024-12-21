import express from 'express';
import AnnouncementController from '../controllers/announcements.controllers';

const announcementsRouter = express.Router();

announcementsRouter.get('/announcements/current-user', AnnouncementController.getUserUnreadAnnouncements);
