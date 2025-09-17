import express from 'express';
import { body } from 'express-validator';
import { nonEmptyString, validateInputs } from '../utils/validation.utils';
import CalendarController from '../controllers/calendar.controllers';

const shopRouter = express.Router();
shopRouter.post(
  '/shop/create',
  nonEmptyString(body('name')),
  nonEmptyString(body('description')),
  validateInputs,
  CalendarController.createShop
);

export default shopRouter;
