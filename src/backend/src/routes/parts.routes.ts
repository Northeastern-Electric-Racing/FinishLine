import express from 'express';
import { nonEmptyString, validateInputs } from '../utils/validation.utils';
import { body } from 'express-validator';
import PartsReviewController from '../controllers/part-review.controllers';

const partsRouter = express.Router();

partsRouter.get('/tags', PartsReviewController.getAllPartTags);
partsRouter.get('/faqs', PartsReviewController.getAllPartReviewFAQS);

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

partsRouter.get('/common-mistakes', PartsReviewController.getAllCommonMistakes);

partsRouter.post(
  '/common-mistake/create',
  nonEmptyString(body('title')),
  nonEmptyString(body('description')),
  body('starred').isBoolean(),
  validateInputs,
  PartsReviewController.createCommonMistake
);

partsRouter.post(
  '/common-mistake/:commonMistakeId/update',
  nonEmptyString(body('title')),
  nonEmptyString(body('description')),
  body('starred').isBoolean(),
  validateInputs,
  PartsReviewController.updateCommonMistake
);

partsRouter.post('/common-mistake/:commonMistakeId/delete', PartsReviewController.deleteCommonMistake);

export default partsRouter;
