import express from 'express';
import { body } from 'express-validator';
import { ChangeRequestReason, ChangeRequestType } from 'shared';
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
  body('reviewNotes').isString(),
  body('accepted').isBoolean(),
  body('psId').optional().isString().not().isEmpty(),
  validateInputs,
  ChangeRequestsController.reviewChangeRequest
);

changeRequestsRouter.post(
  '/new/activation',
  nonEmptyString(body('submitterId')),
  intMinZero(body('wbsNum.carNumber')),
  intMinZero(body('wbsNum.projectNumber')),
  intMinZero(body('wbsNum.workPackageNumber')),
  body('type').custom((value) => value === ChangeRequestType.Activation),
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
  body('type').custom((value) => value === ChangeRequestType.StageGate),
  body('confirmDone').isBoolean(),
  validateInputs,
  ChangeRequestsController.createStageGateChangeRequest
);

changeRequestsRouter.post(
  '/new/budget',
  nonEmptyString(body('submitterId')),
  nonEmptyString(body('otherReasonId')).optional(),
  nonEmptyString(body('accountCodeId')).optional(),
  body('type').custom((value) => value === ChangeRequestType.Budget),
  intMinZero(body('proposedBudget')),
  validateInputs,
  ChangeRequestsController.createBudgetChangeRequest
);

changeRequestsRouter.post(
  '/new/standard',
  nonEmptyString(body('what')),
  intMinZero(body('wbsNum.carNumber')),
  intMinZero(body('wbsNum.projectNumber')),
  intMinZero(body('wbsNum.workPackageNumber')),
  body('type').custom(
    (value) =>
      value === ChangeRequestType.Other || value === ChangeRequestType.Issue || value === ChangeRequestType.Redefinition
  ),
  body('why').isArray(),
  nonEmptyString(body('why.*.explain')),
  body('why.*.type').custom((value) => Object.values(ChangeRequestReason).includes(value)),
  body('proposedSolutions').isArray({ min: 0 }),
  nonEmptyString(body('proposedSolutions.*.description')),
  nonEmptyString(body('proposedSolutions.*.scopeImpact')),
  body('proposedSolutions.*.timelineImpact').isInt(),
  body('proposedSolutions.*.budgetImpact').isInt(),
  ...projectProposedChangesValidators,
  ...workPackageProposedChangesValidators('workPackageProposedChanges'),
  validateInputs,
  ChangeRequestsController.createStandardChangeRequest
);

changeRequestsRouter.delete('/:crId/delete', ChangeRequestsController.deleteChangeRequest);

changeRequestsRouter.post(
  '/new/proposed-solution',
  nonEmptyString(body('submitterId')),
  nonEmptyString(body('crId')),
  nonEmptyString(body('description')),
  nonEmptyString(body('scopeImpact')),
  body('timelineImpact').isInt(),
  body('budgetImpact').isInt(),
  validateInputs,
  ChangeRequestsController.addProposedSolution
);

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
