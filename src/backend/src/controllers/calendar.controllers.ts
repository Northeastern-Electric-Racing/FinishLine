import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import CalendarService from '../services/calendar.services';

export default class CalendarController {
  static async createCalendar(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }
      
      if (!req.currentUser) {
        res.status(401).json({
          message: 'Unauthorized: Authentication required'
        });
        return;
      }
      
      if (!req.currentUser.additionalPermissions || !req.currentUser.additionalPermissions.includes('admin')) {
        res.status(403).json({
          message: 'Forbidden: Admin access required to create calendars'
        });
        return;
      }
      
      const { name, description, color } = req.body;
      const calendar = await CalendarService.createCalendar({
        name,
        description,
        colorHexCode: color,
        userCreatedId: req.currentUser.userId
      });
      
      res.status(201).json(calendar);
    } catch (error: unknown) {
      next(error);
    }
  }
}