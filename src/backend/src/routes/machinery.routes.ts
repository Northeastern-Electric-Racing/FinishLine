import express from 'express';
import { body } from 'express-validator';
import { nonEmptyString, validateInputs } from '../utils/validation.utils';
import MachineryController from '../controllers/machinery.controllers';

const machineryRouter = express.Router();

machineryRouter.post(
  '/create',
  nonEmptyString(body('name')),
  nonEmptyString(body('shopId')),
  body('quantity').isInt({ min: 1 }),
  validateInputs,
  MachineryController.createMachinery
);

export default machineryRouter;
