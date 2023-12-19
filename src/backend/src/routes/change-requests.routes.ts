import express from 'express';
import { body } from 'express-validator';
import { ChangeRequestReason, ChangeRequestType } from 'shared';
import ChangeRequestsController from '../controllers/change-requests.controllers';
import { validateInputs } from '../utils/utils';
import { intMinZero, nonEmptyString } from '../utils/validation.utils';

const changeRequestsRouter = express.Router();

changeRequestsRouter.get('/', ChangeRequestsController.getAllChangeRequests);

changeRequestsRouter.get('/:crId', ChangeRequestsController.getChangeRequestByID);

changeRequestsRouter.post(
  '/review',
  intMinZero(body('reviewerId')),
  intMinZero(body('crId')),
  body('reviewNotes').isString(),
  body('accepted').isBoolean(),
  body('psId').optional().isString().not().isEmpty(),
  validateInputs,
  ChangeRequestsController.reviewChangeRequest
);

changeRequestsRouter.post(
  '/new/activation',
  intMinZero(body('submitterId')),
  intMinZero(body('wbsNum.carNumber')),
  intMinZero(body('wbsNum.projectNumber')),
  intMinZero(body('wbsNum.workPackageNumber')),
  body('type').custom((value) => value === ChangeRequestType.Activation),
  body('startDate').custom((value) => !isNaN(Date.parse(value))),
  intMinZero(body('projectLeadId')),
  intMinZero(body('projectManagerId')),
  body('confirmDetails').isBoolean(),
  validateInputs,
  ChangeRequestsController.createActivationChangeRequest
);

changeRequestsRouter.post(
  '/new/stage-gate',
  intMinZero(body('submitterId')),
  intMinZero(body('wbsNum.carNumber')),
  intMinZero(body('wbsNum.projectNumber')),
  intMinZero(body('wbsNum.workPackageNumber')),
  body('type').custom((value) => value === ChangeRequestType.StageGate),
  body('confirmDone').isBoolean(),
  validateInputs,
  ChangeRequestsController.createStageGateChangeRequest
);

changeRequestsRouter.post(
  '/new/standard',
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
  body('proposedSolutions').isArray({ min: 1 }),
  nonEmptyString(body('proposedSolutions.*.description')),
  nonEmptyString(body('proposedSolutions.*.scopeImpact')),
  body('proposedSolutions.*.timelineImpact').isInt(),
  body('proposedSolutions.*.budgetImpact').isInt(),
  validateInputs,
  ChangeRequestsController.createStandardChangeRequest
);

changeRequestsRouter.delete('/:crId/delete', ChangeRequestsController.deleteChangeRequest);

changeRequestsRouter.post(
  '/new/proposed-solution',
  intMinZero(body('submitterId')),
  intMinZero(body('crId')),
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
  intMinZero(body('userIds.*')),
  validateInputs,
  ChangeRequestsController.requestCRReview
);

export default changeRequestsRouter;
