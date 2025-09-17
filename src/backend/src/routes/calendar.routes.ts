import express from 'express';
import { body } from 'express-validator';
import { nonEmptyString } from '../utils/validation.utils';
import CalendarController from '../controllers/calendar.controllers';

const calendarRouter = express.Router();

calendarRouter.post(
  '/create',
  nonEmptyString(body('name')),
  nonEmptyString(body('description')),
  nonEmptyString(body('color')),
  CalendarController.createCalendar
);

export default calendarRouter;
