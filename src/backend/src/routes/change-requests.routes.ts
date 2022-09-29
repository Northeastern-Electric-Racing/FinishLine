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
import { intMinZero } from '../utils/validation.utils';
const changeRequestsRouter = express.Router();

changeRequestsRouter.get('/', getAllChangeRequests);
changeRequestsRouter.get('/:crId', getChangeRequestByID);
changeRequestsRouter.post(
  '/review',
  intMinZero(body('reviewerId')),
  body('crId').isInt({ min: 0 }).not().isString(),
  body('reviewNotes').isString(),
  body('accepted').isBoolean(),
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
      value === ChangeRequestType.Other ||
      value === ChangeRequestType.Issue ||
      value === ChangeRequestType.Redefinition
  ),
  body('scopeImpact').isString().not().isEmpty(),
  intMinZero(body('budgetImpact')),
  intMinZero(body('timelineImpact')),
  body('why').isArray(),
  body('why.*.explain').isString().not().isEmpty(),
  body('why.*.type').custom((value) => Object.values(ChangeRequestReason).includes(value)),
  createStandardChangeRequest
);
changeRequestsRouter.post(
  '/new/proposed-solution',
  intMinZero(body('submitterId')),
  intMinZero(body('crId')),
  body('description').isString().not().isEmpty(),
  body('scopeImpact').isString().not().isEmpty(),
  intMinZero(body('timelineImpact')),
  intMinZero(body('budgetImpact')),
  addProposedSolution
);

export default changeRequestsRouter;
