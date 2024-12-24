import { NextFunction, Request, Response } from 'express';
import AnnouncementService from '../services/announcement.service';

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
}
