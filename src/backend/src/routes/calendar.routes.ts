import express from 'express';
import { body, param } from 'express-validator';
import { nonEmptyString, validateInputs } from '../utils/validation.utils';
import CalendarController from '../controllers/calendar.controllers';

const calendarRouter = express.Router();

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
  '/machinery/create',
  nonEmptyString(body('name')),
  nonEmptyString(body('shopId')),
  body('quantity').isInt({ min: 1 }),
  body('description').optional().isString(),
  validateInputs,
  CalendarController.createMachinery
);

calendarRouter.put(
  '/machinery/edit/:machineryId',
  nonEmptyString(body('name')),
  nonEmptyString(body('shopId')),
  body('quantity').isInt({ min: 1 }),
  body('description').optional().isString(),
  validateInputs,
  CalendarController.editMachinery
);

calendarRouter.post(
  '/shop/create',
  nonEmptyString(body('name')),
  body('description').optional().isString(),
  validateInputs,
  CalendarController.createShop
);

calendarRouter.post(
  '/create',
  nonEmptyString(body('name')),
  nonEmptyString(body('description')),
  nonEmptyString(body('colorHexCode')),
  validateInputs,
  CalendarController.createCalendar
);

calendarRouter.post('/:calendarId/delete', CalendarController.deleteCalendar);

calendarRouter.post('/shop/:shopId/delete', nonEmptyString(param('shopId')), validateInputs, CalendarController.deleteShop);

export default calendarRouter;
