import express from 'express';
import { body } from 'express-validator';
import { nonEmptyString, validateInputs } from '../utils/validation.utils';
import MachineryController from '../controllers/calendar.controllers';

const calendarRouter = express.Router();

calendarRouter.post(
  '/machinery/create',
  nonEmptyString(body('name')),
  nonEmptyString(body('shopId')),
  body('quantity').isInt({ min: 1 }),
  validateInputs,
  MachineryController.createMachinery
);

export default calendarRouter;
