import express from 'express';
import { body, param, query } from 'express-validator';
import { intMinZero, isDate, nonEmptyString, validateInputs, isDayOfWeek } from '../utils/validation.utils';
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
  body('initialDateScheduled').isBoolean(),
  body('allDay').isBoolean(),
  body('recurring').isBoolean(),
  body('members').isBoolean(),
  body('location').isBoolean(),
  body('zoomLink').isBoolean(),
  body('availabilities').isBoolean(),
  body('shop').isBoolean(),
  body('machinery').isBoolean(),
  body('workPackage').isBoolean(),
  body('questionDocument').isBoolean(),
  body('documents').isBoolean(),
  body('description').isBoolean(),
  validateInputs,
  CalendarController.createEventType
);

calendarRouter.post(
  '/event/create',
  nonEmptyString(body('title')),
  body('eventTypeId').isString(),
  body('approved').isBoolean(),
  body('approvedByUserId').optional().isString(),
  body('memberIds').isArray(),
  body('memberIds.*').isString(),
  body('teamIds').isArray(),
  body('teamIds.*').isString(),
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
  body('scheduleSlot.*.daysOfWeek').isArray(),
  isDayOfWeek(body('scheduleSlot.*.daysOfWeek.*')),
  isDate(body('scheduleSlot.*.startTime')).optional(),
  isDate(body('scheduleSlot.*.endTime')).optional(),
  intMinZero(body('scheduleSlot.*.recurrenceNumber')),
  isDate(body('scheduleSlot.*.initialDateScheduled')),
  body('scheduleSlot.*.allDay').isBoolean(),
  body('availability').isArray(),
  body('availability.*.availability').isArray(),
  intMinZero(body('availability.*.availability.*')),
  isDate(body('availability.*.dateSet')),
  validateInputs,
  CalendarController.createEvent
);

calendarRouter.post(
  '/machinery/create',
  nonEmptyString(body('name')),
  nonEmptyString(body('shopId')),
  body('quantity').isInt({ min: 1 }),
  body('description').optional().isString(),
  validateInputs,
  CalendarController.createMachinery
);

calendarRouter.post(
  '/machinery/:machineryId/edit',
  nonEmptyString(body('name')),
  nonEmptyString(body('shopId')),
  body('quantity').isInt({ min: 1 }),
  body('description').optional().isString(),
  validateInputs,
  CalendarController.editMachinery
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

calendarRouter.post(
  '/event-type/:eventTypeId/edit',
  body('calendarIds').isArray(),
  body('calendarIds.*').isString(),
  body('initialDateScheduled').isBoolean(),
  body('allDay').isBoolean(),
  body('recurring').isBoolean(),
  body('members').isBoolean(),
  body('location').isBoolean(),
  body('zoomLink').isBoolean(),
  body('availabilities').isBoolean(),
  body('shop').isBoolean(),
  body('machinery').isBoolean(),
  body('workPackage').isBoolean(),
  body('questionDocument').isBoolean(),
  body('documents').isBoolean(),
  body('description').isBoolean(),
  validateInputs,
  CalendarController.editEventType
);

calendarRouter.post('/:calendarId/delete', CalendarController.deleteCalendar);

calendarRouter.post('/shop/:shopId/delete', nonEmptyString(param('shopId')), validateInputs, CalendarController.deleteShop);

calendarRouter.get('/shops', CalendarController.getAllShops);

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
  body('approvalStatus').isBoolean().optional(),
  isDate(body('startPeriod')).optional(),
  isDate(body('endPeriod')).optional(),
  validateInputs,
  CalendarController.getFilteredEvents
);

// Example get queries using the base filter service, in case it's easier to use these

// filter via specific ID
calendarRouter.get(
  '/events/member/:memberId',
  nonEmptyString(query('startPeriod')).optional(),
  nonEmptyString(query('endPeriod')).optional(),
  validateInputs,
  CalendarController.getSpecificMembersEvents
);

calendarRouter.get(
  '/events/calendar/:calendarId',
  nonEmptyString(query('startPeriod')).optional(),
  nonEmptyString(query('endPeriod')).optional(),
  validateInputs,
  CalendarController.getEventsFromCalendar
);

calendarRouter.get('/events/event/:eventId', CalendarController.getSpecificEvent);

// filter just based on time
calendarRouter.get(
  '/events/timeframe',
  nonEmptyString(query('startPeriod')).optional(),
  nonEmptyString(query('endPeriod')).optional(),
  validateInputs,
  CalendarController.getEventsFromTimeframe
);

// unfiltered
calendarRouter.get('/events', CalendarController.getAllEvents);

// filtered by approval
calendarRouter.get('/events/unapproved', CalendarController.getUnapprovedEvents);
calendarRouter.get('/events/approved', CalendarController.getApprovedEvents);

calendarRouter.get('/calendars', CalendarController.getAllCalendars);

export default calendarRouter;
