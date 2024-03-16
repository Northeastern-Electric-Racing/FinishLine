import express from 'express';
import { body } from 'express-validator';
import { intMinZero, nonEmptyString, isDate, isDesignReviewStatus } from '../utils/validation.utils';
import DesignReviewsController from '../controllers/design-reviews.controllers';
import { validateInputs } from '../utils/utils';
const designReviewsRouter = express.Router();

designReviewsRouter.get('/', DesignReviewsController.getAllDesignReviews);

designReviewsRouter.delete('/:designReviewId/delete', DesignReviewsController.deleteDesignReview);
designReviewsRouter.get('/:designReviewId', DesignReviewsController.getSingleDesignReview);

designReviewsRouter.post(
  '/:designReviewId/edit',
  isDate(body('dateScheduled')),
  nonEmptyString(body('teamType')),
  body('requiredMembers').isArray(),
  intMinZero(body('requiredMembers.*')),
  body('optionalMembers').isArray(),
  intMinZero(body('optionalMembers.*')),
  body('isOnline').isBoolean(),
  body('isInPerson').isBoolean(),
  nonEmptyString(body('zoomLink')).isURL().optional(),
  nonEmptyString(body('location')).optional(),
  nonEmptyString(body('docTemplateLink')).isURL().optional(),
  isDesignReviewStatus(body('status')),
  body('attendees').isArray(),
  intMinZero(body('attendees.*')),
  body('meetingTimes').isArray(),
  intMinZero(body('meetingTimes.*')),
  validateInputs,
  DesignReviewsController.editDesignReviews
);

export default designReviewsRouter;
