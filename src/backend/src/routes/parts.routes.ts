import express from 'express';
import { nonEmptyString, validateInputs } from '../utils/validation.utils';
import { body } from 'express-validator';
import PartsReviewController from '../controllers/part-review.controllers';

const partsRouter = express.Router();

partsRouter.post(
  '/faq/create',
  nonEmptyString(body('question')),
  nonEmptyString(body('answer')),
  validateInputs,
  PartsReviewController.createFaq
);

partsRouter.post(
  '/faq/:faqId/update',
  nonEmptyString(body('question')),
  nonEmptyString(body('answer')),
  validateInputs,
  PartsReviewController.updateFaq
);

partsRouter.post('/faq/:faqId/delete', PartsReviewController.deleteFaq);

export default partsRouter;
