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
}
