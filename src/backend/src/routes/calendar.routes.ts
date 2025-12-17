import express from 'express';
import { body, param } from 'express-validator';
import {
  intMinZero,
  isDate,
  nonEmptyString,
  validateInputs,
  isDayOfWeek,
  isEventStatus,
  isConflictStatus
} from '../utils/validation.utils';
import CalendarController from '../controllers/calendar.controllers';

const calendarRouter = express.Router();

calendarRouter.post(
  '/create',
  nonEmptyString(body('name')),
  nonEmptyString(body('description')),
  nonEmptyString(body('colorHexCode')),
  validateInputs,
  CalendarController.createCalendar
);

calendarRouter.post(
  '/event-type/create',
  nonEmptyString(body('name')),
  body('calendarIds').isArray(),
  body('calendarIds.*').isString(),
  body('requiredMembers').isBoolean(),
  body('optionalMembers').isBoolean(),
  body('teams').isBoolean(),
  body('teamType').isBoolean(),
  body('location').isBoolean(),
  body('zoomLink').isBoolean(),
  body('shop').isBoolean(),
  body('machinery').isBoolean(),
  body('workPackage').isBoolean(),
  body('questionDocument').isBoolean(),
  body('documents').isBoolean(),
  body('description').isBoolean(),
  body('onlyHeadsOrAbove').isBoolean(),
  body('requiresConfirmation').isBoolean(),
  body('sendSlackNotifications').isBoolean(),
  validateInputs,
  CalendarController.createEventType
);

calendarRouter.post(
  '/event-type/:eventTypeId/edit',
  nonEmptyString(body('name')),
  body('calendarIds').isArray(),
  body('calendarIds.*').isString(),
  body('requiredMembers').isBoolean(),
  body('optionalMembers').isBoolean(),
  body('teams').isBoolean(),
  body('teamType').isBoolean(),
  body('location').isBoolean(),
  body('zoomLink').isBoolean(),
  body('shop').isBoolean(),
  body('machinery').isBoolean(),
  body('workPackage').isBoolean(),
  body('questionDocument').isBoolean(),
  body('documents').isBoolean(),
  body('description').isBoolean(),
  body('onlyHeadsOrAbove').isBoolean(),
  body('requiresConfirmation').isBoolean(),
  body('sendSlackNotifications').isBoolean(),
  validateInputs,
  CalendarController.editEventType
);

calendarRouter.post(
  '/event/create',
  nonEmptyString(body('title')),
  body('eventTypeId').isString(),
  body('requiredMemberIds').isArray(),
  nonEmptyString(body('requiredMemberIds.*')),
  body('optionalMemberIds').isArray(),
  nonEmptyString(body('optionalMemberIds.*')),
  body('teamIds').isArray(),
  body('teamIds.*').isString(),
  body('teamTypeId').optional().isString(),
  body('location').optional().isString(),
  body('zoomLink').optional().isURL(),
  body('shopIds').isArray(),
  body('shopIds.*').isString(),
  body('machineryIds').isArray(),
  body('machineryIds.*').isString(),
  body('workPackageIds').isArray(),
  body('workPackageIds.*').isString(),
  body('documentIds').isArray(),
  body('documentIds.*').isString(),
  body('questionDocument').optional().isString(),
  body('description').optional().isString(),
  body('scheduleSlot').isArray(),
  body('scheduleSlot.*.days').isArray(),
  isDayOfWeek(body('scheduleSlot.*.days.*')),
  isDate(body('scheduleSlot.*.startTime')).optional(),
  isDate(body('scheduleSlot.*.endTime')).optional(),
  intMinZero(body('scheduleSlot.*.recurrenceNumber')),
  isDate(body('scheduleSlot.*.initialDateScheduled')),
  body('scheduleSlot.*.allDay').isBoolean(),
  validateInputs,
  CalendarController.createEvent
);

