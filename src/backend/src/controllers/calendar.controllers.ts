import { NextFunction, Request, Response } from 'express';
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
      const { name, shopId, quantity, description } = req.body;

      const machinery = await CalendarService.createMachinery(
        req.currentUser,
        name,
        shopId,
        quantity,
        req.organization,
        description
      );
      res.status(200).json(machinery);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async editMachinery(req: Request, res: Response, next: NextFunction) {
    try {
      const { machineryId } = req.params;
      const { name, shopId, quantity, description } = req.body;

      const machinery = await CalendarService.editMachinery(
        req.currentUser,
        machineryId,
        name,
        shopId,
        quantity,
        req.organization,
        description
      );
      res.status(200).json(machinery);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async createShop(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, description } = req.body;

      const shop = await CalendarService.createShop(req.currentUser, name, description, req.organization);

      res.status(200).json(shop);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async createCalendar(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, description, colorHexCode } = req.body;

      const calendar = await CalendarService.createCalendar(
        req.currentUser,
        name,
        description,
        colorHexCode,
        req.organization
      );

      res.status(200).json(calendar);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async deleteCalendar(req: Request, res: Response, next: NextFunction) {
    try {
      const { calendarId } = req.params;

      const updatedCalendar = await CalendarService.deleteCalendar(req.currentUser, calendarId, req.organization);

      res.status(200).json(updatedCalendar);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async deleteShop(req: Request, res: Response, next: NextFunction) {
    try {
      const { shopId } = req.params;

      const shop = await CalendarService.deleteShop(req.currentUser, shopId, req.organization);

      res.status(200).json(shop);
    } catch (error: unknown) {
      next(error);
    }
  }
}
