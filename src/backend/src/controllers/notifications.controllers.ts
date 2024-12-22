import { NextFunction, Request, Response } from 'express';
import NotificationsService from '../services/notifications.services';

export default class NotificationsController {
  static async sendDailySlackNotifications(_req: Request, res: Response, next: NextFunction) {
    try {
      await NotificationsService.sendDailySlackNotifications();

      res.status(200).json({ message: 'Successfully sent task deadline notifications!' });
    } catch (error: unknown) {
      next(error);
    }
  }

  static async getUserUnreadNotifications(req: Request, res: Response, next: NextFunction) {
    try {
      const { organization, currentUser } = req;

      const unreadNotifications = await NotificationsService.getUserUnreadNotifications(
        currentUser.userId,
        organization.organizationId
      );
      res.status(200).json(unreadNotifications);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async removeUserNotification(req: Request, res: Response, next: NextFunction) {
    try {
      const { notificationId } = req.body;
      const { organization, currentUser } = req;

      const unreadNotifications = await NotificationsService.removeUserNotification(
        currentUser.userId,
        notificationId,
        organization.organizationId
      );
      res.status(200).json(unreadNotifications);
    } catch (error: unknown) {
      next(error);
    }
  }
}
