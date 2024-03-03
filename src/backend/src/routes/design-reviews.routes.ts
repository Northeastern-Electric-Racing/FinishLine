import express from 'express';
import { body } from 'express-validator';
import { intMinZero, nonEmptyString, isDate, isDesignReviewStatus } from '../utils/validation.utils';
import DesignReviewController from '../controllers/design-reviews.controllers';
import { validateInputs } from '../utils/utils';
const designReviewRouter = express.Router();

designReviewRouter.post(
  '/:designReviewId/edit',
  isDate(body('dateScheduled')),
  nonEmptyString(body('teamType')),
  body('requiredMembers').isArray(),
  intMinZero(body('requiredMembers.*')),
  body('optionaldMembers').isArray(),
  body('isOnline').isBoolean(),
  body('isInPeron').isBoolean(),
  nonEmptyString(body('zoomLink')).isURL().optional(),
  nonEmptyString(body('location')).optional,
  nonEmptyString(body('docTemplateLink')).isURL().optional(),
  isDesignReviewStatus(body('status')),
  body('confirmedMembers').isArray(),
  intMinZero(body('confirmedMembers.*')),
  body('deniedMembers').isArray(),
  intMinZero(body('deniedMembers.*')),
  body('attendees').isArray(),
  intMinZero(body('attendees.*')),
  intMinZero(body('meetingTime')),
  validateInputs,
  DesignReviewController.editDesignReview
);

export default designReviewRouter;
