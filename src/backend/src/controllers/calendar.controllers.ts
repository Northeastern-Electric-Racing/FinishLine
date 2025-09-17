import { NextFunction, Request, Response } from 'express';
import MachineryService from '../services/calendar.services';
import CalendarService from '../services/calendar.services';
export default class CalendarController {
  static async createEventType(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        name,
        calendarIds,
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
        questionDocument,
        documents,
        description
      } = req.body;

      const eventType = await CalendarService.createEventType(
        req.currentUser,
        name,
        calendarIds,
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
        questionDocument,
        documents,
        description
      );
      res.status(200).json(eventType);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async createMachinery(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, shopId, quantity } = req.body;

      const machinery = await MachineryService.createMachinery(req.currentUser, name, shopId, quantity, req.organization);
      res.status(200).json(machinery);
    } catch (error: unknown) {
      next(error);
    }
  }
}
