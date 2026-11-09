import { NextFunction, Request, Response } from 'express';
import NotificationsService from '../services/notifications.services.js';
import AttendanceService from '../services/attendance.services.js';

export default class NotificationsController {
  static async sendDailySlackNotifications(_req: Request, res: Response, next: NextFunction) {
    try {
      await NotificationsService.sendDailySlackNotifications();

      res.status(200).json({ message: 'Successfully sent task deadline notifications!' });
    } catch (error: unknown) {
      next(error);
    }
  }

  static async updateScheduledAttendances(_req: Request, res: Response, next: NextFunction) {
    try {
      await AttendanceService.updateScheduledAttendances();

      res.status(200).json({ message: 'Successfully updated scheduled attendances!' });
    } catch (error: unknown) {
      next(error);
    }
  }
}
