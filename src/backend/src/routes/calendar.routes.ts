import express from 'express';
import { body } from 'express-validator';
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

export default calendarRouter;
