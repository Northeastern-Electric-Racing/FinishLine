import { NextFunction, Request, Response } from 'express';
import NotificationsService from '../services/notifications.services.js';

export default class NotificationsController {
  static async sendDailySlackNotifications(_req: Request, res: Response, next: NextFunction) {
    try {
      await NotificationsService.sendDailySlackNotifications();

      res.status(200).json({ message: 'Successfully sent daily notifications!' });
    } catch (error: unknown) {
      next(error);
    }
  }
  static async sendHourlySlackNotifications(_req: Request, res: Response, next: NextFunction) {
    try {
      await NotificationsService.sendHourlySlackNotifications();

      res.status(200).json({ message: 'Successfully sent hourly notifications!' });
    } catch (error: unknown) {
      next(error);
    }
  }
}
