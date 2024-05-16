import express from 'express';
import { body } from 'express-validator';
import DescriptionBulletsController from '../controllers/description-bullets.controllers';
import { validateInputs } from '../utils/validation.utils';

const descriptionBulletsRouter = express.Router();

descriptionBulletsRouter.post(
  '/check',
  body('descriptionId').isInt({ min: 0 }).not().isString(),
  validateInputs,
  DescriptionBulletsController.checkDescriptionBullet
);

export default descriptionBulletsRouter;
