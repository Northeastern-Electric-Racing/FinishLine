import express from 'express';
import { body } from 'express-validator';
import { checkWorkPackageDescriptionBullet } from '../controllers/description-bullets.controllers';

const descriptionBulletsRouter = express.Router();

descriptionBulletsRouter.post(
  '/check',
  body('userId').isInt({ min: 0 }).not().isString(),
  body('descriptionId').isInt({ min: 0 }).not().isString(),
  checkWorkPackageDescriptionBullet
);

export default descriptionBulletsRouter;
