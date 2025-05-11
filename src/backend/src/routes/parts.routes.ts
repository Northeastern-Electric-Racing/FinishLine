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
partsRouter.get('/by-project/:wbsNum', PartReviewController.getAllPartsForProject);
partsRouter.get('/by-index/:wbsNum/:indexNum', PartReviewController.getPart);

partsRouter.post('/upload/file', upload.single('file'), PartReviewController.uploadFile);

partsRouter.post(
  '/create',
  nonEmptyString(body('wbsNum')),
  intMinZero(body('index')),
  nonEmptyString(body('commonName')),
  body('description').optional().isString(),
  body('reviewStatus').custom((value) => Object.values(Review_Status).includes(value)),
  body('tagIds').isArray(),
  body('assigneeIds').isArray(),
  body('reviewerIds').isArray(),
  validateInputs,
  PartReviewController.createPart
);

partsRouter.post(
  '/review/create',
  nonEmptyString(body('submissionId')),
  body('notes').optional().isString(),
  body('fileIds').isArray(),
  body('status').custom((value) => Object.values<string>(Review_Status).includes(value)),
  validateInputs,
  PartReviewController.createReview
);

partsRouter.post(
  '/review/:reviewId/update',
  body('notes').optional().isString(),
  body('fileIds').isArray().optional(),
  body('status')
    .custom((value) => Object.values<string>(Review_Status).includes(value))
    .optional(),
  validateInputs,
  PartReviewController.updateReview
);

partsRouter.post(
  '/submission/create',
  nonEmptyString(body('partId')),
  nonEmptyString(body('name')),
  body('notes').optional().isString(),
  body('fileIds').isArray(),
  validateInputs,
  PartReviewController.createSubmission
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
  '/faqs/create',
  nonEmptyString(body('question')),
  nonEmptyString(body('answer')),
  validateInputs,
  PartReviewController.createFaq
);

partsRouter.post(
  '/faqs/:faqId/update',
  nonEmptyString(body('question')),
  nonEmptyString(body('answer')),
  validateInputs,
  PartReviewController.updateFaq
);

partsRouter.post('/faqs/:faqId/delete', PartReviewController.deleteFaq);

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
  '/review/:reviewId/popup/create',
  body('xCoord').isFloat(),
  body('yCoord').isFloat(),
  intMinZero(body('fileIndex')),
  nonEmptyString(body('title')),
  body('description').optional().isString(),

  validateInputs,
  PartReviewController.createPartReviewPopup
);

partsRouter.post(
  '/popup/:popupId/update',
  body('xCoord').isFloat(),
  body('yCoord').isFloat(),
  intMinZero(body('fileIndex')),
  nonEmptyString(body('title')),
  body('description').optional().isString(),
  validateInputs,
  PartReviewController.updatePartReviewPopup
);

partsRouter.post('/common-mistake/:commonMistakeId/delete', PartReviewController.deleteCommonMistake);
partsRouter.post('/popup/:popupId/delete', PartReviewController.deletePartReviewPopup);

partsRouter.post('/reviewRequest/:reviewRequestId/delete', PartReviewController.deletePartReviewRequest);

partsRouter.post('/notifyReviewer',
  nonEmptyString(body('reviewerId')),
  nonEmptyString(body('partId')),
  validateInputs,
  PartReviewController.notifyReviewer
);

partsRouter.post('/notifyAssignee',
  nonEmptyString(body('assigneeId')),
  nonEmptyString(body('partId')),
  validateInputs,
  PartReviewController.notifyAssignee
);

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


partsRouter.get('/submission/:submissionId/download', PartReviewController.downloadFile);

export default partsRouter;
