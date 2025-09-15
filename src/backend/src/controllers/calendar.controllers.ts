import { NextFunction, Request, Response } from 'express';
import CalendarService from '../services/calendar.services';

export default class CalendarController {
  static async createEventType(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        name,
        calendarId,
        initialDateScheduled,
        recurring,
        allDay,
        members,
        location,
        zoomLink,
        availabilities,
        shop,
        machinery,
        workPackage,
        documents,
        description
      } = req.body;

      const eventType = await CalendarService.createEventType(
        req.currentUser,
        name,
        calendarId,
        req.organization,
        initialDateScheduled,
        recurring,
        allDay,
        members,
        location,
        zoomLink,
        availabilities,
        shop,
        machinery,
        workPackage,
        documents,
        description
      );
      res.status(200).json(eventType);
    } catch (error: unknown) {
      next(error);
    }
  }
}
