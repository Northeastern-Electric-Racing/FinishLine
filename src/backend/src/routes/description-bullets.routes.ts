import express from 'express';
import { body } from 'express-validator';
import { checkWorkPackageDescriptionBullet } from '../controllers/description-bullets.controllers';

const descriptionBulletsRouter = express.Router();

descriptionBulletsRouter.post(
  '/check',
  body('submitterId').isInt({ min: 0 }).not().isString(),
  body('descriptionBulletId').isInt({ min: 0 }).not().isString(),
  checkWorkPackageDescriptionBullet
);

export default descriptionBulletsRouter;
