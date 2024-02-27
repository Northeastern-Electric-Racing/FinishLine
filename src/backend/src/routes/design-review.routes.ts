import express from 'express';
import DesignReviewController from '../controllers/design-review.controllers';
import { validateInputs } from '../utils/utils';
import { body } from 'express-validator';
import { intMinZero, nonEmptyString } from '../utils/validation.utils';

const designReviewRouter = express.Router();

designReviewRouter.post(
    '/create',
    nonEmptyString(body('dateScheduled')),
    body('teamType*'),
    body('requiredMembers').isArray(),
    body('optionalMembers').isArray(),
    nonEmptyString(body('location').optional()),
    body('isOnline').isBoolean(),
    body('isInPerson').isBoolean(),
    nonEmptyString(body('zoomLink').optional()),
    body('docTemplateLink').optional(),
    intMinZero(body('wbsElementId')),
    body('meetingTime').isArray(),
    validateInputs,
    DesignReviewController.createDesignReview
  );

export default designReviewRouter;
