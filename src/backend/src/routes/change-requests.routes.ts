import express from 'express';
import { body } from 'express-validator';
import { ChangeRequestReason, ChangeRequestType } from 'shared';
import CRController from '../controllers/change-requests.controllers';
import { validateInputs } from '../utils/utils';
import { intMinZero, nonEmptyString } from '../utils/validation.utils';
const changeRequestsRouter = express.Router();

changeRequestsRouter.get('/', CRController.getAllChangeRequests);
changeRequestsRouter.get('/:crId', CRController.getChangeRequestByID);
changeRequestsRouter.post(
  '/review',
  intMinZero(body('reviewerId')),
  intMinZero(body('crId')),
  body('reviewNotes').isString(),
  body('accepted').isBoolean(),
  body('psId').optional().isString().not().isEmpty(),
  validateInputs,
  CRController.reviewChangeRequest
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
  CRController.createActivationChangeRequest
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
  CRController.createStageGateChangeRequest
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
  CRController.createStandardChangeRequest
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
  CRController.addProposedSolution
);

export default changeRequestsRouter;
