import { NextFunction, Request, Response } from 'express';
import NotificationsService from '../services/notifications.services';

export default class NotificationsController {
  static async sendTaskDeadlineSlackNotifications(_req: Request, res: Response, next: NextFunction) {
    try {
      await NotificationsService.sendTaskDeadlineSlackNotifications();

      res.status(200).json({ message: 'Successfully sent task deadline notifications!' });
    } catch (error: unknown) {
      next(error);
    }
  }
}
