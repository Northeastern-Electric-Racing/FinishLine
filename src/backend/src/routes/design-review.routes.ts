import express from 'express';
import DesignReviewController from '../controllers/design-review.controllers';
import { validateInputs } from '../utils/utils';
import { body } from 'express-validator';
import { intMinZero, nonEmptyString, isDate } from '../utils/validation.utils';

const designReviewRouter = express.Router();

designReviewRouter.get('/', DesignReviewController.getAllDesignReviews);

designReviewRouter.delete('/:designReviewId/delete', DesignReviewController.deleteDesignReview);
designReviewRouter.get('/:designReviewId', DesignReviewController.getSingleDesignReview);

designReviewRouter.post(
  '/create',
  isDate(body('dateScheduled')),
  nonEmptyString(body('teamTypeId')),
  body('requiredMemberIds').isArray(),
  intMinZero(body('requiredMemberIds.*')),
  body('optionalMemberIds').isArray(),
  intMinZero(body('optionalMemberIds.*')),
  nonEmptyString(body('location').optional()),
  body('isOnline').isBoolean(),
  body('isInPerson').isBoolean(),
  nonEmptyString(body('zoomLink').optional()),
  nonEmptyString(body('docTemplateLink')).optional(),
  intMinZero(body('wbsNumCarNumber')),
  intMinZero(body('wbsNumProjNumber')),
  intMinZero(body('wbsNumWpNumber')),
  body('meetingTimes').isArray(),
  intMinZero(body('meetingTimes.*')),
  validateInputs,
  DesignReviewController.createDesignReview
);

export default designReviewRouter;
