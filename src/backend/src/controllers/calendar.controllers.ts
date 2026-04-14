import { NextFunction, Request, Response } from 'express';
import CalendarService from '../services/calendar.services.js';
import { getCurrentUserWithUserSettings } from '../utils/auth.utils.js';

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
        requiresConfirmation
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
        requiresConfirmation
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
      const { machineryId } = req.params as Record<string, string>;
      const { name } = req.body;

      const machinery = await CalendarService.editMachinery(req.currentUser, machineryId, name, req.organization);
      res.status(200).json(machinery);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async addMachineryToShop(req: Request, res: Response, next: NextFunction) {
    try {
      const { machineryId } = req.params as Record<string, string>;
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
      const { shopId } = req.params as Record<string, string>;
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
      const { calendarId } = req.params as Record<string, string>;
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
      const { calendarId } = req.params as Record<string, string>;

      const updatedCalendar = await CalendarService.deleteCalendar(req.currentUser, calendarId, req.organization);

      res.status(200).json(updatedCalendar);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async editEventType(req: Request, res: Response, next: NextFunction) {
    try {
      const { eventTypeId } = req.params as Record<string, string>;
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
        requiresConfirmation
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
        requiresConfirmation
      );
      res.status(200).json(eventType);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async deleteEventType(req: Request, res: Response, next: NextFunction) {
    try {
      const { eventTypeId } = req.params as Record<string, string>;

      const deletedEventType = await CalendarService.deleteEventType(req.currentUser, eventTypeId, req.organization);

      res.status(200).json(deletedEventType);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async deleteShop(req: Request, res: Response, next: NextFunction) {
    try {
      const { shopId } = req.params as Record<string, string>;

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
        scheduleSlots,
        initialDateScheduled,
        questionDocumentLink,
        location,
        zoomLink,
        description,
        sendSlackNotifications
      } = req.body;

      const parsedScheduleSlots = scheduleSlots.map((slot: any) => ({
        startTime: slot.startTime ? new Date(slot.startTime) : undefined,
        endTime: slot.endTime ? new Date(slot.endTime) : undefined,
        allDay: slot.allDay
      }));

      const parsedInitialDateScheduled = initialDateScheduled ? new Date(initialDateScheduled) : undefined;

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
        parsedScheduleSlots,
        parsedInitialDateScheduled,
        sendSlackNotifications,
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
      const { eventId } = req.params as Record<string, string>;

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
        questionDocumentLink,
        location,
        zoomLink,
        description,
        sendSlackNotifications
      } = req.body;

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
        sendSlackNotifications,
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

  static async editScheduleSlot(req: Request, res: Response, next: NextFunction) {
    try {
      const { scheduleSlotId } = req.params as Record<string, string>;
      const { startTime, endTime, allDay, editAllInSeries } = req.body;

      const event = await CalendarService.editScheduleSlot(
        req.currentUser,
        scheduleSlotId,
        new Date(startTime),
        new Date(endTime),
        allDay,
        editAllInSeries ?? false,
        req.organization
      );
      res.status(200).json(event);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async previewScheduleSlotRecurringEdits(req: Request, res: Response, next: NextFunction) {
    try {
      const { scheduleSlotId } = req.params as Record<string, string>;

      const affectedSlots = await CalendarService.previewScheduleSlotRecurringEdits(
        req.currentUser,
        scheduleSlotId,
        req.organization
      );
      res.status(200).json(affectedSlots);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async deleteScheduleSlot(req: Request, res: Response, next: NextFunction) {
    try {
      const { scheduleSlotId } = req.params as Record<string, string>;

      const event = await CalendarService.deleteScheduleSlot(req.currentUser, scheduleSlotId, req.organization);
      res.status(200).json(event);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async uploadDocument(req: Request, res: Response, next: NextFunction) {
    try {
      const { file } = req;
      const { eventId } = req.params as Record<string, string>;
      const document = await CalendarService.uploadDocument(eventId, file!, req.currentUser, req.organization);

      res.status(200).json(document);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async downloadDocument(req: Request, res: Response, next: NextFunction) {
    try {
      const { fileId } = req.params as Record<string, string>;

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
      const { eventId } = req.params as Record<string, string>;

      const event = await CalendarService.approveEvent(req.currentUser, eventId, req.organization);
      res.status(200).json(event);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async denyEvent(req: Request, res: Response, next: NextFunction) {
    try {
      const { eventId } = req.params as Record<string, string>;

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
      const { eventId } = req.params as Record<string, string>;
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
      const { eventId } = req.params as Record<string, string>;
      const { status } = req.body;

      const updatedEvent = await CalendarService.setStatus(req.currentUser, eventId, status, req.organization);
      res.status(200).json(updatedEvent);
    } catch (error: unknown) {
      next(error);
    }
  }

  // Schedule an event by adding a schedule slot and changing status to SCHEDULED
  static async scheduleEvent(req: Request, res: Response, next: NextFunction) {
    try {
      const { eventId } = req.params as Record<string, string>;
      const { startTime, endTime } = req.body;

      const updatedEvent = await CalendarService.scheduleEvent(
        req.currentUser,
        eventId,
        new Date(startTime),
        new Date(endTime),
        req.organization
      );
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
      const { eventId } = req.params as Record<string, string>;

      const event = await CalendarService.deleteEvent(req.currentUser, eventId, req.organization);

      res.status(200).json(event);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async deleteMachinery(req: Request, res: Response, next: NextFunction) {
    try {
      const { machineryId } = req.params as Record<string, string>;

      const machinery = await CalendarService.deleteMachinery(req.currentUser, machineryId, req.organization);

      res.status(200).json(machinery);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async getSingleEvent(req: Request, res: Response, next: NextFunction) {
    try {
      const { eventId } = req.params as Record<string, string>;

      const event = await CalendarService.getSingleEvent(req.currentUser, eventId, req.organization);
      res.status(200).json(event);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async getSingleEventWithMembers(req: Request, res: Response, next: NextFunction) {
    try {
      const { eventId } = req.params as Record<string, string>;

      const event = await CalendarService.getSingleEventWithMembers(req.currentUser, eventId, req.organization);
      res.status(200).json(event);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async getConflictingEvent(req: Request, res: Response, next: NextFunction) {
    try {
      const { eventId } = req.params as Record<string, string>;

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
