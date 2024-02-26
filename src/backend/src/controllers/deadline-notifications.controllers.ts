import { NextFunction, Request, Response } from 'express';
import DeadlineNotificationsService from '../services/deadline-notifications.services';

export default class DeadlineNotificationsController {
  static async sendTaskDeadlineSlackNotifications(_req: Request, res: Response, next: NextFunction) {
    try {
      const tomorrow = new Date(new Date().setHours(24, 0, 0, 0));
      await DeadlineNotificationsService.sendTaskDeadlineSlackNotifications(tomorrow);

      res.status(200).json({ message: 'Successfully sent task deadline notifications!' });
    } catch (error: unknown) {
      next(error);
    }
  }
}
