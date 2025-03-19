import express from 'express';
import { nonEmptyString, validateInputs } from '../utils/validation.utils';
import { body } from 'express-validator';
import PartReviewController from '../controllers/part-review.controllers';

const partsRouter = express.Router();

partsRouter.get('/tags', PartReviewController.getAllPartTags);
partsRouter.get('/faqs', PartReviewController.getAllPartReviewFAQS);

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

partsRouter.post('/partTag/:partTagId/delete', PartReviewController.deletePartTag);

partsRouter.post(
  '/faq/create',
  nonEmptyString(body('question')),
  nonEmptyString(body('answer')),
  validateInputs,
  PartReviewController.createFaq
);

partsRouter.post(
  '/faq/:faqId/update',
  nonEmptyString(body('question')),
  nonEmptyString(body('answer')),
  validateInputs,
  PartReviewController.updateFaq
);

partsRouter.post('/faq/:faqId/delete', PartReviewController.deleteFaq);

partsRouter.get('/common-mistakes', PartReviewController.getAllCommonMistakes);

partsRouter.post(
  '/common-mistake/create',
  nonEmptyString(body('title')),
  nonEmptyString(body('description')),
  body('starred').isBoolean(),
  validateInputs,
  PartReviewController.createCommonMistake
);

partsRouter.post(
  '/common-mistake/:commonMistakeId/update',
  nonEmptyString(body('title')),
  nonEmptyString(body('description')),
  body('starred').isBoolean(),
  validateInputs,
  PartReviewController.updateCommonMistake
);

partsRouter.post(
  '/popup/:reviewId/create',
  nonEmptyString(body('title')),
  nonEmptyString(body('description')),
  body('starred').isBoolean(),
  validateInputs,
  PartReviewController.createPartReviewPopup
)

partsRouter.post(
  '/popup/:reviewId/update',
  nonEmptyString(body('title')),
  nonEmptyString(body('description')),
  body('starred').isBoolean(),
  validateInputs,
  PartReviewController.updatePartReviewPopup
)

partsRouter.post(
  '/popup/:reviewId/delete',
  nonEmptyString(body('title')),
  nonEmptyString(body('description')),
  body('starred').isBoolean(),
  validateInputs,
  PartReviewController.deletePartReviewPopup
)



partsRouter.post('/common-mistake/:commonMistakeId/delete', PartReviewController.deleteCommonMistake);

export default partsRouter;
