// controllers/calendar.controllers.ts
import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import CalendarService from '../services/calendar.services';

export default class CalendarController {
  static async getAllCalendars(_: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const calendars = await CalendarService.getAllCalendars();
      res.status(200).json(calendars);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async getSingleCalendar(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { calendarId } = req.params;
      const calendar = await CalendarService.getSingleCalendar(calendarId);
      res.status(200).json(calendar);
    } catch (error: unknown) {
      next(error);
    }
  }

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

  static async editCalendar(req: Request, res: Response, next: NextFunction): Promise<void> {
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

      const { calendarId } = req.params;
      const { name, description, color } = req.body;
      const calendar = await CalendarService.editCalendar(calendarId, {
        name,
        description,
        colorHexCode: color
      });

      res.status(200).json(calendar);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async deleteCalendar(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.currentUser) {
        res.status(401).json({
          message: 'Unauthorized: Authentication required'
        });
        return;
      }

      const { calendarId } = req.params;
      await CalendarService.deleteCalendar(calendarId, req.currentUser.userId); // Removed parseInt - both should be strings
      res.status(200).json({ message: 'Calendar deleted successfully' });
    } catch (error: unknown) {
      next(error);
    }
  }
}
