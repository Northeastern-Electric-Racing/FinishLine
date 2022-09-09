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

const changeRequestsRouter = express.Router();

changeRequestsRouter.get('/', getAllChangeRequests);
changeRequestsRouter.get('/:crId', getChangeRequestByID);
changeRequestsRouter.post(
  '/review',
  body('reviewerId').isInt({ min: 0 }).not().isString(),
  body('crId').isInt({ min: 0 }).not().isString(),
  body('reviewNotes').isString(),
  body('accepted').isBoolean(),
  reviewChangeRequest
);
changeRequestsRouter.post(
  '/new/activation',
  body('submitterId').isInt({ min: 0 }).not().isString(),
  body('wbsNum.carNumber').isInt({ min: 0 }).not().isString(),
  body('wbsNum.projectNumber').isInt({ min: 0 }).not().isString(),
  body('wbsNum.workPackageNumber').isInt({ min: 0 }).not().isString(),
  body('type').custom((value) => value === ChangeRequestType.Activation),
  body('startDate').isDate(),
  body('projectLeadId').isInt({ min: 0 }).not().isString(),
  body('projectManagerId').isInt({ min: 0 }).not().isString(),
  body('confirmDetails').isBoolean(),
  createActivationChangeRequest
);
changeRequestsRouter.post(
  '/new/stage-gate',
  body('submitterId').isInt({ min: 0 }).not().isString(),
  body('wbsNum.carNumber').isInt({ min: 0 }).not().isString(),
  body('wbsNum.projectNumber').isInt({ min: 0 }).not().isString(),
  body('wbsNum.workPackageNumber').isInt({ min: 0 }).not().isString(),
  body('type').custom((value) => value === ChangeRequestType.StageGate),
  body('leftoverBudget').isInt({ min: 0 }).not().isString(),
  body('confirmDone').isBoolean(),
  createStageGateChangeRequest
);
changeRequestsRouter.post(
  '/new/standard',
  body('submitterId').isInt({ min: 0 }).not().isString(),
  body('wbsNum.carNumber').isInt({ min: 0 }).not().isString(),
  body('wbsNum.projectNumber').isInt({ min: 0 }).not().isString(),
  body('wbsNum.workPackageNumber').isInt({ min: 0 }).not().isString(),
  body('type').custom(
    (value) =>
      value === ChangeRequestType.Other ||
      value === ChangeRequestType.Issue ||
      value === ChangeRequestType.Redefinition
  ),
  body('scopeImpact').isString().not().isEmpty(),
  body('budgetImpact').isInt({ min: 0 }).not().isString(),
  body('timelineImpact').isInt({ min: 0 }).not().isString(),
  body('why').isArray(),
  body('why.*.explain').isString().not().isEmpty(),
  body('why.*.type').custom((value) => Object.values(ChangeRequestReason).includes(value)),
  createStandardChangeRequest
);
changeRequestsRouter.post(
  '/new/proposed-solution',
  body('submitterId').isInt({ min: 0 }).not().isString(),
  body('crId').isInt({ min: 0 }).not().isString(),
  body('description').isString().not().isEmpty(),
  body('scopeImpact').isString().not().isEmpty(),
  body('timelineImpact').isInt({ min: 0 }).not().isString(),
  body('budgetImpact').isInt({ min: 0 }).not().isString(),
  addProposedSolution
);

export default changeRequestsRouter;
