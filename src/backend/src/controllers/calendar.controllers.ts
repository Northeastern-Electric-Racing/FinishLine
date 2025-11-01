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
      const { name, shopId, quantity } = req.body;

      const machinery = await CalendarService.createMachinery(req.currentUser, name, shopId, quantity, req.organization);
      res.status(200).json(machinery);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async editMachinery(req: Request, res: Response, next: NextFunction) {
    try {
      const { machineryId } = req.params;
      const { name, shopId, quantity, originalShopId, shopMachineryId } = req.body;

      const machinery = await CalendarService.editMachinery(
        req.currentUser,
        machineryId,
        name,
        shopId,
        quantity,
        req.organization,
        originalShopId,
        shopMachineryId
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

  static async getAllShops(req: Request, res: Response, next: NextFunction) {
    try {
      const shops = await CalendarService.getAllShops(req.organization);
      res.status(200).json(shops);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async getAllMachinery(req: Request, res: Response, next: NextFunction) {
    try {
      const machinery = await CalendarService.getAllMachinery(req.organization);
      res.status(200).json(machinery);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async editShop(req: Request, res: Response, next: NextFunction) {
    try {
      const { shopId } = req.params;
      const { name, description } = req.body;

      const updatedShop = await CalendarService.editShop(req.currentUser, shopId, name, description, req.organization);
      res.status(200).json(updatedShop);
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

  static async editCalendar(req: Request, res: Response, next: NextFunction) {
    try {
      const { calendarId } = req.params;
      const { name, colorHexCode, description } = req.body;

      const updatedCalendar = await CalendarService.editCalendar(
        req.currentUser,
        calendarId,
        name,
        description,
        colorHexCode,
        req.organization
      );

      res.status(200).json(updatedCalendar);
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

  static async editEventType(req: Request, res: Response, next: NextFunction) {
    try {
      const { eventTypeId } = req.params;
      const {
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

      const eventType = await CalendarService.editEventType(
        eventTypeId,
        req.currentUser,
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

  static async deleteShop(req: Request, res: Response, next: NextFunction) {
    try {
      const { shopId } = req.params;

      const shop = await CalendarService.deleteShop(req.currentUser, shopId, req.organization);

      res.status(200).json(shop);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async createEvent(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        title,
        eventTypeId,
        memberIds,
        shopIds,
        machineryIds,
        workPackageIds,
        documentIds,
        scheduleSlot,
        availability,
        approved,
        approvedByUserId,
        questionDocument,
        location,
        zoomLink,
        description
      } = req.body;

      const event = await CalendarService.createEvent(
        req.currentUser,
        title,
        eventTypeId,
        req.organization,
        memberIds,
        shopIds,
        machineryIds,
        workPackageIds,
        documentIds,
        scheduleSlot,
        availability,
        approved,
        approvedByUserId,
        questionDocument,
        location,
        zoomLink,
        description
      );
      res.status(200).json(event);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async deleteMachinery(req: Request, res: Response, next: NextFunction) {
    try {
      const { machineryId } = req.params;

      const machinery = await CalendarService.deleteMachinery(req.currentUser, machineryId, req.organization);

      res.status(200).json(machinery);
    } catch (error: unknown) {
      next(error);
    }
  }
}
