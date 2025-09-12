import express from 'express';
import { body } from 'express-validator';
import { nonEmptyString, intMinZero, validateInputs } from '../utils/validation.utils';
import MachineryController from '../controllers/machinery.controllers';

const machineryRouter = express.Router();

machineryRouter.post(
  '/machinery/create',
  nonEmptyString(body('name')),
  nonEmptyString(body('shopId')),
  intMinZero(body('quantity')),
  validateInputs,
  MachineryController.createMachinery
);

export default machineryRouter;
