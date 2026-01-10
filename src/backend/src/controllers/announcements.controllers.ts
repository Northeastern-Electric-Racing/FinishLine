import { NextFunction, Request, Response } from 'express';
import { getStringParam } from '../utils/utils';
import AnnouncementService from '../services/announcement.services';

export default class AnnouncementController {
  static async getUserUnreadAnnouncements(req: Request, res: Response, next: NextFunction) {
    try {
      const { organization, currentUser } = req;

      const unreadAnnouncements = await AnnouncementService.getUserUnreadAnnouncements(
        currentUser.userId,
        organization.organizationId
      );
      res.status(200).json(unreadAnnouncements);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async removeUserAnnouncement(req: Request, res: Response, next: NextFunction) {
    try {
      const announcementId = getStringParam(req.params.announcementId);
      const { organization, currentUser } = req;

      const unreadAnnouncements = await AnnouncementService.removeUserAnnouncement(
        currentUser.userId,
        announcementId,
        organization.organizationId
      );
      res.status(200).json(unreadAnnouncements);
    } catch (error: unknown) {
      next(error);
    }
  }
}
