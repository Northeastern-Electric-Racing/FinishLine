import express from 'express';
import { body } from 'express-validator';
import { nonEmptyString, validateInputs } from '../utils/validation.utils';
import CalendarController from '../controllers/calendar.controllers';

const calendarRouter = express.Router();

calendarRouter.post(
  '/event-type/create',
  nonEmptyString(body('name')),
  body('calendarIds').isArray(),
  body('initialDateScheduled').isBoolean().optional(),
  body('allDay').isBoolean().optional(),
  body('recurring').isBoolean().optional(),
  body('members').isBoolean().optional(),
  body('location').isBoolean().optional(),
  body('zoomLink').isBoolean().optional(),
  body('availabilities').isBoolean().optional(),
  body('shop').isBoolean().optional(),
  body('machinery').isBoolean().optional(),
  body('workPackage').isBoolean().optional(),
  body('questionDocument').isBoolean().optional(),
  body('documents').isBoolean().optional(),
  body('description').isBoolean().optional(),
  validateInputs,
  CalendarController.createEventType
);

export default calendarRouter;
