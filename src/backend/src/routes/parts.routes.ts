import express from 'express';
import {
  intMinZero,
  nonEmptyString,
  partCommonMistakeValidators,
  partFaqValidators,
  partPopupValidators,
  partTagValidators,
  validateInputs
} from '../utils/validation.utils';
import { body } from 'express-validator';
import PartReviewController from '../controllers/part-review.controllers';
import { Review_Status, MAX_FILE_SIZE } from 'shared';
import multer, { memoryStorage } from 'multer';

const upload = multer({ limits: { fileSize: MAX_FILE_SIZE }, storage: memoryStorage() });

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
  nonEmptyString(body('tagIds.*')),
  body('assigneeIds').isArray(),
  nonEmptyString(body('assigneeIds.*')),
  body('reviewerIds').isArray(),
  nonEmptyString(body('reviewerIds.*')),
  validateInputs,
  PartReviewController.createPart
);

partsRouter.post(
  '/review/create',
  nonEmptyString(body('submissionId')),
  body('notes').optional().isString(),
  body('fileIds').isArray(),
  nonEmptyString(body('fileIds.*')),
  body('status').custom((value) => Object.values<string>(Review_Status).includes(value)),
  validateInputs,
  PartReviewController.createReview
);

partsRouter.post(
  '/review/:reviewId/update',
  body('notes').optional().isString(),
  body('fileIds').optional().isArray(),
  nonEmptyString(body('fileIds.*')),
  body('status')
    .optional()
    .custom((value) => Object.values<string>(Review_Status).includes(value)),
  validateInputs,
  PartReviewController.updateReview
);

partsRouter.post('/review/:reviewId/delete', PartReviewController.deleteReview);

partsRouter.post(
  '/submission/create',
  nonEmptyString(body('partId')),
  nonEmptyString(body('name')),
  body('notes').optional().isString(),
  body('fileIds').isArray(),
  nonEmptyString(body('fileIds.*')),
  validateInputs,
  PartReviewController.createSubmission
);

partsRouter.post(
  '/submission/:submissionId/update',
  nonEmptyString(body('name')),
  body('notes').optional().isString(),
  validateInputs,
  PartReviewController.updateSubmission
);

partsRouter.get('/tags', PartReviewController.getAllPartTags);
partsRouter.get('/faqs', PartReviewController.getAllPartReviewFAQS);

partsRouter.post('/tag/create', ...partTagValidators, validateInputs, PartReviewController.createPartTag);

partsRouter.post('/tag/:partTagId/update', ...partTagValidators, validateInputs, PartReviewController.updatePartTag);

partsRouter.post('/tag/:partTagId/delete', PartReviewController.deletePartTag);

partsRouter.post('/faqs/create', ...partFaqValidators, validateInputs, PartReviewController.createFaq);

partsRouter.post('/faqs/:faqId/update', ...partFaqValidators, validateInputs, PartReviewController.updateFaq);

partsRouter.post('/faqs/:faqId/delete', PartReviewController.deleteFaq);

partsRouter.get('/common-mistakes', PartReviewController.getAllCommonMistakes);

partsRouter.post(
  '/common-mistake/create',
  ...partCommonMistakeValidators,
  validateInputs,
  PartReviewController.createCommonMistake
);

partsRouter.post(
  '/common-mistake/:commonMistakeId/update',
  ...partCommonMistakeValidators,
  validateInputs,
  PartReviewController.updateCommonMistake
);

partsRouter.post(
  '/review/:reviewId/popup/create',
  ...partPopupValidators,
  validateInputs,
  PartReviewController.createPartReviewPopup
);

partsRouter.post(
  '/popup/:popupId/update',
  ...partPopupValidators,
  validateInputs,
  PartReviewController.updatePartReviewPopup
);

partsRouter.post(
  '/partReviewSampleImage/update',
  upload.single('partReviewSampleImage'),
  PartReviewController.setPartReviewSampleImage
);
partsRouter.get('/partReviewSampleImage', PartReviewController.getPartReviewSampleImage);

partsRouter.post('/common-mistake/:commonMistakeId/delete', PartReviewController.deleteCommonMistake);
partsRouter.post('/popup/:popupId/delete', PartReviewController.deletePartReviewPopup);

partsRouter.post('/reviewRequest/:reviewRequestId/delete', PartReviewController.deletePartReviewRequest);

partsRouter.post(
  '/notifyReviewer',
  nonEmptyString(body('reviewerId')),
  nonEmptyString(body('partId')),
  validateInputs,
  PartReviewController.notifyReviewer
);

partsRouter.post(
  '/notifyAssignee',
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
  nonEmptyString(body('tagIds.*')),
  body('assigneeIds').isArray(),
  nonEmptyString(body('assigneeIds.*')),
  validateInputs,
  PartReviewController.updatePart
);

partsRouter.post('/:partId/delete', PartReviewController.deletePart);

partsRouter.get('/:wbsNum', PartReviewController.getAllPartsForProject);

partsRouter.get('/submission/:submissionId/download', PartReviewController.downloadFile);

export default partsRouter;
