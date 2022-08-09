import express from 'express';
import { body } from 'express-validator';
import { ChangeRequestReason, ChangeRequestType } from 'shared';
import {
  createActivationChangeRequest,
  createStageGateChangeRequest,
  createStandardChangeRequest,
  getAllChangeRequests,
  getChangeRequestByID,
  reviewChangeRequest
} from '../controllers/change-requests.controllers';

const changeRequestsRouter = express.Router();

changeRequestsRouter.get('/', getAllChangeRequests);
changeRequestsRouter.get('/:crId', getChangeRequestByID);
changeRequestsRouter.post(
  '/review',
  body('reviewerId').isInt({ min: 0 }),
  body('crId').isInt({ min: 0 }),
  body('reviewNotes').not().isEmpty(),
  body('accepted').isBoolean(),
  reviewChangeRequest
);
changeRequestsRouter.post(
  '/new/activation',
  body('submitterId').isInt({ min: 0 }),
  body('wbsNum.carNumber').isInt({ min: 0 }),
  body('wbsNum.projectNumber').isInt({ min: 0 }),
  body('wbsNum.workPackageNumber').isInt({ min: 0 }),
  body('type').custom((value) => value === ChangeRequestType.Activation),
  body('startDate').isDate(),
  body('projectLeadId').isInt({ min: 0 }),
  body('projectManagerId').isInt({ min: 0 }),
  body('confirmDetails').isBoolean(),
  createActivationChangeRequest
);
changeRequestsRouter.post(
  '/new/stage-gate',
  body('submitterId').isInt({ min: 0 }),
  body('wbsNum.carNumber').isInt({ min: 0 }),
  body('wbsNum.projectNumber').isInt({ min: 0 }),
  body('wbsNum.workPackageNumber').isInt({ min: 0 }),
  body('type').custom((value) => value === ChangeRequestType.StageGate),
  body('leftoverBudget').isInt({ min: 0 }),
  body('confirmDone').isBoolean(),
  createStageGateChangeRequest
);
changeRequestsRouter.post(
  '/new/standard',
  body('submitterId').isInt({ min: 0 }),
  body('wbsNum.carNumber').isInt({ min: 0 }),
  body('wbsNum.projectNumber').isInt({ min: 0 }),
  body('wbsNum.workPackageNumber').isInt({ min: 0 }),
  body('type').custom(
    (value) =>
      value === ChangeRequestType.Other ||
      value === ChangeRequestType.Issue ||
      value === ChangeRequestType.Redefinition
  ),
  body('scopeImpact').not().isEmpty(),
  body('budgetImpact').isInt({ min: 0 }),
  body('timelineImpact').isInt({ min: 0 }),
  body('why').isArray(),
  body('why.*.explain').not().isEmpty(),
  body('why.*.type').custom((value) => Object.values(ChangeRequestReason).includes(value)),
  createStandardChangeRequest
);

export default changeRequestsRouter;
