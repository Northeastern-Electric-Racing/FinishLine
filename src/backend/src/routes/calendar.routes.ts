import express from 'express';
import { body, param } from 'express-validator';
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

calendarRouter.get('/machinery', CalendarController.getAllMachinery);

export default calendarRouter;
