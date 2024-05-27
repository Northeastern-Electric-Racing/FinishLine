import express from 'express';
import { body } from 'express-validator';
import { intMinZero, nonEmptyString, isDate, isDesignReviewStatus, validateInputs } from '../utils/validation.utils';
import DesignReviewsController from '../controllers/design-reviews.controllers';
const designReviewsRouter = express.Router();

designReviewsRouter.get('/', DesignReviewsController.getAllDesignReviews);

designReviewsRouter.delete('/:designReviewId/delete', DesignReviewsController.deleteDesignReview);
designReviewsRouter.get('/:designReviewId', DesignReviewsController.getSingleDesignReview);

designReviewsRouter.post(
  '/create',
  isDate(body('dateScheduled')),
  nonEmptyString(body('teamTypeId')),
  body('requiredMemberIds').isArray(),
  nonEmptyString(body('requiredMemberIds.*')),
  body('optionalMemberIds').isArray(),
  nonEmptyString(body('optionalMemberIds.*')),
  intMinZero(body('wbsNum.carNumber')),
  intMinZero(body('wbsNum.projectNumber')),
  intMinZero(body('wbsNum.workPackageNumber')),
  body('meetingTimes').isArray(),
  intMinZero(body('meetingTimes.*')),
  validateInputs,
  DesignReviewsController.createDesignReview
);

designReviewsRouter.post(
  '/:designReviewId/edit',
  isDate(body('dateScheduled')),
  nonEmptyString(body('teamTypeId')),
  body('requiredMembersIds').isArray(),
  nonEmptyString(body('requiredMembersIds.*')),
  body('optionalMembersIds').isArray(),
  nonEmptyString(body('optionalMembersIds.*')),
  body('isOnline').isBoolean(),
  body('isInPerson').isBoolean(),
  nonEmptyString(body('zoomLink')).isURL().optional(),
  nonEmptyString(body('location')).optional(),
  nonEmptyString(body('docTemplateLink')).isURL().optional(),
  isDesignReviewStatus(body('status')),
  body('attendees').isArray(),
  nonEmptyString(body('attendees.*')),
  body('meetingTimes').isArray(),
  intMinZero(body('meetingTimes.*')),
  validateInputs,
  DesignReviewsController.editDesignReviews
);

designReviewsRouter.post(
  '/:designReviewId/confirm-schedule',
  body('availability').isArray(),
  intMinZero(body('availability.*')),
  validateInputs,
  DesignReviewsController.markUserConfirmed
);

export default designReviewsRouter;
