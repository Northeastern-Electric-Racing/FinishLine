import express from 'express';
import { body } from 'express-validator';
import { checkDescriptionBullet } from '../controllers/description-bullets.controllers';
import { validateInputs } from '../utils/utils';

const descriptionBulletsRouter = express.Router();

descriptionBulletsRouter.post(
  '/check',
  body('userId').isInt({ min: 0 }).not().isString(),
  body('descriptionId').isInt({ min: 0 }).not().isString(),
  validateInputs,
  checkDescriptionBullet
);

export default descriptionBulletsRouter;