calendarRouter.post(
  '/event/:eventId/edit',
  nonEmptyString(body('title')),
  body('requiredMemberIds').isArray(),
  nonEmptyString(body('requiredMemberIds.*')),
  body('optionalMemberIds').isArray(),
  nonEmptyString(body('optionalMemberIds.*')),
  body('teamIds').isArray(),
  body('teamIds.*').isString(),
  body('teamTypeId').optional().isString(),
  isEventStatus(body('status')),
  body('location').optional().isString(),
  body('zoomLink').optional().isURL(),
  body('shopIds').isArray(),
  body('shopIds.*').isString(),
  body('machineryIds').isArray(),
  body('machineryIds.*').isString(),
  body('workPackageIds').isArray(),
  body('workPackageIds.*').isString(),
  body('documentIds').isArray(),
  body('documentIds.*').isString(),
  body('questionDocument').optional().isString(),
  body('description').optional().isString(),
  body('scheduleSlot').isArray(),
  body('scheduleSlot.*.days').isArray(),
  isDayOfWeek(body('scheduleSlot.*.days.*')),
  isDate(body('scheduleSlot.*.startTime')).optional(),
  isDate(body('scheduleSlot.*.endTime')).optional(),
  intMinZero(body('scheduleSlot.*.recurrenceNumber')),
  isDate(body('scheduleSlot.*.initialDateScheduled')),
  body('scheduleSlot.*.allDay').isBoolean(),
  validateInputs,
  CalendarController.editEvent
);

calendarRouter.post('/event/:eventId/approve', CalendarController.approveEvent);

calendarRouter.post('/event/:eventId/deny', CalendarController.denyEvent);

calendarRouter.post(
  '/event/:eventId/confirm-schedule',
  body('availability').isArray(),
  body('availability.*.availability').isArray(),
  intMinZero(body('availability.*.availability.*')),
  isDate(body('availability.*.dateSet')),
  validateInputs,
  CalendarController.markUserConfirmed
);

calendarRouter.post(
  '/event/:eventId/set-status',
  isEventStatus(body('status')),
  validateInputs,
  CalendarController.setStatus
);

calendarRouter.post('/event/:eventId/delete', CalendarController.deleteEvent);

calendarRouter.get('/event/conflict/:eventId', CalendarController.getConflictingEvent);

calendarRouter.get('/event/:eventId', CalendarController.getSingleEvent);

calendarRouter.get('/events', CalendarController.getAllEvents);

calendarRouter.get('/event-types', CalendarController.getAllEventTypes);

calendarRouter.post('/machinery/create', nonEmptyString(body('name')), validateInputs, CalendarController.createMachinery);

calendarRouter.post(
  '/machinery/:machineryId/edit',
  nonEmptyString(body('name')),
  validateInputs,
  CalendarController.editMachinery
);

calendarRouter.post(
  '/machinery/:machineryId/add-to-shop',
  nonEmptyString(body('shopId')),
  body('quantity').isInt({ min: 0 }),
  body('originalShopId').optional().isString(),
  validateInputs,
  CalendarController.addMachineryToShop
);

calendarRouter.post('/machinery/:machineryId/delete', CalendarController.deleteMachinery);

calendarRouter.post(
  '/:calendarId/edit',
  nonEmptyString(body('name')),
  nonEmptyString(body('description')),
  nonEmptyString(body('colorHexCode')),
  validateInputs,
  CalendarController.editCalendar
);

calendarRouter.post(
  '/shop/create',
  nonEmptyString(body('name')),
  nonEmptyString(body('description')),
  validateInputs,
  CalendarController.createShop
);

calendarRouter.post(
  '/shop/:shopId/edit',
  nonEmptyString(body('name')),
  nonEmptyString(body('description')),
  validateInputs,
  CalendarController.editShop
);

calendarRouter.post('/event-type/:eventTypeId/delete', CalendarController.deleteEventType);

calendarRouter.post('/:calendarId/delete', CalendarController.deleteCalendar);

calendarRouter.post('/shop/:shopId/delete', nonEmptyString(param('shopId')), validateInputs, CalendarController.deleteShop);

calendarRouter.get('/shops', CalendarController.getAllShops);

calendarRouter.get('/machinery', CalendarController.getAllMachinery);

// no restrictions filtering, in case multiple filters need to be sent
calendarRouter.post(
  '/events/filter',
  body('memberIds').optional().isArray(),
  body('memberIds.*').optional().isString(),
  body('teamIds').optional().isArray(),
  body('teamIds.*').optional().isString(),
  body('calendarIds').isArray().optional(),
  body('calendarIds.*').isString().optional(),
  body('eventTypeIds').optional().isArray(),
  body('eventTypeIds.*').optional().isString(),
  body('eventIds').isArray().optional(),
  body('eventIds.*').isString().optional(),
  body('approvalIds').isArray().optional(),
  body('approvalIds.*').isString().optional(),
  body('statuses').isArray().optional(),
  isConflictStatus(body('statuses.*')),
  isDate(body('startPeriod')),
  isDate(body('endPeriod')),
  validateInputs,
  CalendarController.getFilteredEvents
);

calendarRouter.get('/calendars', CalendarController.getAllCalendars);

export default calendarRouter;
