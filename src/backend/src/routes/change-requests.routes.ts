import express from 'express';
import { body } from 'express-validator';
import ChangeRequestsController from '../controllers/change-requests.controllers.js';
import {
  intMinZero,
  isDateOnly,
  nonEmptyString,
  projectProposedChangesValidators,
  validateInputs,
  workPackageProposedChangesValidators
} from '../utils/validation.utils.js';

const changeRequestsRouter = express.Router();

changeRequestsRouter.get('/', ChangeRequestsController.getAllChangeRequests);
changeRequestsRouter.get('/guest', ChangeRequestsController.getAllGuestChangeRequests);

changeRequestsRouter.get('/to-review', ChangeRequestsController.getToReviewChangeRequests);
changeRequestsRouter.get('/unreviewed', ChangeRequestsController.getUnreviewedChangeRequests);
changeRequestsRouter.get('/approved', ChangeRequestsController.getApprovedChangeRequests);

changeRequestsRouter.get('/:crId', ChangeRequestsController.getChangeRequestByID);

changeRequestsRouter.post(
  '/review',
  nonEmptyString(body('reviewerId')),
  nonEmptyString(body('crId')),
  body('reviewNotes').isString().optional(),
  body('accepted').isBoolean(),
  validateInputs,
  ChangeRequestsController.reviewChangeRequest
);

changeRequestsRouter.post(
  '/new/activation',
  nonEmptyString(body('submitterId')),
  intMinZero(body('wbsNum.carNumber')),
  intMinZero(body('wbsNum.projectNumber')),
  intMinZero(body('wbsNum.workPackageNumber')),
  isDateOnly(body('startDate')),
  nonEmptyString(body('leadId')),
  nonEmptyString(body('managerId')),
  body('confirmDetails').isBoolean(),
  validateInputs,
  ChangeRequestsController.createActivationChangeRequest
);

changeRequestsRouter.post(
  '/new/stage-gate',
  nonEmptyString(body('submitterId')),
  intMinZero(body('wbsNum.carNumber')),
  intMinZero(body('wbsNum.projectNumber')),
  intMinZero(body('wbsNum.workPackageNumber')),
  body('confirmDone').isBoolean(),
  validateInputs,
  ChangeRequestsController.createStageGateChangeRequest
);

changeRequestsRouter.post(
  '/new/budget',
  nonEmptyString(body('submitterId')),
  nonEmptyString(body('otherReasonId')).optional(),
  nonEmptyString(body('accountCodeId')).optional(),
  intMinZero(body('proposedBudget')),
  validateInputs,
  ChangeRequestsController.createBudgetChangeRequest
);

changeRequestsRouter.post(
  '/new/standard',
  intMinZero(body('wbsNum.carNumber')),
  intMinZero(body('wbsNum.projectNumber')),
  intMinZero(body('wbsNum.workPackageNumber')),
  nonEmptyString(body('why')),
  nonEmptyString(body('requestedReviewerId')).optional(),
  ...projectProposedChangesValidators,
  ...workPackageProposedChangesValidators('workPackageProposedChanges'),
  validateInputs,
  ChangeRequestsController.createStandardChangeRequest
);

changeRequestsRouter.delete('/:crId/delete', ChangeRequestsController.deleteChangeRequest);

changeRequestsRouter.post(
  '/:crId/request-review',
  body('userIds').isArray(),
  nonEmptyString(body('userIds.*')),
  validateInputs,
  ChangeRequestsController.requestCRReview
);

changeRequestsRouter.post(
  '/new/leadership',
  intMinZero(body('wbsNum.carNumber')),
  intMinZero(body('wbsNum.projectNumber')),
  intMinZero(body('wbsNum.workPackageNumber')),
  nonEmptyString(body('leadId')).optional(),
  nonEmptyString(body('managerId')).optional(),
  validateInputs,
  ChangeRequestsController.createLeadershipChangeRequest
);

export default changeRequestsRouter;
