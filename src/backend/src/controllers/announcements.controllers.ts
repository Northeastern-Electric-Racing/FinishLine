import { NextFunction, Request, Response } from 'express';
import AnnouncementService from '../services/announcement.services.js';

export default class AnnouncementController {
  static async getUserUnreadAnnouncements(req: Request, res: Response, next: NextFunction) {
    try {
      const { organization, currentUser } = req;
      const cursor = req.query.cursor as string | undefined;

      const page = await AnnouncementService.getUserUnreadAnnouncements(
        currentUser.userId,
        organization.organizationId,
        cursor
      );
      res.status(200).json(page);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async removeUserAnnouncement(req: Request, res: Response, next: NextFunction) {
    try {
      const { announcementId } = req.params as Record<string, string>;
      const { currentUser } = req;

      await AnnouncementService.removeUserAnnouncement(currentUser.userId, announcementId);
      res.sendStatus(204);
    } catch (error: unknown) {
      next(error);
    }
  }
}
