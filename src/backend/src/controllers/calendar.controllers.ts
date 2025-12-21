import { NextFunction, Request, Response } from 'express';
import CalendarService from '../services/calendar.services';
import { getCurrentUserWithUserSettings } from '../utils/auth.utils';

export default class CalendarController {
  static async createEventType(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        name,
        calendarIds,
        requiredMembers,
        optionalMembers,
        teams,
        teamType,
        location,
        zoomLink,
        shop,
        machinery,
        workPackage,
        questionDocument,
        documents,
        description,
        onlyHeadsOrAbove,
        requiresConfirmation,
        sendSlackNotifications
      } = req.body;

      const eventType = await CalendarService.createEventType(
        req.currentUser,
        name,
        calendarIds,
        req.organization,
        requiredMembers,
        optionalMembers,
        teams,
        teamType,
        location,
        zoomLink,
        shop,
        machinery,
        workPackage,
        questionDocument,
        documents,
        description,
        onlyHeadsOrAbove,
        requiresConfirmation,
        sendSlackNotifications
      );
      res.status(200).json(eventType);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async createMachinery(req: Request, res: Response, next: NextFunction) {
    try {
      const { name } = req.body;

      const machinery = await CalendarService.createMachinery(req.currentUser, name, req.organization);
      res.status(200).json(machinery);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async editMachinery(req: Request, res: Response, next: NextFunction) {
    try {
      const { machineryId } = req.params;
      const { name } = req.body;

      const machinery = await CalendarService.editMachinery(req.currentUser, machineryId, name, req.organization);
      res.status(200).json(machinery);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async addMachineryToShop(req: Request, res: Response, next: NextFunction) {
    try {
      const { machineryId } = req.params;
      const { shopId, quantity, originalShopId } = req.body;

      const machinery = await CalendarService.addMachineryToShop(
        req.currentUser,
        machineryId,
        shopId,
        quantity,
        req.organization,
        originalShopId
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
        name,
        calendarIds,
        requiredMembers,
        optionalMembers,
        teams,
        teamType,
        location,
        zoomLink,
        shop,
        machinery,
        workPackage,
        questionDocument,
        documents,
        description,
        onlyHeadsOrAbove,
        requiresConfirmation,
        sendSlackNotifications
      } = req.body;

      const eventType = await CalendarService.editEventType(
        eventTypeId,
        req.currentUser,
        calendarIds,
        req.organization,
        name,
        requiredMembers,
        optionalMembers,
        teams,
        teamType,
        location,
        zoomLink,
        shop,
        machinery,
        workPackage,
        questionDocument,
        documents,
        description,
        onlyHeadsOrAbove,
        requiresConfirmation,
        sendSlackNotifications
      );
      res.status(200).json(eventType);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async deleteEventType(req: Request, res: Response, next: NextFunction) {
    try {
      const { eventTypeId } = req.params;

      const deletedEventType = await CalendarService.deleteEventType(req.currentUser, eventTypeId, req.organization);

      res.status(200).json(deletedEventType);
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
        requiredMemberIds,
        optionalMemberIds,
        teamIds,
        teamTypeId,
        shopIds,
        machineryIds,
        workPackageIds,
        scheduleSlot,
        questionDocumentLink,
        location,
        zoomLink,
        description
      } = req.body;

      const parsedScheduleSlot = scheduleSlot.map((slot: any) => ({
        ...slot,
        startTime: slot.startTime ? new Date(slot.startTime) : undefined,
        endTime: slot.endTime ? new Date(slot.endTime) : undefined,
        initialDateScheduled: new Date(slot.initialDateScheduled)
      }));

      const event = await CalendarService.createEvent(
        req.currentUser,
        title,
        eventTypeId,
        req.organization,
        requiredMemberIds,
        optionalMemberIds,
        teamIds,
        shopIds,
        machineryIds,
        workPackageIds,
        parsedScheduleSlot,
        teamTypeId,
        questionDocumentLink,
        location,
        zoomLink,
        description
      );
      res.status(200).json(event);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async editEvent(req: Request, res: Response, next: NextFunction) {
    try {
      const { eventId } = req.params;

      const {
        title,
        requiredMemberIds,
        optionalMemberIds,
        teamIds,
        teamTypeId,
        status,
        shopIds,
        machineryIds,
        workPackageIds,
        documents,
        scheduleSlot,
        questionDocumentLink,
        location,
        zoomLink,
        description
      } = req.body;

      const parsedScheduleSlot = scheduleSlot.map((slot: any) => ({
        ...slot,
        startTime: slot.startTime ? new Date(slot.startTime) : undefined,
        endTime: slot.endTime ? new Date(slot.endTime) : undefined,
        initialDateScheduled: new Date(slot.initialDateScheduled)
      }));

      const event = await CalendarService.editEvent(
        req.currentUser,
        eventId,
        title,
        req.organization,
        requiredMemberIds,
        optionalMemberIds,
        status,
        teamIds,
        shopIds,
        machineryIds,
        workPackageIds,
        documents,
        parsedScheduleSlot,
        teamTypeId,
        questionDocumentLink,
        location,
        zoomLink,
        description
      );
      res.status(200).json(event);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async uploadDocument(req: Request, res: Response, next: NextFunction) {
    try {
      const { file } = req;
      const { eventId } = req.params;
      const document = await CalendarService.uploadDocument(eventId, file!, req.currentUser, req.organization);

      res.status(200).json(document);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async downloadDocument(req: Request, res: Response, next: NextFunction) {
    try {
      const { fileId } = req.params;

      const imageData = await CalendarService.downloadDocument(fileId);

      // Set the appropriate headers for the HTTP response
      res.setHeader('content-type', String(imageData.type));
      res.setHeader('content-length', imageData.buffer.length);

      // Send the Buffer as the response body
      res.status(200).send(imageData.buffer);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async approveEvent(req: Request, res: Response, next: NextFunction) {
    try {
      const { eventId } = req.params;

      const event = await CalendarService.approveEvent(req.currentUser, eventId, req.organization);
      res.status(200).json(event);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async denyEvent(req: Request, res: Response, next: NextFunction) {
    try {
      const { eventId } = req.params;

      const event = await CalendarService.denyEvent(req.currentUser, eventId, req.organization);
      res.status(200).json(event);
    } catch (error: unknown) {
      next(error);
    }
  }

  // Mark the current user as confirmed for the given event
  static async markUserConfirmed(req: Request, res: Response, next: NextFunction) {
    try {
      const { availability } = req.body;
      const { eventId } = req.params;
      const user = await getCurrentUserWithUserSettings(res);

      const updatedEvent = await CalendarService.markUserConfirmed(eventId, availability, user, req.organization);
      res.status(200).json(updatedEvent);
    } catch (error: unknown) {
      next(error);
    }
  }

  // Set a new status for the event
  static async setStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { eventId } = req.params;
      const { status } = req.body;

      const updatedEvent = await CalendarService.setStatus(req.currentUser, eventId, status, req.organization);
      res.status(200).json(updatedEvent);
    } catch (error: unknown) {
      next(error);
    }
  }

  //overall filtering for events
  static async getFilteredEvents(req: Request, res: Response, next: NextFunction) {
    try {
      const filteredEvents = await CalendarService.getFilteredEvents(req.body, req.organization);
      res.status(200).json(filteredEvents);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async getAllCalendars(req: Request, res: Response, next: NextFunction) {
    try {
      const calendars = await CalendarService.getAllCalendars(req.organization);
      res.status(200).json(calendars);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async deleteEvent(req: Request, res: Response, next: NextFunction) {
    try {
      const { eventId } = req.params;

      const event = await CalendarService.deleteEvent(req.currentUser, eventId, req.organization);

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

  static async getSingleEvent(req: Request, res: Response, next: NextFunction) {
    try {
      const { eventId } = req.params;

      const event = await CalendarService.getSingleEvent(req.currentUser, eventId, req.organization);
      res.status(200).json(event);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async getConflictingEvent(req: Request, res: Response, next: NextFunction) {
    try {
      const { eventId } = req.params;

      const event = await CalendarService.getConflictingEvent(req.currentUser, eventId, req.organization);
      res.status(200).json(event);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async getAllEvents(req: Request, res: Response, next: NextFunction) {
    try {
      const events = await CalendarService.getAllEvents(req.organization);
      res.status(200).json(events);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async getAllEventTypes(req: Request, res: Response, next: NextFunction) {
    try {
      const eventTypes = await CalendarService.getAllEventTypes(req.organization);
      res.status(200).json(eventTypes);
    } catch (error: unknown) {
      next(error);
    }
  }
}
