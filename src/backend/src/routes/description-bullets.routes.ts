import express from 'express';
import { body } from 'express-validator';
import DescriptionBulletsController from '../controllers/description-bullets.controllers';
import { nonEmptyString, validateInputs } from '../utils/validation.utils';

const descriptionBulletsRouter = express.Router();

descriptionBulletsRouter.post(
  '/check',
  nonEmptyString(body('descriptionId')),
  validateInputs,
  DescriptionBulletsController.checkDescriptionBullet
);

descriptionBulletsRouter.get('/types', DescriptionBulletsController.getAllDescriptionBulletTypes);

descriptionBulletsRouter.post(
  '/types/create',
  nonEmptyString(body('name')),
  body('workPackageRequired').isBoolean().not().isEmpty(),
  body('projectRequired').isBoolean().not().isEmpty(),
  validateInputs,
  DescriptionBulletsController.createDescriptionBulletType
);

descriptionBulletsRouter.post(
  '/types/edit',
  nonEmptyString(body('name')),
  body('workPackageRequired').isBoolean().not().isEmpty(),
  body('projectRequired').isBoolean().not().isEmpty(),
  validateInputs,
  DescriptionBulletsController.editDescriptionBulletType
);

export default descriptionBulletsRouter;
