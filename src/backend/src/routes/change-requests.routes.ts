import express from 'express';
import { body } from 'express-validator';
import { ChangeRequestReason, ChangeRequestType } from 'shared';
import {
  createActivationChangeRequest,
  createStageGateChangeRequest,
  createStandardChangeRequest,
  getAllChangeRequests,
  getChangeRequestByID,
  reviewChangeRequest,
  addProposedSolution
} from '../controllers/change-requests.controllers';
import { validateInputs } from '../utils/utils';
import { intMinZero, nonEmptyString } from '../utils/validation.utils';
const changeRequestsRouter = express.Router();

changeRequestsRouter.get('/', getAllChangeRequests);
changeRequestsRouter.get('/:crId', getChangeRequestByID);
changeRequestsRouter.post(
  '/review',
  intMinZero(body('reviewerId')),
  intMinZero(body('crId')),
  body('reviewNotes').isString(),
  body('accepted').isBoolean(),
  body('psId').optional().isString().not().isEmpty(),
  validateInputs,
  reviewChangeRequest
);
changeRequestsRouter.post(
  '/new/activation',
  intMinZero(body('submitterId')),
  intMinZero(body('wbsNum.carNumber')),
  intMinZero(body('wbsNum.projectNumber')),
  intMinZero(body('wbsNum.workPackageNumber')),
  body('type').custom((value) => value === ChangeRequestType.Activation),
  body('startDate').isDate(),
  intMinZero(body('projectLeadId')),
  intMinZero(body('projectManagerId')),
  body('confirmDetails').isBoolean(),
  validateInputs,
  createActivationChangeRequest
);
changeRequestsRouter.post(
  '/new/stage-gate',
  intMinZero(body('submitterId')),
  intMinZero(body('wbsNum.carNumber')),
  intMinZero(body('wbsNum.projectNumber')),
  intMinZero(body('wbsNum.workPackageNumber')),
  body('type').custom((value) => value === ChangeRequestType.StageGate),
  intMinZero(body('leftoverBudget')),
  body('confirmDone').isBoolean(),
  validateInputs,
  createStageGateChangeRequest
);
changeRequestsRouter.post(
  '/new/standard',
  intMinZero(body('submitterId')),
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
  validateInputs,
  createStandardChangeRequest
);
changeRequestsRouter.post(
  '/new/proposed-solution',
  intMinZero(body('submitterId')),
  intMinZero(body('crId')),
  nonEmptyString(body('description')),
  nonEmptyString(body('scopeImpact')),
  intMinZero(body('timelineImpact')),
  intMinZero(body('budgetImpact')),
  validateInputs,
  addProposedSolution
);

export default changeRequestsRouter;
