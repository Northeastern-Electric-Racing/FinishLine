import express from 'express';
import { body } from 'express-validator';
import { intMinZero, nonEmptyString, isDate, isDesignReviewStatus } from '../utils/validation.utils';
import DesignReviewsController from '../controllers/design-reviews.controllers';
import { validateInputs } from '../utils/utils';
const designReviewsRouter = express.Router();

designReviewsRouter.get('/', DesignReviewsController.getAllDesignReviews);

designReviewsRouter.get('/teamType/all', DesignReviewsController.getAllTeamTypes);

designReviewsRouter.delete('/:designReviewId/delete', DesignReviewsController.deleteDesignReview);
designReviewsRouter.get('/:designReviewId', DesignReviewsController.getSingleDesignReview);

designReviewsRouter.post(
  '/create',
  isDate(body('dateScheduled')),
  nonEmptyString(body('teamTypeId')),
  body('requiredMemberIds').isArray(),
  intMinZero(body('requiredMemberIds.*')),
  body('optionalMemberIds').isArray(),
  intMinZero(body('optionalMemberIds.*')),
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
  intMinZero(body('requiredMembersIds.*')),
  body('optionalMembersIds').isArray(),
  intMinZero(body('optionalMembersIds.*')),
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
