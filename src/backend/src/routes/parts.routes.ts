import express from 'express';
import { nonEmptyString, validateInputs } from '../utils/validation.utils';
import { body } from 'express-validator';
import PartReviewController from '../controllers/part-review.controllers';

const partsRouter = express.Router();

partsRouter.post(
  '/partTag/create',
  nonEmptyString(body('name')),
  nonEmptyString(body('colorHexCode')),
  validateInputs,
  PartReviewController.createPartTag
);

partsRouter.post(
  '/partTag/:partTagId/update',
  nonEmptyString(body('name')),
  nonEmptyString(body('colorHexCode')),
  validateInputs,
  PartReviewController.updatePartTag
);

partsRouter.post('partTag/:partTagId/delete', PartReviewController.deletePartTag);

export default partsRouter;
