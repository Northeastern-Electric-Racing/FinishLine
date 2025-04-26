import express from 'express';
import { intMinZero, nonEmptyString, validateInputs } from '../utils/validation.utils';
import { body } from 'express-validator';
import PartReviewController from '../controllers/part-review.controllers';
import { Review_Status } from 'shared';
import multer, { memoryStorage } from 'multer';

const upload = multer({ limits: { fileSize: 30000000 }, storage: memoryStorage() });

const partsRouter = express.Router();

partsRouter.get('/tags', PartReviewController.getAllPartTags);
partsRouter.get('/faqs', PartReviewController.getAllPartReviewFAQS);
partsRouter.get('/:wbsNum/:indexNum', PartReviewController.getPart);
partsRouter.get('/byProject/:wbsNum', PartReviewController.getAllPartsForProject);

partsRouter.post(
  '/create',
  nonEmptyString(body('wbsNum')),
  intMinZero(body('index')),
  nonEmptyString(body('commonName')),
  body('description').optional().isString(),
  body('reviewStatus').custom((value) => Object.values(Review_Status).includes(value)),
  body('tagIds').isArray(),
  body('assigneeIds').isArray(),
  validateInputs,
  PartReviewController.createPart
);

partsRouter.post(
  '/review/create',
  nonEmptyString(body('submissionId')),
  body('notes').optional().isString(),
  body('status').custom((value) => Object.values<string>(Review_Status).includes(value)),
  validateInputs,
  PartReviewController.createReview
);

partsRouter.post(
  '/review/:reviewId/update',
  body('notes').optional().isString(),
  body('status').custom((value) => Object.values<string>(Review_Status).includes(value)),
  validateInputs,
  PartReviewController.updateReview
);

partsRouter.post(
  '/review/:reviewId/upload-files',
  upload.array('files', 10),
  validateInputs,
  PartReviewController.uploadReviewFiles
);

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
  '/reviews/:reviewId/popup/create',
  nonEmptyString(body('title')),
  nonEmptyString(body('description')),
  body('starred').isBoolean(),
  validateInputs,
  PartReviewController.createPartReviewPopup
);

partsRouter.post(
  '/popup/:popupId/update',
  nonEmptyString(body('title')),
  nonEmptyString(body('description')),
  body('starred').isBoolean(),
  validateInputs,
  PartReviewController.updatePartReviewPopup
);

partsRouter.post('/common-mistake/:commonMistakeId/delete', PartReviewController.deleteCommonMistake);
partsRouter.post('/popup/:popupId/delete', PartReviewController.deletePartReviewPopup);

partsRouter.post(
  '/:partId/reviewRequest/create',
  nonEmptyString(body('reviewerId')),
  validateInputs,
  PartReviewController.createPartReviewRequest
);

partsRouter.post('/:partId/upload-preview', upload.single('image'), PartReviewController.uploadPreview);

partsRouter.post(
  '/:partId/update',
  intMinZero(body('index')),
  nonEmptyString(body('commonName')),
  body('description').optional().isString(),
  body('reviewStatus').custom((value) => Object.values(Review_Status).includes(value)),
  body('tagIds').isArray(),
  body('assigneeIds').isArray(),
  validateInputs,
  PartReviewController.updatePart
);

partsRouter.post('/:partId/delete', PartReviewController.deletePart);

partsRouter.get('/:wbsNum', PartReviewController.getAllPartsForProject);

partsRouter.post('/reviewRequest/:reviewRequestId/delete', PartReviewController.deletePartReviewRequest);

partsRouter.get('/submission/:submissionId/download', PartReviewController.downloadFile);

export default partsRouter;
