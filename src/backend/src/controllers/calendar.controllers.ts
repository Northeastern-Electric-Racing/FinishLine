import { NextFunction, Request, Response } from 'express';
import CalendarService from '../services/calendar.services.js';
import { getCurrentUserWithUserSettings } from '../utils/auth.utils.js';
import { generateIcsFeed } from '../utils/ics.utils.js';

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
        sendSlackNotifications,
        takeAttendance
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
        sendSlackNotifications,
        takeAttendance
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
      const { name, description, colorHexCode, isNewMemberCalendar } = req.body;

      const calendar = await CalendarService.createCalendar(
        req.currentUser,
        name,
        description,
        colorHexCode,
        isNewMemberCalendar,
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
      const { name, colorHexCode, description, isNewMemberCalendar } = req.body;

      const updatedCalendar = await CalendarService.editCalendar(
        req.currentUser,
        calendarId,
        name,
        description,
        colorHexCode,
        isNewMemberCalendar,
        req.organization
      );

      res.status(200).json(updatedCalendar);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async getNewMemberEvents(req: Request, res: Response, next: NextFunction) {
    try {
      const events = await CalendarService.getNewMemberEvents(req.organization);
      res.status(200).json(events);
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
        requiresConfirmation,
        sendSlackNotifications,
        takeAttendance
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
        sendSlackNotifications,
        takeAttendance
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
        notificationChannelIds,
        questionDocumentLink,
        location,
        zoomLink,
        description,
        mention
      } = req.body;

      const parsedScheduleSlots = scheduleSlots.map((slot: { allDay: boolean; startTime?: string; endTime?: string }) => ({
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
        notificationChannelIds,
        teamTypeId,
        questionDocumentLink,
        location,
        zoomLink,
        description,
        mention
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
        notificationChannelIds,
        questionDocumentLink,
        location,
        zoomLink,
        description
      } = req.body;

      await CalendarService.editEvent(
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
        notificationChannelIds,
        teamTypeId,
        questionDocumentLink,
        location,
        zoomLink,
        description
      );
      res.sendStatus(204);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async editScheduleSlot(req: Request, res: Response, next: NextFunction) {
    try {
      const { scheduleSlotId } = req.params as Record<string, string>;
      const { startTime, endTime, allDay, editAllInSeries } = req.body;

      await CalendarService.editScheduleSlot(
        req.currentUser,
        scheduleSlotId,
        new Date(startTime),
        new Date(endTime),
        allDay,
        editAllInSeries ?? false,
        req.organization
      );
      res.sendStatus(204);
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

      await CalendarService.deleteScheduleSlot(req.currentUser, scheduleSlotId, req.organization);
      res.sendStatus(204);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async uploadDocument(req: Request, res: Response, next: NextFunction) {
    try {
      const { file } = req;
      const { eventId } = req.params as Record<string, string>;
      await CalendarService.uploadDocument(eventId, file!, req.currentUser, req.organization);

      res.sendStatus(204);
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

      await CalendarService.approveEvent(req.currentUser, eventId, req.organization);
      res.sendStatus(204);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async denyEvent(req: Request, res: Response, next: NextFunction) {
    try {
      const { eventId } = req.params as Record<string, string>;

      await CalendarService.denyEvent(req.currentUser, eventId, req.organization);
      res.sendStatus(204);
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

      await CalendarService.markUserConfirmed(eventId, availability, user, req.organization);
      res.sendStatus(204);
    } catch (error: unknown) {
      next(error);
    }
  }

  // Set a new status for the event
  static async setStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { eventId } = req.params as Record<string, string>;
      const { status } = req.body;

      await CalendarService.setStatus(req.currentUser, eventId, status, req.organization);
      res.sendStatus(204);
    } catch (error: unknown) {
      next(error);
    }
  }

  // Schedule an event by adding a schedule slot and changing status to SCHEDULED
  static async scheduleEvent(req: Request, res: Response, next: NextFunction) {
    try {
      const { eventId } = req.params as Record<string, string>;
      const { startTime, endTime } = req.body;

      await CalendarService.scheduleEvent(
        req.currentUser,
        eventId,
        new Date(startTime),
        new Date(endTime),
        req.organization
      );
      res.sendStatus(204);
    } catch (error: unknown) {
      next(error);
    }
  }

  //overall filtering for events
  static async getCalendarViewEvents(req: Request, res: Response, next: NextFunction) {
    try {
      const filteredEvents = await CalendarService.getCalendarViewEvents(req.body, req.organization);
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

      await CalendarService.deleteEvent(req.currentUser, eventId, req.organization);

      res.sendStatus(204);
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

  static async getMyConflicts(req: Request, res: Response, next: NextFunction) {
    try {
      const conflicts = await CalendarService.getMyConflicts(req.currentUser, req.organization);
      res.status(200).json(conflicts);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async getReviewBookingEvents(req: Request, res: Response, next: NextFunction) {
    try {
      const { startPeriod } = req.query as Record<string, string | undefined>;
      const events = await CalendarService.getReviewBookingEvents(
        req.organization,
        startPeriod ? new Date(startPeriod) : undefined
      );
      res.status(200).json(events);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async getMyUpcomingEvents(req: Request, res: Response, next: NextFunction) {
    try {
      const { days, includeTeamEvents } = req.query as Record<string, string>;
      const events = await CalendarService.getMyUpcomingEvents(
        req.currentUser,
        req.organization,
        parseInt(days),
        includeTeamEvents === 'true'
      );
      res.status(200).json(events);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async getDesignReviewAttendance(req: Request, res: Response, next: NextFunction) {
    try {
      const attendance = await CalendarService.getDesignReviewAttendance(req.organization);
      res.status(200).json(attendance);
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

  static async getGuestEventFeed(req: Request, res: Response, next: NextFunction) {
    try {
      const { direction, cursor } = req.body;
      const paginatedEvents = await CalendarService.getGuestEventFeed(req.organization, direction, cursor);
      res.status(200).json(paginatedEvents);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async getOrCreateIcsToken(req: Request, res: Response, next: NextFunction) {
    try {
      const icsToken = await CalendarService.getOrCreateIcsToken(req.currentUser.userId);
      res.status(200).json({ icsToken, organizationId: req.organization.organizationId });
    } catch (error: unknown) {
      next(error);
    }
  }

  static async getIcsFeed(req: Request, res: Response, next: NextFunction) {
    try {
      const { token } = req.params as Record<string, string>;
      const { org, calendars, events } = req.query as Record<string, string | undefined>;
      const organizationId = org ?? '';
      const calendarIds = calendars ? calendars.split(',').filter(Boolean) : [];
      const eventIds = events ? events.split(',').filter(Boolean) : [];

      const event = await CalendarService.getIcsFeedEvents(token, organizationId, calendarIds, eventIds);
      const icsContent = generateIcsFeed(event);

      res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename="finishline.ics"');
      res.send(icsContent);
    } catch (error: unknown) {
      next(error);
    }
  }

  static async remindUnconfirmed(req: Request, res: Response, next: NextFunction) {
    try {
      const { eventId } = req.params as Record<string, string>;

      await CalendarService.remindUnconfirmed(eventId, req.currentUser, req.organization);
      res.sendStatus(204);
    } catch (error: unknown) {
      next(error);
    }
  }
}
